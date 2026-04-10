/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Severity} from 'app/model/Severity';
import {Utilities} from '../../../utils/Utilities';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {UsersService} from '@ofServices/users/UsersService';
import {combineLatest, Observable, ReplaySubject, Subject, takeUntil} from 'rxjs';
import {DashboardPage, Tile, TileCell, CardForDashboard, DashboardCircle} from './DashboardPage';
import {FilteredLightCardsStore} from '../../../store/lightcards/FilteredLightcardsStore';
import {OpfabStore} from '../../../store/OpfabStore';
import {format} from 'date-fns';
import {CustomScreenService} from '@ofServices/customScreen/CustomScreenService';
import {DashboardScreenDefinition, CustomTile} from '@ofServices/customScreen/dashboard/DashboardScreenDefinition';
import {Card} from 'app/model/Card';
import {ScreenType} from '@ofServices/customScreen/ScreenDefinition';
import {CardFilter} from '@ofServices/customScreen/cardList/CardFilter';
import {FilterValues} from '@ofServices/customScreen/cardList/FilterValues';
import {CardListScreenDefinition} from '@ofServices/customScreen/cardList/CardListScreenDefinition';

export class DashboardView {
    private readonly dashboardSubject = new ReplaySubject<DashboardPage>(1);
    private dashboardPage: DashboardPage;
    public noSeverityColor = '#717274';
    private readonly ngUnsubscribe$ = new Subject<void>();
    private readonly filteredLightCardStore: FilteredLightCardsStore;
    private readonly processList: string[];
    private readonly customTiles: CustomTile[];
    private readonly customCardListFilters = new Map<string, CardFilter>();

    constructor(private readonly customScreenId: string) {
        const dashboardScreenDefinition = CustomScreenService.getCustomScreenDefinition(
            this.customScreenId
        ) as DashboardScreenDefinition;
        this.processList = dashboardScreenDefinition?.processList;
        this.customTiles = dashboardScreenDefinition?.customTiles ?? [];
        this.filteredLightCardStore = OpfabStore.getFilteredLightCardStore();
        this.buildTiles();
        this.processLightCards();
        this.dashboardSubject.next(this.dashboardPage);
    }

    private buildTiles() {
        this.dashboardPage = new DashboardPage();
        this.dashboardPage.tiles = new Array();
        if (!this.processList || this.processList.length > 0) {
            ProcessesService.getAllProcesses().forEach((process) => {
                if (this.processList && !this.processList.includes(process.id)) {
                    return;
                }
                const cells = new Array<TileCell>();
                process.states.forEach((state, key) => {
                    if (
                        UsersService.isReceiveRightsForProcessAndState(process.id, key) &&
                        this.isStateNotified(process.id, key)
                    ) {
                        if (!state.isOnlyAChildState) {
                            const cell = new TileCell();
                            cell.id = key;
                            cell.type = 'state';
                            cell.circles = new Array();
                            cell.label = state.name;

                            const circle = new DashboardCircle();
                            circle.color = this.noSeverityColor;
                            circle.numberOfCards = 0;
                            circle.width = 10;
                            cell.circles.push(circle);
                            cells.push(cell);
                        }
                    }
                });
                const tile = new Tile();
                tile.id = process.id;
                tile.label = process.name;
                cells.sort((obj1, obj2) => Utilities.compareObj(obj1.label, obj2.label));
                tile.cells = cells;

                if (tile.cells.length > 0) this.dashboardPage.tiles.push(tile);
            });
            this.dashboardPage.tiles.sort((obj1, obj2) => Utilities.compareObj(obj1.label, obj2.label));
        }

        this.addCustomTiles();
    }

    private processLightCards() {
        combineLatest([
            this.filteredLightCardStore.getBusinessDateFilterChanges(),
            OpfabStore.getLightCardStore().getLightCards()
        ])
            .pipe(takeUntil(this.ngUnsubscribe$))
            .subscribe((results) => {
                const cards = results[1].filter((card) =>
                    this.filteredLightCardStore.getBusinessDateFilter().applyFilter(card)
                );
                this.buildTiles();
                cards.forEach((lightCard) => {
                    this.processOneLightCard(lightCard);
                });
                this.dashboardSubject.next(this.dashboardPage);
            });
    }

    private processOneLightCard(lightCard: Card) {
        const dashboardCard = new CardForDashboard();
        dashboardCard.title = lightCard.titleTranslated;
        dashboardCard.id = lightCard.id;
        dashboardCard.publishDate = format(lightCard.publishDate, 'dd/MM - HH:mm :');
        this.dashboardPage.tiles.forEach((tile) => {
            if (tile.isCustomTile) {
                tile.cells.forEach((cell) => {
                    if (!this.isCardFilteredOnCustomCardListScreen(lightCard, cell.id)) {
                        this.updateCircle(cell, lightCard.severity, dashboardCard);
                    }
                });
            } else if (tile.id === lightCard.process) {
                tile.cells.forEach((cell) => {
                    if (cell.id === lightCard.state && !lightCard.hasBeenAcknowledged) {
                        this.updateCircle(cell, lightCard.severity, dashboardCard);
                    }
                });
            }
        });
    }

    private updateCircle(tileCell: TileCell, severity: Severity, dashboardCard): any {
        let noCircle = true;

        tileCell.circles.forEach((circle) => {
            // Remove a potential grey circle
            if (circle.color === this.noSeverityColor) {
                tileCell.circles.splice(tileCell.circles.indexOf(circle, 0), 1);
            }
            if (circle.severity === severity) {
                circle.numberOfCards += 1;
                circle.width = 10 + 2 * this.getEllipseWidth(circle.numberOfCards);
                circle.cards.push(dashboardCard);
                noCircle = false;
            }
        });

        if (noCircle) {
            const circle = new DashboardCircle();
            circle.color = Utilities.getSeverityColor(severity);
            circle.severity = severity;
            circle.numberOfCards = 1;
            circle.cards = new Array();
            circle.cards.push(dashboardCard);
            circle.width = 10 + 2 * this.getEllipseWidth(circle.numberOfCards);
            tileCell.circles.push(circle);
        }
        tileCell.circles.sort(this.severityCompare);
    }

    private severityCompare(circleA: DashboardCircle, circleB: DashboardCircle) {
        const customOrder = new Map<Severity, number>();
        customOrder.set(Severity.ALARM, 1);
        customOrder.set(Severity.ACTION, 2);
        customOrder.set(Severity.COMPLIANT, 3);
        customOrder.set(Severity.INFORMATION, 4);
        if (customOrder.get(circleA.severity) < customOrder.get(circleB.severity)) {
            return -1;
        } else {
            return 1;
        }
    }

    private getEllipseWidth(count: number) {
        return Math.trunc(Math.log10(count));
    }

    private isStateNotified(id: string, name: string): boolean {
        if (UsersService.getCurrentUserWithPerimeters().processesStatesNotNotified?.has(id)) {
            return UsersService.getCurrentUserWithPerimeters().processesStatesNotNotified.get(id).indexOf(name) <= -1;
        }
        return true;
    }

    private addCustomTiles() {
        this.customTiles.forEach((customTile, index) => {
            const tile = new Tile();

            tile.id = `custom_${index}`;
            tile.label = customTile.title;
            tile.isCustomTile = true;

            const cells: TileCell[] = [];

            (customTile.cells ?? []).forEach((cellDef) => {
                const cell = new TileCell();
                cell.type = 'customScreenLink';
                cell.label = cellDef.label;
                cell.id = cellDef.customScreenId;
                cell.circles = new Array();
                const circle = new DashboardCircle();
                circle.color = this.noSeverityColor;
                circle.numberOfCards = 0;
                circle.width = 10;
                cell.circles.push(circle);
                cells.push(cell);
                this.addCustomCardListDefinition(cell.id);
            });

            tile.cells = cells;

            this.dashboardPage.tiles.push(tile);
        });
    }

    private addCustomCardListDefinition(id: string) {
        const def = CustomScreenService.getCustomScreenDefinition(id);
        if (def?.type === ScreenType.CARD_LIST) {
            const filter = new CardFilter();
            filter.setFilters(new FilterValues(), def as CardListScreenDefinition);
            this.customCardListFilters.set(id, filter);
        }
    }

    private isCardFilteredOnCustomCardListScreen(card: Card, customCardListId: string): boolean {
        const filter = this.customCardListFilters.get(customCardListId);
        if (!filter) return true; // if no filter found, we consider that the card is filtered to avoid displaying cards on custom tiles when the definition is not correctly loaded
        return filter.isCardFiltered(card, null); // we do not need to provide child cards here as it is only used
        // for filter includeCardsWithResponsesFromAllEntities which is always set to true on default cards list screen
    }

    public getDashboardPage(): Observable<DashboardPage> {
        return this.dashboardSubject.asObservable();
    }

    public destroy() {
        this.dashboardSubject.complete();
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }
}
