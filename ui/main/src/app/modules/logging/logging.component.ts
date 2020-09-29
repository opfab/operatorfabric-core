/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AfterViewInit, Component, OnDestroy, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {Observable, Subject} from 'rxjs';
import {LineOfLoggingResult} from '@ofModel/line-of-logging-result.model';
import {selectLinesOfLoggingResult} from '@ofSelectors/logging.selectors';
import {map, takeUntil} from 'rxjs/operators';
import {LoggingFiltersComponent} from './components/logging-filters/logging-filters.component';
import { ProcessesService } from '@ofServices/processes.service';
import { I18n } from '@ofModel/i18n.model';

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

    processValueForFilter = new Array();

    constructor(private store: Store<AppState>, private processesService: ProcessesService) {
        processesService.getAllProcesses().forEach( (process) => {
           const id = process.id;
           if (process.uiVisibility && !!process.uiVisibility.logging)  {
               this.processValueForFilter.push({value: id, label: new I18n(process.name), i18nPrefix: `${process.id}.${process.version}` });
           }
        });
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
