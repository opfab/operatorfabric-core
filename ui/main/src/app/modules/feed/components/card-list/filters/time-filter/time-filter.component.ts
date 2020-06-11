/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import { Component, OnDestroy, OnInit } from '@angular/core';
import { buildFilterSelector } from "@ofSelectors/feed.selectors";
import { FilterType } from "@ofServices/filter.service";
import { Filter } from "@ofModel/feed-filter.model";
import { Store } from "@ngrx/store";
import { AppState } from "@ofStore/index";
import {  Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ApplyFilter } from "@ofActions/feed.actions";
import flatpickr from 'flatpickr';
import { French } from 'flatpickr/dist/l10n/fr.js';
import { english } from 'flatpickr/dist/l10n/default.js';
import { buildSettingsOrConfigSelector } from "@ofSelectors/settings.x.config.selectors";
import * as moment from 'moment-timezone';


@Component({
    selector: 'of-time-filter',
    templateUrl: './time-filter.component.html',
})

export class TimeFilterComponent implements OnInit, OnDestroy {
    private ngUnsubscribe$ = new Subject<void>();
    
    private startDate;
    private endDate;
    private oldStartDate;
    private oldEndDate;

    private startTime;
    private oldStartTime;
    private endTime;
    private oldEndTime;


    constructor(private store: Store<AppState>,) {
    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

    ngOnInit() {
        this.store.select(buildSettingsOrConfigSelector('locale')).subscribe(locale => this.changeLocaleForDatePicker(locale))
        this.subscribeToChangeInFilter();
    }
    

    private subscribeToChangeInFilter():void
    {
        this.store.select(buildFilterSelector(FilterType.TIME_FILTER))
                  .pipe(takeUntil(this.ngUnsubscribe$)).subscribe((next: Filter) => {
            if (next) {

                this.startDate = this.getDateForDatePicker(next.status.start);
                this.startTime = moment(next.status.start).format('HH:mm');
                this.oldStartDate = this.startDate;
                this.oldStartTime = this.startTime;

                this.endDate = this.getDateForDatePicker(next.status.end);
                this.endTime = moment(next.status.end).format('HH:mm');
                this.oldEndDate = this.endDate;
                this.oldEndTime = this.endTime;

            }
        });
    }

    /**
     *  We need for each local to add it programmaticly
     * 
     */
    private changeLocaleForDatePicker(locale: string): void {
        switch (locale) {
            case 'fr':
                flatpickr.localize(French);
                break;
            default:
                flatpickr.localize(english);
        }
    }


    /** 
     * The date picker component is not using timezone defined by the user via the settings but the navigator timezone 
     * 
     * We need to get the date in the navigator time reference 
     * 
    */

    private getDateForDatePicker(date): Date {

        const realOffset = this.getRealOffSet(date);
        const newDate = moment(date).subtract(realOffset, 'hour');

        const hours = moment(date).toDate().getHours();
        if (hours - realOffset < 0) newDate.add(1, 'day');
        return newDate.toDate();
    }


     /** the date picker component is not using timezone defined by the user via the settings but the navigator timezone 
     * 
     *  This fonction give the offset in hours between browser timezone  and opfab timezone 
     *  --> a Value of x meaning that the browser time is x hours late than the opfab time 
     * 
    */
   private getRealOffSet(date): number {
    const settingsOffset = moment(date).utcOffset() / 60;
    const browserOffset = - moment(date).toDate().getTimezoneOffset() / 60;
    return browserOffset - settingsOffset;

}


    /**
     *  use when user click on Cancel button
     */
    public setOldFilterValue(): void {
        this.startDate = this.oldStartDate;
        this.startTime = this.oldStartTime;
        this.endDate = this.oldEndDate;
        this.endTime = this.oldEndTime;
    }



    /**
     *  use when user click on Confirm button
     */
    public setNewFilterValue(): void {

        let startHour =0;
        let startMin =0;
        const startValues = this.startTime.split(":");
        if (startValues.length>1) {
            startHour = Number(startValues[0]);
            if (Number.isNaN(startHour)) startHour=0;
            startMin = Number(startValues[1]);
            if (Number.isNaN(startMin)) startMin=0;
        }


        let endHour =0;
        let endMin =0;
        const endValues = this.endTime.split(":");
        if (endValues.length>1) {
            endHour = Number(endValues[0]);
            if (Number.isNaN(endHour)) endHour=0;
            endMin = Number(endValues[1]);
            if (Number.isNaN(endMin)) endMin=0;
        }


        this.store.dispatch(
            new ApplyFilter({
                name: FilterType.TIME_FILTER,
                active: true,
                status: {
                    start: this.convertDateFromDatePickerToMillis(this.startDate, startHour, startMin),
                    end: this.convertDateFromDatePickerToMillis(this.endDate, endHour, endMin)
                }
            }))

    }

    /** 
     *  The date picker component is not using timezone defined by the user via the settings but the navigator timezone 
     * 
     *  We need to convert it in the settings timezone
     * 
    */

    private convertDateFromDatePickerToMillis(dateFromDatePicker, hour, minute): number {
        const realOffset = this.getRealOffSet(dateFromDatePicker);

        // Put moment at start of day in the  browser timezone reference
        const newStartDate = moment(dateFromDatePicker).add(realOffset, 'hour');
        const newStartDateStartOfDay = moment(newStartDate).startOf('day');
        if ((realOffset + hour) >= 24) newStartDateStartOfDay.subtract(1, 'day');

        // add minutes an hours form the input in the form 
        const newDateWithTime = moment(newStartDateStartOfDay).add('hour', hour).add('minutes', minute);

        return newDateWithTime.valueOf();
    }


}
