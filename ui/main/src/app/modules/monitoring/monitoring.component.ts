/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {LineOfMonitoringResult} from '@ofModel/line-of-monitoring-result.model';
import {AppState} from '@ofStore/index';
import {select, Store} from '@ngrx/store';
import {selectSortedFilteredLightCards} from '@ofSelectors/feed.selectors';
import {catchError, map, takeUntil} from 'rxjs/operators';
import {LightCard} from '@ofModel/light-card.model';
import * as moment from 'moment';
import {I18n} from '@ofModel/i18n.model';
import {MonitoringFiltersComponent} from './components/monitoring-filters/monitoring-filters.component';
import {selectProcesses} from '@ofSelectors/process.selector';
import {Process} from '@ofModel/processes.model';
import {ApplyFilter} from '@ofActions/feed.actions';
import {BUSINESS_DATE_FILTER_INITIALISATION} from '@ofServices/filter.service';

@Component({
    selector: 'of-monitoring',
    templateUrl: './monitoring.component.html',
    styleUrls: ['./monitoring.component.scss']
})
export class MonitoringComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild(MonitoringFiltersComponent, {static: false})
    filters: MonitoringFiltersComponent;

    monitoringResult$: Observable<LineOfMonitoringResult[]>;
    unsubscribe$: Subject<void> = new Subject<void>();

    mapOfProcesses = new Map<string, Process>();
    processValueForFilter: Observable<any>;

    constructor(private store: Store<AppState>) {
        this.processValueForFilter = this.store.select(selectProcesses).pipe(
            takeUntil(this.unsubscribe$),
            map((allProcesses: Array<Process>) => {
                /**
                 * work around because allProcesses.forEach(…)
                 * 'is not a function', for some reason.
                 */
                const filterValue = [];
                Array.prototype.forEach.call(allProcesses, (proc: Process) => {
                    const id = proc.id;
                    this.mapOfProcesses.set(id, proc);
                    filterValue.push({value: id, label: proc.name});
                });
                return filterValue;
            })
        );
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.monitoringResult$ = this.store.pipe(
            takeUntil(this.unsubscribe$),
            select(selectSortedFilteredLightCards),
            map((cards: LightCard[]) => {
                    if (!!cards && cards.length <= 0) {
                        return null;
                    }
                    return cards.map(card => {
                            let color = 'white';
                            let name: I18n;
                            const procId = card.process;
                            if (!!this.mapOfProcesses && this.mapOfProcesses.has(procId)) {
                                const currentProcess = this.mapOfProcesses.get(procId);
                                /**
                                 * work around because Object.setPrototypeOf(currentProcess, Process.prototype);
                                 * can't be apply to currentProcess, for some reason.
                                 * and thus currentProcess.extractState(…) throws an error
                                 */
                                const state = Process.prototype.extractState.call(currentProcess, card);
                                if (!!state && !!state.color) {
                                    color = state.color;
                                    name = state.name;
                                }
                            }
                            return (
                                {
                                    creationDateTime: moment(card.publishDate),
                                    beginningOfBusinessPeriod: moment(card.startDate),
                                    endOfBusinessPeriod: ((!!card.endDate) ? moment(card.endDate) : null),
                                    title: this.prefixI18nKey(card, 'title'),
                                    summary: this.prefixI18nKey(card, 'summary'),
                                    trigger: 'source ?',
                                    coordinationStatusColor: color,
                                    coordinationStatus: this.prefixForTranslation(card, name.key),
                                    cardId: card.id

                                } as LineOfMonitoringResult);
                        }
                    );
                }
            ),
            catchError(err => of([]))
        );
        this.store.dispatch(new ApplyFilter(BUSINESS_DATE_FILTER_INITIALISATION));

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

}
