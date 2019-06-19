/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseSettingComponent} from "../base-setting/base-setting.component";
import {AppState} from "@ofStore/index";
import {Store} from "@ngrx/store";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
    selector: 'of-text-setting',
    templateUrl: './text-setting.component.html',
    styleUrls: ['./text-setting.component.css']
})
export class TextSettingComponent extends BaseSettingComponent implements OnInit, OnDestroy {

    @Input() pattern:string;

    constructor(protected store: Store<AppState>) {
        super(store);
    }

    initFormGroup(){
        return new FormGroup({
            setting: new FormControl()
        }, {updateOn: 'submit'});
    }

    // ngOnInit() {
    // }

    updateValue(value){
        this.form.get('setting').setValue(value);
    }

}
