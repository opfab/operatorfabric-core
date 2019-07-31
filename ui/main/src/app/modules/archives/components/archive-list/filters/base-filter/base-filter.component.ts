/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AppState} from "@ofStore/index";
import {Store} from "@ngrx/store";
import {buildConfigSelector} from "@ofSelectors/config.selectors";
import {Subject, timer} from "rxjs";
import {debounce, distinctUntilChanged, filter, first, map, takeUntil} from "rxjs/operators";
import {FormGroup} from "@angular/forms";
import * as _ from "lodash";
import {buildArchiveFilterSelector} from "@ofSelectors/archive.selectors";
import {UpdateArchiveFilter} from "@ofActions/archive.actions";

@Component({
    selector: 'of-base-filter',
    templateUrl: './base-filter.component.html'
})
export class BaseFilterComponent implements OnInit, OnDestroy {

    @Input() public filterPath: string;
    @Input() public messagePlaceholder: string;
    @Input() public requiredField: boolean;
    private ngUnsubscribe$ = new Subject<void>();
    protected filter$;
    protected placeholder$;
    form: FormGroup;

    constructor(protected store: Store<AppState>) {

    }

    ngOnInit() {
        this.form = this.initFormGroup();
        if(!this.form){
            throw 'Trying to instanciate component without form';
        }
        this.filter$ = this.store.select(buildArchiveFilterSelector(this.filterPath))
            .pipe(takeUntil(this.ngUnsubscribe$));
            this.filter$.subscribe(next => this.updateValue(next));
        this.filter$
            .pipe(first())
            .subscribe(()=>
                this.form.valueChanges
                    .pipe(
                        takeUntil(this.ngUnsubscribe$),
                        filter(()=>this.form.valid),
                        distinctUntilChanged((formA, formB) => this.isEqual(formA, formB)),
                        debounce(() => timer(500))
                    )
                    .subscribe(next=>this.dispatch(this.convert(next)))
            );
        this.placeholder$ = this.store.select(buildConfigSelector(`archive.filters.${this.filterPath}`)) //TODO Reads default value from config if exists
            .pipe(takeUntil(this.ngUnsubscribe$));

    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

    protected updateValue(value:any){

    }

    protected initFormGroup():FormGroup{
        return null
    }

    protected convert(value:any):any{
        return value;
    }


    private dispatch(value:any) {
        this.store.dispatch(new UpdateArchiveFilter({filterPath: this.filterPath, filterValues: [value.filter]}));
    }

    protected isEqual(formA, formB):boolean{
        return _.isEqual(formA, formB);
    }

    protected submitValue(){
        alert('submitted');
    }

}
