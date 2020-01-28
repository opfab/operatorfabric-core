/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResizableComponent } from './resizable.component';

describe('ResizableComponent', () => {
  let component: ResizableComponent;
  let fixture: ComponentFixture<ResizableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResizableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    // window.addEventListener('resize', spy);
    fixture = TestBed.createComponent(ResizableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create resizable component', () => {
    expect(component).toBeTruthy();
  });
  it('shoud test if the height of the resize is invoked after', () => {
    expect(component.resized).toBeTruthy();
  });
});
