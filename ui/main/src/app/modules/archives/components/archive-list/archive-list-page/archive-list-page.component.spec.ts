/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import { ArchiveListPageComponent } from './archive-list-page.component';

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {appReducer, AppState, storeConfig} from '@ofStore/index';
import {Store, StoreModule} from '@ngrx/store';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientModule} from '@angular/common/http';
import {RouterStateSerializer, StoreRouterConnectingModule} from '@ngrx/router-store';
import {CustomRouterStateSerializer} from '@ofStates/router.state';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ServicesModule} from '@ofServices/services.module';


describe('AtchiveListpageComponent', () => {
  let component: ArchiveListPageComponent;
  let store: Store<AppState>;
  let fixture: ComponentFixture<ArchiveListPageComponent>;
  let compiled: any;
  beforeEach(async(() => {
      TestBed.configureTestingModule({
          imports: [
              ServicesModule,
              StoreModule.forRoot(appReducer, storeConfig),
              RouterTestingModule,
              StoreRouterConnectingModule,
              HttpClientModule],
          declarations: [
            ArchiveListPageComponent
          ],
          providers: [
              {provide: Store, useClass: Store},
              {provide: RouterStateSerializer, useClass: CustomRouterStateSerializer}
          ],
          schemas: [ NO_ERRORS_SCHEMA ]
      }).compileComponents();
  }));
  beforeEach(() => {
      store = TestBed.get(Store);
      spyOn(store, 'dispatch').and.callThrough();
      // avoid exceptions during construction and init of the component
      // spyOn(store, 'pipe').and.callFake(() => of('/test/url'));
      fixture = TestBed.createComponent(ArchiveListPageComponent);
      component = fixture.componentInstance;
      compiled = fixture.debugElement.nativeElement;
      fixture.detectChanges();

  });

  it('should create an the app-archives component', () => {
      expect(component).toBeTruthy();
  });
});
