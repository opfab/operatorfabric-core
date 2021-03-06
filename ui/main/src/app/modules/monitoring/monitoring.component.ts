/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {combineLatest, Observable, of, Subject} from 'rxjs';
import {LineOfMonitoringResult} from '@ofModel/line-of-monitoring-result.model';
import {AppState} from '@ofStore/index';
import {Store} from '@ngrx/store';
import {catchError, map, takeUntil} from 'rxjs/operators';
import {LightCard} from '@ofModel/light-card.model';
import * as moment from 'moment';
import {I18n} from '@ofModel/i18n.model';
import {MonitoringFiltersComponent} from './components/monitoring-filters/monitoring-filters.component';
import {Process, TypeOfStateEnum} from '@ofModel/processes.model';
import {ProcessesService} from '@ofServices/processes.service';
import {LightCardsService} from '@ofServices/lightcards.service';
import {Filter} from '@ofModel/feed-filter.model';

@Component({
    selector: 'of-monitoring',
    templateUrl: './monitoring.component.html',
    styleUrls: ['./monitoring.component.scss']
})
export class MonitoringComponent implements OnInit, OnDestroy {

    @ViewChild('filters')
    filters: MonitoringFiltersComponent;

    monitoringFilters$ = new Subject<Filter[]>();

    monitoringResult$: Observable<LineOfMonitoringResult[]>;
    unsubscribe$: Subject<void> = new Subject<void>();

    mapOfProcesses = new Map<string, Process>();
    processValueForFilter = new Array();

    result: LineOfMonitoringResult[];

    constructor(private store: Store<AppState>
                , private processesService: ProcessesService, private lightCardsService: LightCardsService
    ) {
         processesService.getAllProcesses().forEach(process => {
            const id = process.id;
            if (!!process.uiVisibility && !!process.uiVisibility.monitoring) {
                this.mapOfProcesses.set(id, process);
                let itemName = process.name;
                if (!itemName)
                    itemName = id;
                this.processValueForFilter.push({id: id, itemName: itemName, i18nPrefix: `${process.id}.${process.version}` });
            }
         });

    }

    ngOnInit() {
        this.monitoringResult$ = 
            combineLatest([
                this.monitoringFilters$.asObservable(),
                this.lightCardsService.getLightCards()
            ]
            ).pipe(
                takeUntil(this.unsubscribe$),
                map(results => {
                        const cards = this.lightCardsService.filterLightCards(results[1], results[0]);
                        if (!!cards && cards.length <= 0) {
                            return null;
                        }
                        return cards.map(card => {
                                return this.cardToResult(card)
                            }
                        ).filter(elem => !!elem);
                    }
                ),
                catchError(err => of([]))
        );
        this.monitoringResult$.subscribe(lines => this.result = lines);
    }


    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    prefixI18nKey(card: LightCard, key: string): I18n {
        const currentI18n = card[key] as I18n;
        return new I18n(this.prefixForTranslation(card, currentI18n.key), currentI18n.parameters);
    }

    prefixForTranslation(card: LightCard, key: string): string {
        return `${card.process}.${card.processVersion}.${key}`;
    }

    applyCardsFilters(filters: Filter[]) {
        this.monitoringFilters$.next(filters);
    }


    private cardToResult(card: LightCard) : LineOfMonitoringResult{
        let typeOfState: TypeOfStateEnum;
        const procId = card.process;
        if (!!this.mapOfProcesses && this.mapOfProcesses.has(procId) && !card.parentCardId) {
            const currentProcess = this.mapOfProcesses.get(procId);
            /**
             * work around because Object.setPrototypeOf(currentProcess, Process.prototype);
             * can't be apply to currentProcess, for some reason.
             * and thus currentProcess.extractState(…) throws an error
             */
            const state = Process.prototype.extractState.call(currentProcess, card);

            if (!!state && !!state.type) {
                typeOfState = state.type;
            }
            if (!!state.type) {
                return (
                    {
                        creationDateTime: moment(card.publishDate),
                        beginningOfBusinessPeriod: moment(card.startDate),
                        endOfBusinessPeriod: ((!!card.endDate) ? moment(card.endDate) : null),
                        title: this.prefixI18nKey(card, 'title'),
                        summary: this.prefixI18nKey(card, 'summary'),
                        processName: this.prefixForTranslation(card, currentProcess.name),
                        cardId: card.id,
                        severity: card.severity.toLocaleLowerCase(),
                        processId: procId,
                        typeOfState: typeOfState
                    } as LineOfMonitoringResult);
            }
        }
        return null;
    }

}
