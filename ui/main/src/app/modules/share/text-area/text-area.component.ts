/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'of-text-area',
  templateUrl: './text-area.component.html'
})
export class TextAreaComponent implements OnInit {

  @Input() public parentForm: FormGroup;
  @Input() public filterPath: string;
  @Input() public i18nRootLabelKey: string;
  @Input() public lineNumber: number; //Number of lines to display in the text box

  constructor() {
    this.parentForm = new FormGroup({
      [this.filterPath]: new FormControl()
    });
  }

  ngOnInit() {
  }

  computeI18nLabelKey(): string {
    return this.i18nRootLabelKey + this.filterPath;
  }

}
