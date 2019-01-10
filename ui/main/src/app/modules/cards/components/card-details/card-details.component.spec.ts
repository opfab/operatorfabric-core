/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { CardDetailsComponent } from './card-details.component';
import {DetailsComponent} from "../details/details.component";
import {DetailComponent} from "../detail/detail.component";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState} from "@ofStore/index";
import {RouterTestingModule} from "@angular/router/testing";
import {LoadCardSuccess} from "@ofActions/card.actions";
import {getOneRandomCard} from "@tests/helpers";
import {By} from "@angular/platform-browser";

describe('CardDetailsComponent', () => {
  let component: CardDetailsComponent;
  let fixture: ComponentFixture<CardDetailsComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [StoreModule.forRoot(appReducer),
            RouterTestingModule,],
      declarations: [ CardDetailsComponent, DetailsComponent, DetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
      spyOn(store, 'dispatch').and.callThrough();
    fixture = TestBed.createComponent(CardDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create empty', () => {
      fixture.detectChanges();
    const child = fixture.debugElement.children[0];
    expect(component).toBeTruthy();
    expect(child.name).toEqual("of-details")
  });

    it('should create with card selected', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
        expect(fixture.debugElement.queryAll(By.css("of-detail")).length).toEqual(0);
        store.dispatch(new LoadCardSuccess({card:getOneRandomCard()}));
        fixture.detectChanges();
        const child = fixture.debugElement.children[0];
        expect(child.name).toEqual("of-details")
        expect(fixture.debugElement.queryAll(By.css("of-detail")).length).toEqual(2);
    });
});
