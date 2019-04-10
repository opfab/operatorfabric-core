/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'of-time-filter',
  templateUrl: './time-filter.component.html',
  styleUrls: ['./time-filter.component.css']
})
export class TimeFilterComponent implements OnInit {
    timeFilterForm: FormGroup;

  constructor() {
    this.timeFilterForm = this.createFormGroup();
  }

  ngOnInit() {
  }

    private createFormGroup() {
        return new FormGroup({
            start: new FormControl(),
            end: new FormControl()
        },{updateOn: 'change'});
    }

}
