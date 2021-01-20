/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {FilterType} from '@ofServices/filter.service';
import {ApplyFilter, ResetFilter, ResetFilterForMonitoring} from '@ofActions/feed.actions';
import {DateTimeNgb, offSetCurrentTime} from '@ofModel/datetime-ngb.model';
import {ConfigService} from '@ofServices/config.service';
import moment from 'moment';
import {Observable, Subject} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {buildSettingsOrConfigSelector} from '@ofStore/selectors/settings.x.config.selectors';
import {takeUntil} from 'rxjs/operators';
import {TimeService} from "@ofServices/time.service";
import {DateTimeFilterValue} from "../../../share/datetime-filter/datetime-filter.component";

const maxVisibleProcessesForSummary = 6;

@Component({
    selector: 'of-monitoring-filters',
    templateUrl: './monitoring-filters.component.html',
    styleUrls: ['./monitoring-filters.component.scss']
})
export class MonitoringFiltersComponent implements OnInit, OnDestroy {

    unsubscribe$: Subject<void> = new Subject<void>();

    size = 10;
    monitoringForm: FormGroup;

    // We should decide on whether we want to use ngrx for this screen (see OC-1271).
    // If so, these can be replaced by storing the values in the monitoring state, and the summary of filters should
    // also take the information from there. If not, we should remove the monitoring state and associated actions (ApplyFilter etc.) altogether.
    private selectedProcesses;
    private pubStart;
    private pubEnd;
    private busiStart;
    private busiEnd;

    // These store the filter values to be displayed in the filter summary when filters are hidden
    // They differ from the filter values above in the fact that they are already translated and formatted for use in the summary
    private processSummary;
    private publishDateFromSummary;
    private publishDateToSummary;
    private activeDateFromSummary;
    private activeDateToSummary;

    dropdownList = [];
    selectedItems = [];
    dropdownSettings = {};
    firstQuery: boolean = true;



    public hideFilters = false;

    @Input()
    public processData: [];

    public submittedOnce = false;

    constructor(private store: Store<AppState>, private configService: ConfigService, private translate: TranslateService, private time: TimeService,) {

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

        this.getLocale().pipe(takeUntil(this.unsubscribe$)).subscribe(locale => {
            this.translate.use(locale);
            this.translate.get(['monitoring.filters.selectProcessText'])
              .subscribe(translations => {
                this.dropdownSettings = {
                    text: translations['monitoring.filters.selectProcessText'],
                    enableSearchFilter: true,
                    classes: 'custom-class-example'
                }
              })
            });

        const hideFiltersInStorage = localStorage.getItem('opfab.hideMonitoringFilters');
        this.hideFilters = (hideFiltersInStorage === 'true');

        this.sendQuery();
    }

    protected getLocale(): Observable<string> {
        return this.store.select(buildSettingsOrConfigSelector('locale'));
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

        this.selectedProcesses = this.monitoringForm.get('process');
        this.pubStart = this.monitoringForm.get('publishDateFrom');
        this.pubEnd = this.monitoringForm.get('publishDateTo');
        this.busiStart = this.monitoringForm.get('activeFrom');
        this.busiEnd = this.monitoringForm.get('activeTo');

        if (this.firstQuery || this.hasFormControlValueChanged( this.selectedProcesses)
            || this.hasFormControlValueChanged( this.pubStart) || this.hasFormControlValueChanged( this.pubEnd)
            || this.hasFormControlValueChanged( this.busiStart) || this.hasFormControlValueChanged( this.busiEnd)) {
            this.store.dispatch(new ResetFilterForMonitoring());

            if ( this.selectedProcesses.value) {
                const processesId  = Array.prototype.map.call( this.selectedProcesses.value, item => item.id);
                if (processesId.length >0 ) 
                {
                    const procFilter = {
                        name: FilterType.PROCESS_FILTER
                        , active: true
                        , status: {processes: processesId}
                    };
                    this.store.dispatch(new ApplyFilter(procFilter));
                }
                
            }

            if (this.hasFormControlValueChanged( this.pubStart)
                || this.hasFormControlValueChanged( this.pubEnd)) {

                const start = this.extractDateOrDefaultOne( this.pubStart,  offSetCurrentTime([{amount: -2, unit: 'hours'}]));
                const end = this.extractDateOrDefaultOne( this.pubEnd, offSetCurrentTime([{amount: 2, unit: 'days'}]));
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
            
            const bstart = this.extractDateOrDefaultOne( this.busiStart,  offSetCurrentTime([{amount: -2, unit: 'hours'}]));
            const bend = this.extractDateOrDefaultOne( this.busiEnd, offSetCurrentTime([{amount: 2, unit: 'days'}]));
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
            const result = isNotPristine && valueIsNotDefault;
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

    showOrHideFilters() {
        console.log("AGU ",this.selectedProcesses.value);
        // Update summary of filters
        // There is no need to use observables are the summary should only be updated when it is needed, rather than react to every selection change
        //This takes advantage of the translation managed by the filter component to produce the list of available processes rather than do the translation again.
        this.processSummary = this.selectedProcesses?this.selectedProcesses.value:[];
        this.publishDateFromSummary = this.formValueToString(this.pubStart.value);
        this.publishDateToSummary = this.formValueToString(this.pubEnd.value);
        this.activeDateFromSummary = this.formValueToString(this.busiStart.value);
        this.activeDateToSummary = this.formValueToString(this.busiEnd.value);

        this.hideFilters = !this.hideFilters;
        localStorage.setItem('opfab.hideMonitoringFilters', this.hideFilters.toString());

    }

    formValueToString(value : DateTimeFilterValue) : string {
        //Using formatDateTime instead of a pipe to take into account the custom format that might be defined in config
        return value?this.time.formatDateTime(this.formValueToDate(value)):"";
    }

    formValueToDate(value : DateTimeFilterValue) : Date {
        return new Date(value.date.year,value.date.month, value.date.day,value.time.hour,value.time.minute)
    }

    listVisibleProcessesForSummary() {
        return this.processSummary.length > maxVisibleProcessesForSummary? this.processSummary.slice(0, maxVisibleProcessesForSummary) : this.processSummary;
    }

    listDropdownProcessesForSummary() {
        return this.processSummary.length > maxVisibleProcessesForSummary ? this.processSummary.slice(maxVisibleProcessesForSummary) : [];
    }

    ngOnDestroy() {
        this.store.dispatch(new ResetFilter());
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
