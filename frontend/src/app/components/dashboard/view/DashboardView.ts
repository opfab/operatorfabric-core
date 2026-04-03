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
import {DashboardScreenDefinition, CustomTile} from '@ofServices/customScreen/model/DashboardScreenDefinition';
import {Card} from 'app/model/Card';

export class DashboardView {
    private readonly dashboardSubject = new ReplaySubject<DashboardPage>(1);
    private dashboardPage: DashboardPage;
    public noSeverityColor = '#717274';
    private readonly ngUnsubscribe$ = new Subject<void>();
    private readonly filteredLightCardStore: FilteredLightCardsStore;
    private readonly processesCustomScreenLinks: any;
    private readonly processList: string[];
    private readonly customTiles: CustomTile[];

    constructor(private readonly customScreenId: string) {
        const dashboardScreenDefinition = CustomScreenService.getCustomScreenDefinition(
            this.customScreenId
        ) as DashboardScreenDefinition;
        this.processesCustomScreenLinks = dashboardScreenDefinition?.processCustomLinks ?? [];
        this.processList = dashboardScreenDefinition?.processList ?? [];
        this.customTiles = dashboardScreenDefinition?.customTiles ?? [];
        this.filteredLightCardStore = OpfabStore.getFilteredLightCardStore();
        this.buildTiles();
        this.processLightCards();
        this.dashboardSubject.next(this.dashboardPage);
    }

    private buildTiles() {
        this.dashboardPage = new DashboardPage();
        this.dashboardPage.tiles = new Array();
        ProcessesService.getAllProcesses().forEach((process) => {
            if (this.processList.length > 0 && !this.processList.includes(process.id)) {
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
            this.addCustomScreenLinks(tile);

            if (tile.cells.length > 0) this.dashboardPage.tiles.push(tile);
        });
        this.dashboardPage.tiles.sort((obj1, obj2) => Utilities.compareObj(obj1.label, obj2.label));

        this.addCustomTiles();
    }

    private addCustomScreenLinks(tile: Tile) {
        this.processesCustomScreenLinks.forEach((processCustomScreenLinks) => {
            if (processCustomScreenLinks.processId === tile.id) {
                processCustomScreenLinks.customLinks?.forEach((processCustomScreenLink) => {
                    const cell = new TileCell();
                    cell.type = 'customScreenLink';
                    cell.label = processCustomScreenLink.label;
                    cell.id = processCustomScreenLink.customScreenId;
                    tile.cells.push(cell);
                });
            }
        });
    }

    private processLightCards() {
        combineLatest([
            this.filteredLightCardStore.getBusinessDateFilterChanges(),
            OpfabStore.getLightCardStore().getLightCards()
        ])
            .pipe(takeUntil(this.ngUnsubscribe$))
            .subscribe((results) => {
                const cards = results[1].filter((card) => results[0].applyFilter(card));
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
            if (tile.id === lightCard.process) {
                tile.cells.forEach((stateContent) => {
                    if (stateContent.id === lightCard.state && !lightCard.hasBeenAcknowledged) {
                        this.updateCircle(stateContent, lightCard.severity, dashboardCard);
                    }
                });
            }
        });
    }

    private updateCircle(stateContent: TileCell, severity: Severity, dashboardCard): any {
        let noCircle = true;

        stateContent.circles.forEach((circle) => {
            // Remove a potential grey circle
            if (circle.color === this.noSeverityColor) {
                stateContent.circles.splice(stateContent.circles.indexOf(circle, 0), 1);
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
            stateContent.circles.push(circle);
        }
        stateContent.circles.sort(this.severityCompare);
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
                cell.circles = [];
                cells.push(cell);
            });

            tile.cells = cells;

            this.dashboardPage.tiles.push(tile);
        });
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
