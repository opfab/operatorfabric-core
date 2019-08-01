/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, Input, OnInit} from '@angular/core';
import {BaseFilterComponent} from "../base-filter/base-filter.component";
import {I18n} from "@ofModel/i18n.model";
import {Observable, of} from "rxjs";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {TranslateService} from "@ngx-translate/core";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'of-list-filter',
  templateUrl: './list-filter.component.html',
  styleUrls: ['./list-filter.component.css']
})
export class ListFilterComponent extends BaseFilterComponent implements OnInit {

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
      filter: new FormControl('', validators)
    }, {updateOn: 'change'});
  }

  protected computeListValidators() {
    let validators = [];
    if (this.requiredField)
      validators.push(Validators.required);
    return validators;
  }

  updateValue(value) {
    this.form.get('filter').setValue(value?value:'', {emitEvent: false});
  }

  protected isEqual(formA, formB): boolean {
    console.log('ListFilterComponent.isEqual called')
    return formA.filter === formB.filter;
  }

  private valueInListValidator(){
    return (control: AbstractControl)=>{
      if(!!control.value && this.preparedList.map(e=>e.value).indexOf(control.value)<0)
        return {valueInList:{valid:false}};
      return null;
    }
  }

}
