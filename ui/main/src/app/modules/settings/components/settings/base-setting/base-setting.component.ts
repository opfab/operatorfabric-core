/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AppState} from "@ofStore/index";
import {Store} from "@ngrx/store";
import {PatchSettings} from "@ofActions/settings.actions";
import {buildSettingsSelector} from "@ofSelectors/settings.selectors";
import {buildConfigSelector} from "@ofSelectors/config.selectors";
import {Subject, timer} from "rxjs";
import {debounce, distinctUntilChanged, first, map, takeUntil} from "rxjs/operators";
import {FormGroup} from "@angular/forms";
import * as _ from "lodash";
import {selectIdentifier} from "@ofSelectors/authentication.selectors";

@Component({
    selector: 'of-base-setting',
    templateUrl: './base-setting.component.html',
    styleUrls: ['./base-setting.component.css']
})
export class BaseSettingComponent implements OnInit, OnDestroy {

    @Input() public settingPath: string;
    @Input() public messagePlaceOlder: string;
    private ngUnsubscribe$ = new Subject<void>();
    protected setting$;
    protected placeholder$;
    form: FormGroup;
    private baseSettings = {};

    constructor(protected store: Store<AppState>) {
        this.form = this.initFormGroup();
        if(!this.form){
            throw 'Trying to instanciate component without form';
        }
    }

    ngOnInit() {
        this.setting$ = this.store.select(buildSettingsSelector(this.settingPath))
            .pipe(takeUntil(this.ngUnsubscribe$));
            this.setting$.subscribe(next => this.updateValue(next));
        this.setting$
            .pipe(first())
            .subscribe(()=>
                this.form.valueChanges
                    .pipe(
                        takeUntil(this.ngUnsubscribe$),
                        distinctUntilChanged((formA, formB) => {
                            return _.isEqual(formA, formB);
                        }),
                        debounce(() => timer(500))
                    )
                    .subscribe(next=>this.dispatch(this.convert(next)))
            );
        this.placeholder$ = this.store.select(buildConfigSelector(`settings.${this.settingPath}`))
            .pipe(takeUntil(this.ngUnsubscribe$));
        this.store.select(selectIdentifier)
            .pipe(
                takeUntil(this.ngUnsubscribe$),
                map(id=>{return {login:id}}))
            .subscribe(next=>this.baseSettings = next);

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
        const settings = {...this.baseSettings};
        settings[this.settingPath] = value.setting;
        this.store.dispatch(new PatchSettings({settings: settings}));
    }

}
