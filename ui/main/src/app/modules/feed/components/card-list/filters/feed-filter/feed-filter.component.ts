/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subject, timer} from "rxjs";
import {Filter} from "@ofModel/feed-filter.model";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {buildFilterSelector} from "@ofSelectors/feed.selectors";
import {AbstractControl, FormControl, FormGroup} from "@angular/forms";
import {debounce, debounceTime, distinctUntilChanged, first, takeUntil} from "rxjs/operators";
import {ApplyFilter} from "@ofActions/feed.actions";
import * as _ from 'lodash';
import {FilterType} from "@ofServices/filter.service";

import { DateTimeNgb } from '@ofModel/datetime-ngb.model';


@Component({
    selector: 'of-feed-filter',
    templateUrl: './feed-filter.component.html',
    styleUrls: ['./feed-filter.component.scss']
})
export class FeedFilterComponent implements OnInit, OnDestroy {
    @Input() filterByPublishDate: boolean;
    @Input() hideTimerTags: boolean;
    @Input() hideAckFilter: boolean;

    dateTimeFilterChange = new Subject();

    private ngUnsubscribe$ = new Subject<void>();
    typeFilterForm: FormGroup;
    ackFilterForm: FormGroup;
    timeFilterForm: FormGroup;

    private dateFilterType = FilterType.PUBLISHDATE_FILTER;

    private _filter$: Observable<Filter>;
    private _ackFilter$: Observable<Filter>;



    get filter$(): Observable<Filter>{
        return this._filter$;
    }

    get ackFilter$(): Observable<Filter>{
        return this._ackFilter$;
    }

    constructor(private store: Store<AppState>) {
        this.typeFilterForm = this.createFormGroup();
        this.ackFilterForm = this.createAckFormGroup();
        this.timeFilterForm = this.createDateTimeForm();        
    }

    private createFormGroup() {
        return new FormGroup({
            alarm: new FormControl(),
            action: new FormControl(),
            compliant: new FormControl(),
            information: new FormControl()
        },{updateOn: 'change'});
    }

    private createAckFormGroup() {
        return new FormGroup({
            ackControl: new FormControl("notack")            
        },{updateOn: 'change'});
    }

    private createDateTimeForm() {
        return new FormGroup(
            {
                dateTimeFrom: new FormControl(''),
                dateTimeTo: new FormControl(''),
            }
        );
    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

    ngOnInit() {
        this.initTypeFilter();
        this.initAckFilter();
        this.initDateTimeFilter();
    }

    private initTypeFilter() {
        this._filter$ = this.store.select(buildFilterSelector(FilterType.TYPE_FILTER));
        this._filter$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((next: Filter) => {
            if (next) {
                this.typeFilterForm.get('alarm').setValue(!next.active || next.status.alarm, {emitEvent: false});
                this.typeFilterForm.get('action').setValue(!next.active || next.status.action, {emitEvent: false});
                this.typeFilterForm.get('compliant').setValue(!next.active || next.status.compliant, {emitEvent: false});
                this.typeFilterForm.get('information').setValue(!next.active || next.status.information, {emitEvent: false});
            } else {
                this.typeFilterForm.get('alarm').setValue(true,{emitEvent: false});
                this.typeFilterForm.get('action').setValue(true,{emitEvent: false});
                this.typeFilterForm.get('compliant').setValue(true,{emitEvent: false});
                this.typeFilterForm.get('information').setValue(true,{emitEvent: false});
            }
        });
        this._filter$.pipe(first(),takeUntil(this.ngUnsubscribe$)).subscribe(()=>{
            this.typeFilterForm
                .valueChanges
                .pipe(
                    takeUntil(this.ngUnsubscribe$),
                    distinctUntilChanged((formA, formB)=>{
                        return _.isEqual(formA,formB);
                    }),
                    debounce(() => timer(500)))
                .subscribe(form => { 
                    return this.store.dispatch(
                    new ApplyFilter({
                        name: FilterType.TYPE_FILTER,
                        active: !(form.alarm && form.action && form.compliant && form.information),
                        status: form
                    }));
                });
        });
    }

    private initAckFilter() {
        this._ackFilter$ = this.store.select(buildFilterSelector(FilterType.ACKNOWLEDGEMENT_FILTER));
        this._filter$.pipe(first(),takeUntil(this.ngUnsubscribe$))
            .subscribe((next: Filter) => {
                if (next) {                    
                    this.ackFilterForm.get('ackControl').setValue(!next.active && "all" || next.status.ack && "ack" || "notack", {emitEvent: false});                    
                } else {
                    this.ackFilterForm.get('ackControl').setValue("notack",{emitEvent: false});
                }
            });
        this.ackFilterForm
            .valueChanges
            .pipe(
                takeUntil(this.ngUnsubscribe$))
            .subscribe(form => {
                let active = !(form.ackControl === "all");
                let ack = active && form.ackControl === "ack";
                return this.store.dispatch(
                    new ApplyFilter({
                        name: FilterType.ACKNOWLEDGEMENT_FILTER,
                        active: active,
                        status: ack
                    }));
            });
    }

    initDateTimeFilter() {
        if (this.filterByPublishDate) this.dateFilterType = FilterType.PUBLISHDATE_FILTER;
        else this.dateFilterType = FilterType.BUSINESSDATE_FILTER;

        this.dateTimeFilterChange.pipe(
            takeUntil(this.ngUnsubscribe$),
            debounceTime(2000),
        ).subscribe(() => this.setNewFilterValue());
    }


    onDateTimeChange() {
        this.dateTimeFilterChange.next();
    }

    private setNewFilterValue(): void {
        const status = { start: null, end: null };
        status.start = this.extractTime(this.timeFilterForm.get("dateTimeFrom"));
        status.end = this.extractTime(this.timeFilterForm.get("dateTimeTo"));

        this.store.dispatch(
            new ApplyFilter({
                name: this.dateFilterType,
                active: true,
                status: status
            }));
    }

    private extractTime(form: AbstractControl) {
        const val = form.value;
        if (!val || val == '')  {
            return null;
        }
        const converter = new DateTimeNgb(val.date, val.time);
        return converter.convertToNumber();
    }

    
}
