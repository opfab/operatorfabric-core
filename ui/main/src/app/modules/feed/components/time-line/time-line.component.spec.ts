/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TimeLineComponent} from './time-line.component';
import {CommonModule} from "@angular/common";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule} from "@angular/forms";
import {NgxChartsModule} from "@swimlane/ngx-charts";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState, storeConfig} from "@ofStore/index";
import {RouterTestingModule} from "@angular/router/testing";
import {RouterStateSerializer, StoreRouterConnectingModule} from "@ngrx/router-store";
import {CustomTimelineChartComponent} from "../custom-timeline-chart/custom-timeline-chart.component";
import {InitChartComponent} from "../init-chart/init-chart.component";
import {CustomRouterStateSerializer} from "@ofStates/router.state";
import {NO_ERRORS_SCHEMA} from "@angular/core";
import * as moment from 'moment';
import * as _ from 'lodash';
import {getOneRandomLigthCard} from "@tests/helpers";

describe('TimeLineComponent', () => {
  let component: TimeLineComponent;
  let store: Store<AppState>;
  let fixture: ComponentFixture<TimeLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule,
        BrowserAnimationsModule,
        FormsModule,
        StoreModule.forRoot(appReducer, storeConfig),
        RouterTestingModule,
        StoreRouterConnectingModule,
        NgxChartsModule ],
      declarations: [ TimeLineComponent, CustomTimelineChartComponent, InitChartComponent ],
      providers: [{provide: Store, useClass: Store},{provide: RouterStateSerializer, useClass: CustomRouterStateSerializer}],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
    fixture = TestBed.createComponent(TimeLineComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
/*  it('should create', () => {
    const lightCard = getOneRandomLigthCard();

    // extract expected data
    const id = lightCard.id;
    const uid = lightCard.uid;
    const title = lightCard.title.key;
    const summaryValue = lightCard.summary.key;
    const publisher = lightCard.publisher;
    const version = lightCard.publisherVersion;

    component.lightCard = lightCard;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });*/
});
