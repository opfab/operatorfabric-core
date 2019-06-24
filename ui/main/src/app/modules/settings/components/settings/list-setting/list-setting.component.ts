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
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import {I18n} from "@ofModel/i18n.model";
import {TranslateService} from "@ngx-translate/core";
import {Observable, of} from "rxjs";

@Component({
    selector: 'of-list-setting',
    templateUrl: './list-setting.component.html',
    styleUrls: ['./list-setting.component.css']
})
export class ListSettingComponent extends BaseSettingComponent implements OnInit, OnDestroy {

    @Input() values: ({ value: string, label: (I18n | string) } | string)[];
    preparedList: { value: string, label: Observable<string> }[];

    constructor(protected store: Store<AppState>, private translateService: TranslateService) {
        super(store);
    }

    ngOnInit() {
        this.preparedList = [];
        if (this.values) {
            for (let v of this.values) {
                if (typeof v == 'string') {
                    this.preparedList.push({value: v, label: of(v)});
                } else if (typeof v.label == 'string') {
                    this.preparedList.push({value: v.value, label: of(v.label)});
                } else {
                    this.preparedList.push({
                        value: v.value,
                        label: this.translateService.get(v.label.key, v.label.parameters)
                    });
                }
            }
        }
        super.ngOnInit();
    }

    initFormGroup() {
        let validators = this.computeListValidators();
        validators.push(this.valueInListValidator());
        return new FormGroup({
            setting: new FormControl(null, validators)
        }, {updateOn: 'change'});
    }

    protected computeListValidators() {
        let validators = [];
        if (this.requiredField)
            validators.push(Validators.required);
        return validators;
    }

// ngOnInit() {
    // }

    updateValue(value) {
        this.form.get('setting').setValue(value, {emitEvent: false});
    }

    protected isEqual(formA, formB): boolean {
        console.log('TextSettingComponent.isEqual called')
        return formA.setting === formB.setting;
    }

    private valueInListValidator(){
        return (control: AbstractControl)=>{
            if(this.preparedList.map(e=>e.value).indexOf(control.value)<0)
                return {valueInList:{valid:false}};
            return null;
        }
    }

}
