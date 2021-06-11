/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AppState} from '@ofStore/index';
import {Store} from '@ngrx/store';
import {FormControl, FormGroup} from '@angular/forms';

import {SendLoggingQuery} from '@ofActions/logging.actions';
import {ConfigService} from '@ofServices/config.service';
import {TimeService} from '@ofServices/time.service';
import {Subject} from 'rxjs';
import {ArchivesLoggingFiltersComponent} from '../../../share/archives-logging-filters/archives-logging-filters.component';


@Component({
    selector: 'of-logging-filters',
    templateUrl: './logging-filters.component.html',
    styleUrls: ['./logging-filters.component.scss']
})

export class LoggingFiltersComponent implements OnInit, OnDestroy {

    unsubscribe$: Subject<void> = new Subject<void>();

    size = 10;
    loggingForm: FormGroup;

    @ViewChild('filters') filtersTemplate: ArchivesLoggingFiltersComponent;

    public submittedOnce = false;

    @Input()
    public visibleProcesses: [];

    constructor(private store: Store<AppState>,
                private timeService: TimeService,
                private configService: ConfigService) {

    }

    ngOnInit() {
        this.size = this.configService.getConfigValue('archive.filters.page.size', 10);
        this.loggingForm = new FormGroup(
            {
                tags: new FormControl([]),
                state: new FormControl([]),
                process: new FormControl([]),
                processGroup: new FormControl([]),
                publishDateFrom: new FormControl(''),
                publishDateTo: new FormControl(''),
                activeFrom: new FormControl(''),
                activeTo: new FormControl('')
            }
        );
    }

    sendQuery() {
        const {value} = this.loggingForm;
        this.filtersTemplate.filtersToMap(value);
        this.filtersTemplate.filters.set('size', [this.size.toString()]);
        this.filtersTemplate.filters.set('page', ['0']);
        this.store.dispatch(new SendLoggingQuery({params: this.filtersTemplate.filters}));
        this.submittedOnce = true;
    }

    resetForm() {
        this.loggingForm.reset();
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
