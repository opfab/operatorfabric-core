/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Component, OnDestroy, OnInit, Input} from '@angular/core';
import {TextSettingComponent} from '../text-setting/text-setting.component';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {Validators} from '@angular/forms';

@Component({
    selector: 'of-email-setting',
    templateUrl: './email-setting.component.html'
})
export class EmailSettingComponent extends TextSettingComponent implements OnInit, OnDestroy {

    @Input() disabled: boolean;

    constructor(protected store: Store<AppState>) {
        super(store);
    }

    computeTextValidators() {
        const validators = super.computeTextValidators();
        validators.push(Validators.email);
        return validators;
    }

}
