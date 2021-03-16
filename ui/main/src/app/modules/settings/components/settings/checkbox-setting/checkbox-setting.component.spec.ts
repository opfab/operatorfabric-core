/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {CheckboxSettingComponent} from './checkbox-setting.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {StoreModule} from "@ngrx/store";
import {appReducer, storeConfig} from "@ofStore/index";

describe('CheckboxSettingComponent', () => {
  let component: CheckboxSettingComponent;
  let fixture: ComponentFixture<CheckboxSettingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot(appReducer, storeConfig)
      ],
      declarations: [ CheckboxSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
