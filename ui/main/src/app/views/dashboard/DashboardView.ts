/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Severity} from 'app/model/Severity';
import {Utilities} from '../../utils/Utilities';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {UsersService} from '@ofServices/users/UsersService';
import {combineLatest, Observable, ReplaySubject, Subject, takeUntil} from 'rxjs';
import {
    DashboardPage,
    ProcessContent,
    StateContent,
    CardForDashboard,
    DashboardCircle,
    CustomScreenLink
} from './DashboardPage';
import {FilteredLightCardsStore} from '../../store/lightcards/FilteredLightcardsStore';
import {OpfabStore} from '../../store/OpfabStore';
import {format} from 'date-fns';
import {ConfigService} from '@ofServices/config/ConfigService';

export class Dashboard {
    private readonly dashboardSubject = new ReplaySubject<DashboardPage>(1);
    private dashboardPage;
    public noSeverityColor = '#717274';
    private readonly ngUnsubscribe$ = new Subject<void>();
    private readonly filteredLightCardStore: FilteredLightCardsStore;
    private readonly processesCustomScreenLinks: any;

    constructor() {
        this.processesCustomScreenLinks = ConfigService.getConfigValue('dashboard.processCustomLinks', []);
        this.filteredLightCardStore = OpfabStore.getFilteredLightCardStore();
        this.loadProcesses();
        this.processLightCards();
        this.dashboardSubject.next(this.dashboardPage);
    }

    private loadProcesses() {
        this.dashboardPage = new DashboardPage();
        this.dashboardPage.processes = new Array();
        ProcessesService.getAllProcesses().forEach((process) => {
            const statesContent = new Array<StateContent>();
            let hasChildstate = false;
            process.states.forEach((state, key) => {
                if (
                    UsersService.isReceiveRightsForProcessAndState(process.id, key) &&
                    this.isStateNotified(process.id, key)
                ) {
                    if (state.isOnlyAChildState) {
                        hasChildstate = true;
                    } else {
                        const stateContent = new StateContent();
                        stateContent.id = key;
                        stateContent.circles = new Array();
                        stateContent.name = state.name;

                        const circle = new DashboardCircle();
                        circle.color = this.noSeverityColor;
                        circle.numberOfCards = 0;
                        circle.width = 10;
                        stateContent.circles.push(circle);
                        statesContent.push(stateContent);
                    }
                }
            });
            const processContent = new ProcessContent();
            processContent.id = process.id;
            processContent.name = process.name;
            statesContent.sort((obj1, obj2) => Utilities.compareObj(obj1.name, obj2.name));
            processContent.states = statesContent;
            this.addCustomScreenLinks(processContent);

            // Show the process if it has visible states,
            // or if it only has only child states but includes custom screen links (Special case: we want to show custom screen links even if there are no visible states)
            if (processContent.states.length > 0 || (hasChildstate && processContent.customScreenLinks?.length > 0))
                this.dashboardPage.processes.push(processContent);
        });
        this.dashboardPage.processes.sort((obj1, obj2) => Utilities.compareObj(obj1.name, obj2.name));
    }

    private addCustomScreenLinks(processContent: ProcessContent) {
        this.processesCustomScreenLinks.forEach((processCustomScreenLinks) => {
            if (processCustomScreenLinks.processId === processContent.id) {
                processCustomScreenLinks.customLinks?.forEach((processCustomScreenLink) => {
                    const customScreenLink = new CustomScreenLink();
                    customScreenLink.label = processCustomScreenLink.label;
                    customScreenLink.customScreenId = processCustomScreenLink.customScreenId;
                    if (!processContent.customScreenLinks) {
                        processContent.customScreenLinks = [];
                    }
                    processContent.customScreenLinks.push(customScreenLink);
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
                this.loadProcesses();
                cards.forEach((lightCard) => {
                    const dashboardCard = new CardForDashboard();
                    dashboardCard.title = lightCard.titleTranslated;
                    dashboardCard.id = lightCard.id;
                    dashboardCard.publishDate = format(lightCard.publishDate, 'dd/MM - HH:mm :');
                    this.dashboardPage.processes.forEach((processContent) => {
                        if (processContent.id === lightCard.process) {
                            processContent.states.forEach((stateContent) => {
                                if (stateContent.id === lightCard.state && !lightCard.hasBeenAcknowledged) {
                                    this.updateCircle(stateContent, lightCard.severity, dashboardCard);
                                }
                            });
                        }
                    });
                });
                this.dashboardSubject.next(this.dashboardPage);
            });
    }

    private updateCircle(stateContent: StateContent, severity: Severity, dashboardCard): any {
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
        return (Math.log(count) * Math.LOG10E) | 0;
    }

    private isStateNotified(id: string, name: string): boolean {
        if (UsersService.getCurrentUserWithPerimeters().processesStatesNotNotified.has(id)) {
            return UsersService.getCurrentUserWithPerimeters().processesStatesNotNotified.get(id).indexOf(name) <= -1;
        }
        return true;
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
