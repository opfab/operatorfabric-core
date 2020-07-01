/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subject, timer} from "rxjs";
import {Filter} from "@ofModel/feed-filter.model";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {buildFilterSelector} from "@ofSelectors/feed.selectors";
import {takeUntil, first, debounce, distinctUntilChanged} from "rxjs/operators";
import {ApplyFilter} from "@ofActions/feed.actions";
import * as _ from 'lodash';
import {FilterType} from "@ofServices/filter.service";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
    selector: 'of-ack-filter',
    templateUrl: './acknowledgement-filter.component.html',
    styleUrls: ['./acknowledgement-filter.component.scss']
})
export class AcknowledgementFilterComponent implements OnInit, OnDestroy {
    private ngUnsubscribe$ = new Subject<void>();
    
    ackFilterForm: FormGroup;

    private _filter$: Observable<Filter>;

    get filter$(): Observable<Filter>{
        return this._filter$;
    }

    //toggleActive = false;

    constructor(private store: Store<AppState>) {
        this.ackFilterForm = this.createFormGroup();
    }

    private createFormGroup() {
        return new FormGroup({
            ackControl: new FormControl("notack")            
        },{updateOn: 'change'});
    }

    ngOnInit() {
        this._filter$ = this.store.select(buildFilterSelector(FilterType.ACKNOWLEDGEMENT_FILTER));
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

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

}
