

import {Component, OnDestroy, OnInit} from '@angular/core';
import {BaseSettingComponent} from '../base-setting/base-setting.component';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
    selector: 'of-multi-settings',
    templateUrl: './multi-settings.component.html'
})
export class MultiSettingsComponent extends BaseSettingComponent implements OnInit, OnDestroy {

    constructor(protected store: Store<AppState>) {
        super(store);
    }

    initFormGroup() {
        const validators = this.computeMultiValidators();
        return new FormGroup({
            setting: new FormControl([], validators)
        }, {updateOn: 'change'});
    }

    protected computeMultiValidators() {
        const validators = [];
        if (this.requiredField) {
            validators.push(Validators.required);
        }
        return validators;
    }

    updateValue(value) {
        this.form.get('setting').setValue(value, {emitEvent: false});
    }

}
