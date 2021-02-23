/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Directive, Injectable, Input, OnDestroy, OnInit} from '@angular/core';
import {AppState} from '@ofStore/index';
import {Store} from '@ngrx/store';
import {PatchSettings} from '@ofActions/settings.actions';
import {buildSettingsSelector} from '@ofSelectors/settings.selectors';
import {Subject, timer} from 'rxjs';
import {debounce, distinctUntilChanged, filter, first, map, takeUntil} from 'rxjs/operators';
import {FormGroup} from '@angular/forms';
import * as _ from 'lodash-es';
import {selectIdentifier} from '@ofSelectors/authentication.selectors';

@Directive()
@Injectable()
export abstract class BaseSettingDirective implements OnInit, OnDestroy {

    @Input() public settingPath: string;
    @Input() public messagePlaceholder: string;
    @Input() public requiredField: boolean;
    private ngUnsubscribe$ = new Subject<void>();
    protected setting$;
    form: FormGroup;
    private baseSettings = {};

    protected constructor(protected store: Store<AppState>) {

    }

    ngOnInit() {
        this.form = this.initFormGroup();
        if (!this.form) {
            throw new Error('Trying to instantiate component without form');
        }
        this.setting$ = this.store.select(buildSettingsSelector(this.settingPath))
            .pipe(takeUntil(this.ngUnsubscribe$));
        this.setting$.subscribe(next => this.updateValue(next));
        this.setting$
            .pipe(first())
            .subscribe(() =>
                this.form.valueChanges
                    .pipe(
                        takeUntil(this.ngUnsubscribe$),
                        filter(() => this.form.valid),
                        distinctUntilChanged((formA, formB) => this.isEqual(formA, formB)),
                        debounce(() => timer(500))
                    )
                    .subscribe(next => this.dispatch(this.convert(next)))
            );

        this.store.select(selectIdentifier)
            .pipe(
                takeUntil(this.ngUnsubscribe$),
                map(id => {
                    return {login: id};
                }))
            .subscribe(next => this.baseSettings = next);

    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

    protected abstract updateValue(value: any);

    protected initFormGroup(): FormGroup {
        return null;
    }

    protected convert(value: any): any {
        return value;
    }


    private dispatch(value: any) {
        const settings = {...this.baseSettings};
        settings[this.settingPath] = value.setting;
        this.store.dispatch(new PatchSettings({settings: settings}));
    }

    protected isEqual(formA, formB): boolean {
        return _.isEqual(formA, formB);
    }

}
