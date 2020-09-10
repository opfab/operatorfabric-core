/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {FlushLoggingResult} from '@ofActions/logging.actions';
import {Observable, Subject} from 'rxjs';
import {LineOfLoggingResult} from '@ofModel/line-of-logging-result.model';
import {selectLinesOfLoggingResult} from '@ofSelectors/logging.selectors';
import {map, takeUntil} from 'rxjs/operators';
import {LoggingFiltersComponent} from './components/logging-filters/logging-filters.component';
import {selectProcesses} from '@ofSelectors/process.selector';
import {Process} from '@ofModel/processes.model';

@Component({
    selector: 'of-logging',
    templateUrl: './logging.component.html',
    styleUrls: ['./logging.component.scss']
})
export class LoggingComponent implements  AfterViewInit, OnDestroy {

    @ViewChild(LoggingFiltersComponent, {static: false})
    filters: LoggingFiltersComponent;

    loggingResult$: Observable<LineOfLoggingResult[]>;
    canDisplayNoResultMessage = false;
    unsubscribe$: Subject<void> = new Subject<void>();

    processValueForFilter: Observable<any>;

    constructor(private store: Store<AppState>) {
        this.store.dispatch(new FlushLoggingResult());
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

                    if (proc.uiVisibility && proc.uiVisibility.logging === true) {
                        filterValue.push({value: id, label: proc.name});
                    }
                });
                return filterValue;
            })
        );
    }

    ngAfterViewInit() {
        this.loggingResult$ = this.store.select(selectLinesOfLoggingResult)
            .pipe(
                takeUntil(this.unsubscribe$),
                map((lines: LineOfLoggingResult[]) => {
                    // no result case
                        if (!lines || lines.length <= 0 ) {
                            // no message displayed when landing on the page
                            this.canDisplayNoResultMessage = this.filters.submittedOnce;
                            return null;
                        }
                        return lines;
                    }
                ))
        ;
    }
    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
