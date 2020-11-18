/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AfterViewInit, Component, Input,OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {FilterType} from '@ofServices/filter.service';
import {ApplyFilter, ResetFilter} from '@ofActions/feed.actions';
import {DateTimeNgb, offSetCurrentTime} from '@ofModel/datetime-ngb.model';
import {ConfigService} from '@ofServices/config.service';
import moment from 'moment';


@Component({
    selector: 'of-monitoring-filters',
    templateUrl: './monitoring-filters.component.html'
})
export class MonitoringFiltersComponent implements OnInit, AfterViewInit {

    size = 10;
    monitoringForm: FormGroup;

    dropdownList = [];
    selectedItems = [];
    dropdownSettings = {};
    firstQuery: boolean = true;

    @Input()
    public processData: [];

    public submittedOnce = false;

    constructor(private store: Store<AppState>, private configService: ConfigService) {

    }

    ngOnInit() {
        this.size = this.configService.getConfigValue('archive.filters.page.size', 10);

        this.monitoringForm = new FormGroup(
            {
                process: new FormControl([]),
                publishDateFrom: new FormControl(''),
                publishDateTo: new FormControl(''),
                activeFrom: new FormControl(''),
                activeTo: new FormControl('')
            }
        );
        this.initActiveDatesForm();

        this.dropdownList = this.processData;

        this.dropdownSettings = {
            text: 'Select a Process',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableSearchFilter: true,
            classes: 'custom-class-example'
        };
    }

    ngAfterViewInit() {
        this.sendQuery();
    }

    initActiveDatesForm() {
        const start = moment();
        start.add(-2, 'hours');
        const end = moment();
        end.add(+2, 'days');
        this.monitoringForm.controls.activeFrom.patchValue({'date': {'year': start.year(), 'month': start.month() + 1, 'day': start.date()}, 'time': {'hour': start.hour(), 'minute': start.minute()}});
        this.monitoringForm.controls.activeTo.patchValue({'date': {'year': end.year(), 'month': end.month() + 1, 'day': end.date()}, 'time': {'hour': end.hour(), 'minute': end.minute()}});
        this.monitoringForm.controls.activeFrom.updateValueAndValidity({onlySelf: false, emitEvent: true});
        this.monitoringForm.controls.activeTo.updateValueAndValidity({onlySelf: false, emitEvent: true});
    }

    sendQuery() {
        const selectedProcesses = this.monitoringForm.get('process');
        const pubStart = this.monitoringForm.get('publishDateFrom');
        const pubEnd = this.monitoringForm.get('publishDateTo');
        const busiStart = this.monitoringForm.get('activeFrom');
        const busiEnd = this.monitoringForm.get('activeTo');

        if (this.firstQuery || this.hasFormControlValueChanged(selectedProcesses) 
            || this.hasFormControlValueChanged(pubStart) || this.hasFormControlValueChanged(pubEnd) 
            || this.hasFormControlValueChanged(busiStart) || this.hasFormControlValueChanged(busiEnd)) {
            this.store.dispatch(new ResetFilter());
            
            if (selectedProcesses.value) {
                const processesId = Array.prototype.map.call(selectedProcesses.value, item => item.id);
                const procFilter = {
                    name: FilterType.PROCESS_FILTER
                    , active: true
                    , status: {processes: processesId}
                };
                this.store.dispatch(new ApplyFilter(procFilter));
            }
            
            if (this.hasFormControlValueChanged(pubStart)
                || this.hasFormControlValueChanged(pubEnd)) {

                const start = this.extractDateOrDefaultOne(pubStart,  offSetCurrentTime([{amount: -2, unit: 'hours'}]));
                const end = this.extractDateOrDefaultOne(pubEnd, offSetCurrentTime([{amount: 2, unit: 'days'}]));
                const publishDateFilter = {
                    name: FilterType.PUBLISHDATE_FILTER
                    , active: true
                    , status: {
                        start: start,
                        end: end
                    }
                };
                this.store.dispatch(new ApplyFilter(publishDateFilter));
            }
            
            const bstart = this.extractDateOrDefaultOne(busiStart,  offSetCurrentTime([{amount: -2, unit: 'hours'}]));
            const bend = this.extractDateOrDefaultOne(busiEnd, offSetCurrentTime([{amount: 2, unit: 'days'}]));
            const businessDateFilter = (bend >= 0) ? {
                    name: FilterType.MONITOR_DATE_FILTER
                    , active: true
                    , status: {
                        start: bstart,
                        end: bend
                    }
                } : {
                    name: FilterType.MONITOR_DATE_FILTER
                    , active: true
                    , status: {
                        start: bstart
                    }
                };
                
                this.store.dispatch(new ApplyFilter({
                    name: FilterType.BUSINESSDATE_FILTER, active: true,
                    status: {start: bstart, end: bend}
                    }));
                
                this.store.dispatch(new ApplyFilter(businessDateFilter));
        }
        this.firstQuery = false;
    }



    hasFormControlValueChanged(control: AbstractControl): boolean {
        if (!!control) {
            const isNotPristine = !control.pristine;
            const valueIsNotDefault = control.value !== '';
            const result = !!control && isNotPristine && valueIsNotDefault;
            return result;
        }
        return false;
    }

    extractDateOrDefaultOne(form: AbstractControl, defaultDate: any) {
        const val = form.value;
        const finallyUsedDate = (!!val && val !== '') ? val : defaultDate;
        if (!finallyUsedDate) {
            return -1;
        }
        const converter = new DateTimeNgb(finallyUsedDate.date, finallyUsedDate.time);
        return converter.convertToNumber();
    }

    resetForm() {
        this.monitoringForm.reset();
        this.initActiveDatesForm();
        this.firstQuery = true;
        this.sendQuery();
    }

    ngOnDestroy() {
        this.store.dispatch(new ResetFilter());
    }

}
