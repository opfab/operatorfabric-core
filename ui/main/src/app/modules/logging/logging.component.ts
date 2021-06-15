/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {Observable, Subject} from 'rxjs';
import {LineOfLoggingResult} from '@ofModel/line-of-logging-result.model';
import {selectLinesOfLoggingResult} from '@ofSelectors/logging.selectors';
import {map, takeUntil} from 'rxjs/operators';
import {LoggingFiltersComponent} from './components/logging-filters/logging-filters.component';
import {ProcessesService} from '@ofServices/processes.service';
import {Utilities} from '../../common/utilities';
import * as _ from 'lodash-es';

@Component({
    selector: 'of-logging',
    templateUrl: './logging.component.html',
    styleUrls: ['./logging.component.scss']
})
export class LoggingComponent implements OnInit, OnDestroy {

    @ViewChild(LoggingFiltersComponent)
    filters: LoggingFiltersComponent;

    loggingResult$: Observable<LineOfLoggingResult[]>;
    canDisplayNoResultMessage = false;
    unsubscribe$: Subject<void> = new Subject<void>();

    processValueForFilter = [];
    processStateDescription = new Map();
    processNames = new Map();
    stateColors = new Map();

    constructor(private store: Store<AppState>, private processesService: ProcessesService) {
        processesService.getAllProcesses().forEach( (process) => {
           const id = process.id;
           if (!!process.uiVisibility && !!process.uiVisibility.logging)  {
               let itemName = process.name;
               if (!itemName) {
                   itemName = id;
               }
               this.processValueForFilter.push({id: id, itemName: itemName, i18nPrefix: `${process.id}.${process.version}` });
               this.processNames.set(id,`${process.id}.${process.version}.${itemName}`);
           }

            for (const key in process.states) {
                this.processStateDescription.set(process.id + '.' + key,
                Utilities.getI18nPrefixFromProcess(process) + process.states[key].description);
                this.stateColors.set(process.id + '.' + key,process.states[key].color);
            }
  
        });
    }

    ngOnInit() {
        this.loggingResult$ = this.store.select(selectLinesOfLoggingResult)
            .pipe(
                takeUntil(this.unsubscribe$),
                map((lines: LineOfLoggingResult[]) => {
                    // no result case
                        if (!lines || lines.length <= 0 ) {
                            // no message displayed when landing on the page
                            this.canDisplayNoResultMessage = (!!this.filters ? this.filters.submittedOnce : false);
                            return null;
                        }
                        return this.resultPostProcessing(lines);

                    }
                ))
        ;
    }

    resultPostProcessing( result: LineOfLoggingResult[] ) : LineOfLoggingResult[] {
        const newResult : LineOfLoggingResult[] = new Array();
        result.forEach ( line =>  {
            const newline = _.clone(line);
            newline.processName=  this.processNames.get(line.process);
            newline.stateColor = this.stateColors.get(newline.process + '.' + newline.state);
            newResult.push(newline); 
        } );
        return newResult;
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
