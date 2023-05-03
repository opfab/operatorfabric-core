/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Severity} from '@ofModel/light-card.model';
import {Utilities} from 'app/business/common/utilities';
import {FilterService} from 'app/business/services/lightcards/filter.service';
import {LightCardsStoreService} from 'app/business/services/lightcards/lightcards-store.service';
import {ProcessesService} from 'app/business/services/processes.service';
import {UserService} from 'app/business/services/user.service';
import moment from 'moment';
import {combineLatest, Observable, ReplaySubject} from 'rxjs';
import {DashboardPage, ProcessContent, StateContent, CardForDashboard, DashboardCircle} from './dashboardPage';

export class Dashboard {
    private dashboardSubject = new ReplaySubject<DashboardPage>(1);
    private dashboardPage;
    public dashboardTimeFilter;
    public noSeverityColor = '#717274';

    constructor(
        private userService: UserService,
        private processesService: ProcessesService,
        private lightCardsStoreService: LightCardsStoreService,
        private filterService: FilterService
    ) {
        this.loadProcesses();
        this.processLightCards();
        this.dashboardSubject.next(this.dashboardPage);
    }

    private loadProcesses() {

        this.dashboardPage = new DashboardPage();
        this.dashboardPage.processes = new Array();
        this.processesService.getAllProcesses().forEach((process) => {
            const statesContent = new Array<StateContent>();
            process.states.forEach((state, key) => {
                if (
                    this.userService.isReceiveRightsForProcessAndState(process.id, key) &&
                    this.isStateNotified(process.id, key) &&
                    !state.isOnlyAChildState
                ) {
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
            });
            const processContent = new ProcessContent();
            processContent.id = process.id;
            processContent.name = process.name;
            statesContent.sort((obj1, obj2) => Utilities.compareObj(obj1.name, obj2.name));
            processContent.states = statesContent;

            if (processContent.states.length > 0) this.dashboardPage.processes.push(processContent);
        });
        this.dashboardPage.processes.sort((obj1, obj2) => Utilities.compareObj(obj1.name, obj2.name));
    }

    private processLightCards() {
        combineLatest([this.filterService.getBusinessDateFilterChanges(), 
                       this.lightCardsStoreService.getLightCards()]).subscribe((results) => {
                let cards = results[1].filter((card) => results[0].applyFilter(card));
                this.loadProcesses();
                cards.forEach((lightCard) => {
                    const dashboardCard = new CardForDashboard();
                    dashboardCard.title = lightCard.titleTranslated;
                    dashboardCard.id = lightCard.id;
                    dashboardCard.publishDate = moment(lightCard.publishDate).format('DD/MM - HH:mm :');
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
                if (circle.numberOfCards ==98) {
                    console.log("STATE:", stateContent.name);
                    console.log("CIRCLE:", circle.width);
                }
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
        let customOrder = new Map<Severity, number>();
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
        if (this.userService.getCurrentUserWithPerimeters().processesStatesNotNotified.has(id)) {
            return (
                this.userService.getCurrentUserWithPerimeters().processesStatesNotNotified.get(id).indexOf(name) <= -1
            );
        }
        return true;
    }

    public getDashboardPage(): Observable<DashboardPage> {
        return this.dashboardSubject.asObservable();
    }
}
