/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeveritySortComponent } from './severity-sort.component';
import {library} from "@fortawesome/fontawesome-svg-core";
import {faToggleOff, faToggleOn} from "@fortawesome/free-solid-svg-icons";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState, storeConfig} from "@ofStore/index";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {ServicesModule} from "@ofServices/services.module";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {FilterService, FilterType} from "@ofServices/filter.service";
import {TypeFilterComponent} from "../type-filter/type-filter.component";
import {By} from "@angular/platform-browser";
import {ApplyFilter, ChangeSort} from "@ofActions/feed.actions";

describe('SeveritySortComponent', () => {
  let component: SeveritySortComponent;
  let fixture: ComponentFixture<SeveritySortComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule.forRoot(),
        StoreModule.forRoot(appReducer, storeConfig),
        FontAwesomeModule,
      ],
      declarations: [ SeveritySortComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
    fixture = TestBed.createComponent(SeveritySortComponent);
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

  it('should fire changeSort action on click', (done) => {
    expect(component).toBeTruthy();
    let debugElement = fixture.debugElement;
    //Click on button
    debugElement.queryAll(By.css('.btn'))[0].triggerEventHandler('click', null);
    fixture.detectChanges();

    setTimeout(()=> {
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(new ChangeSort());
      done();
    },1000);
  });


});
