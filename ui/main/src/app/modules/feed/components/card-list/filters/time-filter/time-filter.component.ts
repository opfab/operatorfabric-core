/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {buildFilterSelector} from "@ofSelectors/feed.selectors";
import {FilterType} from "@ofServices/filter.service";
import {Filter} from "@ofModel/feed-filter.model";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {Observable, Subject, timer} from "rxjs";
import {debounce, distinctUntilChanged, first, takeUntil} from "rxjs/operators";
import * as _ from "lodash";
import {ApplyFilter} from "@ofActions/feed.actions";
import {TimeService} from "@ofServices/time.service";
import * as moment from "moment";

@Component({
    selector: 'of-time-filter',
    templateUrl: './time-filter.component.html'
})
export class TimeFilterComponent implements OnInit, OnDestroy {
    private ngUnsubscribe$ = new Subject<void>();
    private _filter$: Observable<Filter>;

    get filter$(): Observable<Filter> {
        return this._filter$;
    }

    timeFilterForm: FormGroup;

    constructor(private store: Store<AppState>,
                private timeService: TimeService) {
        this.timeFilterForm = this.createFormGroup();
    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

    ngOnInit() {
        this._filter$ = this.store.select(buildFilterSelector(FilterType.TIME_FILTER));
        console.log(moment("2016-10-11 18:06:03").tz("Europe/Paris").format());

        //Update the values of the filter form if the state of the filter has been changed by other means (timeline, followClockTick, etc.)
        //With {emitEvent:false}, this update won't trigger a valueChanges, so no ApplyFilter action will be dispatched
        this._filter$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((next: Filter) => {
            if (next) {
                if (this.timeService.parseString(this.timeFilterForm.get('start').value).valueOf() != next.status.start) {
                    if(!!next.status.start)
                        this.timeFilterForm.get('start').setValue(this.timeService.asInputString(next.status.start), {emitEvent:false});
                    else
                        this.timeFilterForm.get('start').setValue(null, {emitEvent: false});
                }
                if (this.timeService.parseString(this.timeFilterForm.get('end').value).valueOf() != next.status.end) {
                    if(!!next.status.end) {
                        this.timeFilterForm.get('end').setValue(this.timeService.asInputString(next.status.end), {emitEvent: false});
                    }
                    else
                        this.timeFilterForm.get('end').setValue(null, {emitEvent: false});
                }
            } else {
                if (!!this.timeFilterForm.get('start').value)
                    this.timeFilterForm.get('start').setValue(null, {emitEvent: false});
                if (!!this.timeFilterForm.get('end').value)
                    this.timeFilterForm.get('end').setValue(null, {emitEvent: false});
            }
        });

        this._filter$.pipe(first(), takeUntil(this.ngUnsubscribe$)).subscribe(() => {
            this.timeFilterForm
                .valueChanges
                .pipe(
                    takeUntil(this.ngUnsubscribe$),
                    distinctUntilChanged((formA, formB) => {
                        return _.isEqual(formA, formB);
                    }),
                    debounce(() => timer(500)))
                .subscribe(form => this.store.dispatch(
                    new ApplyFilter({
                        name: FilterType.TIME_FILTER,
                        active: !!form.start || !!form.end,
                        status: {
                            start: form.start ? this.timeService.parseString(form.start).valueOf() : null,
                            end: form.end ? this.timeService.parseString(form.end).valueOf() : null
                        }
                    }))
                );
        });
    }

    private createFormGroup() {
        return new FormGroup({
            start: new FormControl(),
            end: new FormControl()
        }, {updateOn: 'change'});
    }

}
