/* Copyright (c) 2020-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {I18n} from '@ofModel/i18n.model';
import {FormControl, FormGroup} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {map} from 'rxjs/operators';

@Component({
  selector: 'of-single-filter',
  templateUrl: './single-filter.component.html'
})
export class SingleFilterComponent implements OnInit, OnChanges {

  preparedList: { value: string, label: string }[];
  @Input() public i18nRootLabelKey: string;
  @Input() public values: ({ value: string, label: (I18n | string) } | string)[];
  @Input() public parentForm: FormGroup;
  @Input() public filterPath: string;
  @Input() public valuesInObservable: Observable<any>;
  @Input() public prefixWithValue: boolean;
  @Input() public placeholderKey: string;
  @Input() public sortValues: boolean;
  @Input() public defaultValueSelected?: boolean;
  placeholderText: Observable<any>;

  constructor(private translateService: TranslateService) {
    this.parentForm = new FormGroup({
      [this.filterPath]: new FormControl()
    });
  }

  ngOnInit() {
    this.preparedList = [];

    if (!this.valuesInObservable && !!this.values) {
      for (const v of this.values) {
        this.preparedList.push(this.computeValueAndLabel(v));
      }
    } else {
      if (!!this.valuesInObservable) {
        this.valuesInObservable.pipe(
            map((values: ({ value: string, label: (I18n | string) } | string)[]) => {
                  this.preparedList = [];
                  for (const v of values) {
                    this.preparedList.push(this.computeValueAndLabel(v));
                  }
                }
            ))
            .subscribe();
      }
    }
    if (this.sortValues)
      this.sortPeparedList();

    if (this.defaultValueSelected && this.preparedList.length)
      this.parentForm.get(this.filterPath).setValue(this.preparedList[0].value);
  }


  ngOnChanges() {
    if (!this.valuesInObservable && this.values) {
      this.preparedList = [];
      for (const v of this.values) {
        this.preparedList.push(this.computeValueAndLabel(v));
      }
      if (this.sortValues)
        this.sortPeparedList();

      if (this.defaultValueSelected && this.preparedList.length)
        this.parentForm.get(this.filterPath).setValue(this.preparedList[0].value);

    }
    if (!!this.placeholderKey) 
      this.translateService.get(this.placeholderKey).subscribe( text => this.placeholderText = text);
  }

  computeI18nLabelKey(): string {
    return this.i18nRootLabelKey + this.filterPath;
  }

  computeValueAndLabel(entry: ({ value: string, label: (I18n | string) } | string)): { value: string, label: string } {
    if (typeof entry === 'string') {
      return {value: entry, label: this.translateItem(entry)};
    } else if (typeof entry.label === 'string') {
      return {value: entry.value, label: this.translateItem(entry.label)};
    } else if (!entry.label) {
      return {value: entry.value, label: this.translateItem(entry.value)};
    }
    return {
      value: entry.value,
      label: this.translateItem(entry.label.key, entry.label.parameters)
    };
  }

  private translateItem(item : string, parameters?) : string {
    let translated = item;
    if (!! parameters)
      this.translateService.get(item, parameters).subscribe(result => translated = result);
    else
      this.translateService.get(item, null).subscribe(result => translated = result);
    return translated;
  }

  private sortPeparedList() {
    this.preparedList.sort((a, b) => (a.label.localeCompare(b.label)));
  }
}
