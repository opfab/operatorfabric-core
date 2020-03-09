/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subject, timer} from "rxjs";
import {Filter} from "@ofModel/feed-filter.model";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {buildFilterSelector} from "@ofSelectors/feed.selectors";
import {FormControl, FormGroup} from "@angular/forms";
import {debounce, distinctUntilChanged, first, takeUntil} from "rxjs/operators";
import {ApplyFilter} from "@ofActions/feed.actions";
import * as _ from 'lodash';
import {FilterType} from "@ofServices/filter.service";


@Component({
    selector: 'of-type-filter',
    templateUrl: './type-filter.component.html',
    styleUrls: ['./type-filter.component.scss']
})
export class TypeFilterComponent implements OnInit, OnDestroy {
    private ngUnsubscribe$ = new Subject<void>();
    typeFilterForm: FormGroup;

    private _filter$: Observable<Filter>;

    get filter$(): Observable<Filter>{
        return this._filter$;
    }

    // set filter$(filter: Observable<Filter>) {
    //     this._filter$ = filter;
    // }

    constructor(private store: Store<AppState>) {
        this.typeFilterForm = this.createFormGroup();
    }

    private createFormGroup() {
        return new FormGroup({
            alarm: new FormControl(),
            action: new FormControl(),
            compliant: new FormControl(),
            information: new FormControl()
        },{updateOn: 'change'});
    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }


    ngOnInit() {
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
                    console.log(new Date().toISOString(),"BUG OC-604 type-filter.components.ts ngInit() , send new AppliFilter TYPE FILTER event");
                    return this.store.dispatch(
                    new ApplyFilter({
                        name: FilterType.TYPE_FILTER,
                        active: !(form.alarm && form.action && form.compliant && form.information),
                        status: form
                    }));
                });
        });
    }


}
