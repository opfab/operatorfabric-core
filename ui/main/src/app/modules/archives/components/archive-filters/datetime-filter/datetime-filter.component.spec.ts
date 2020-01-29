/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatetimeFilterComponent } from './datetime-filter.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

describe('DatetimeFilterComponent', () => {
  let component: DatetimeFilterComponent;
  let fixture: ComponentFixture<DatetimeFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        NgbModule
      ],
      declarations: [ DatetimeFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatetimeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create datetime-filter component', () => {
    expect(component).toBeTruthy();
  });
});
