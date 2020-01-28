
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
        console.log(this.disabled);
    }

    computeTextValidators() {
      const validators = super.computeTextValidators();
      validators.push(Validators.email);
      return validators;
    }

}
