/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadSortComponent } from './read-sort.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState, storeConfig} from "@ofStore/index";
import {By} from "@angular/platform-browser";
import {ChangeReadSort, ChangeSort} from "@ofActions/feed.actions";
import {FontAwesomeIconsModule} from "../../../../../utilities/fontawesome-icons.module";

describe('ReadSortComponent', () => {
  let component: ReadSortComponent;
  let fixture: ComponentFixture<ReadSortComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        StoreModule.forRoot(appReducer, storeConfig),
        FontAwesomeIconsModule,
      ],
      declarations: [ ReadSortComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
    fixture = TestBed.createComponent(ReadSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change active property of button on click', () => {
    expect(component).toBeTruthy();
    let debugElement = fixture.debugElement;
    //Get initial active status of button
    let initialActiveStatus = component.toggleActive
    //Click on button
    debugElement.queryAll(By.css('.btn'))[0].triggerEventHandler('click', null);
    fixture.detectChanges();
    //Check new active status
    let newActiveStatus = component.toggleActive
    expect(newActiveStatus).toEqual(!initialActiveStatus);
  });

  it('should fire changeReadSort action on click', (done) => {
    expect(component).toBeTruthy();
    let debugElement = fixture.debugElement;
    //Click on button
    debugElement.queryAll(By.css('.btn'))[0].triggerEventHandler('click', null);
    fixture.detectChanges();

    setTimeout(()=> {
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(new ChangeReadSort());
      done();
    },1000);
  });


});
