
import {Component, OnDestroy, OnInit} from '@angular/core';
import {BaseSettingComponent} from "../base-setting/base-setting.component";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'of-checkbox-setting',
  templateUrl: './checkbox-setting.component.html',
  styleUrls: ['./checkbox-setting.component.scss']
})
export class CheckboxSettingComponent extends BaseSettingComponent implements OnInit, OnDestroy {

  constructor(protected store: Store<AppState>) {
    super(store);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  initFormGroup() {
    return new FormGroup({
      setting: new FormControl('')
    }, {updateOn: 'change'});
    //No need for validators are the checkbox input type can only create boolean values
  }

  updateValue(value) {
    this.form.get('setting').setValue(value, {emitEvent: false});
  }

}
