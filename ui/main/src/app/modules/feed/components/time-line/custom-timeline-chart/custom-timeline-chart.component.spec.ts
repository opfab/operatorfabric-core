/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {CustomTimelineChartComponent} from './custom-timeline-chart.component';
import {APP_BASE_HREF, CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';
import * as moment from 'moment';
import {MouseWheelDirective} from '../directives/mouse-wheel.directive';
import * as _ from 'lodash';
import {Store, StoreModule} from '@ngrx/store';
import {RouterStateSerializer, StoreRouterConnectingModule} from '@ngrx/router-store';
import {CustomRouterStateSerializer} from '@ofStates/router.state';
import {TimeService} from '@ofServices/time.service';
import {appReducer, storeConfig} from '@ofStore/index';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

describe('CustomTimelineChartComponent', () => {
  let component: CustomTimelineChartComponent;
  let fixture: ComponentFixture<CustomTimelineChartComponent>;

  const startDate = moment().startOf('year');
  const endDate = moment().startOf('year').add(1,'year');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule,
        BrowserAnimationsModule,
        FormsModule,
        StoreModule.forRoot(appReducer, storeConfig),
        RouterTestingModule,
        StoreRouterConnectingModule,
        NgxChartsModule,
        NgbModule,
        HttpClientTestingModule],
      declarations: [ CustomTimelineChartComponent,
   MouseWheelDirective],
      providers: [{provide: APP_BASE_HREF, useValue: '/'},
        {provide: Store, useClass: Store},
        {provide: RouterStateSerializer, useClass: CustomRouterStateSerializer},
        {provide: TimeService, useClass: TimeService}],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(CustomTimelineChartComponent);
    component = fixture.componentInstance;
    component.xDomain = [moment().valueOf,moment().add(1,'year').valueOf];

  }));



  it('should call update() and create chart by calling updateXAxisWidth function', () => {
    fixture.detectChanges();
    component.domainId = 'W'
    component.updateXAxisHeight({height: 1024});
    expect(component).toBeTruthy();
  });


  it('should test checkFollowClockTick && updateRealTimeDate functions with : ' +
    'an empty ticks list, ' +
    'a ticks list of moment with a length biggest than 5, ' +
    'followClockTick set to true', () => {
    fixture.detectChanges();
    expect(component.checkFollowClockTick()).toBeFalsy();
    component.followClockTick = true;
    component.updateRealTimeDate();
    component.xTicks = [];
    component.xDomain = [0, 1];
    const tmp = moment();
    tmp.millisecond(0);
    for (let i = 0; i < 6; i++) {
      component.xTicks.push(tmp);
    }
    expect(component.checkFollowClockTick()).toBeTruthy();
    expect(component).toBeTruthy();
  });

  it('should test checkFollowClockTick function with a ticks list ' +
    'of moment (next day) with a length biggest than 5', () => {
      fixture.detectChanges();
    component.xTicks = [];
    component.xDomain = [0, 1];
    const tmp = moment();
    tmp.add(1, 'day');
    for (let i = 0; i < 6; i++) {
      component.xTicks.push(tmp);
    }
    expect(component.checkFollowClockTick()).toBeFalsy();
    expect(component).toBeTruthy();
  });



  it('set no circle if no card ', () => {
    fixture.detectChanges();
    component.domainId = 'Y'
    component.xDomain = [startDate,endDate];
    component.setXTicksValue();
    component.cardsData = [];
    component.createCircles();
    expect(component.circles.length).toEqual(0);

  });

  it('set one circle with count=1 if one card ', () => {
    fixture.detectChanges();
    component.domainId = 'Y'
    component.xDomain = [startDate,endDate];
    component.setXTicksValue();

    // Test 1
    const card1 = {
      date:   moment(startDate).add(5,'day').add(1,'hour'),
      severity: 'ALARM',
      summary: {parameters: 'param', key: 'process'},
      publisher: 'TEST',
      processVersion: '1',
    };

    component.cardsData = [card1];
    component.createCircles();

    expect(component.circles.length).toEqual(1);
    expect(component.circles[0].count).toEqual(1);
    expect(component.circles[0].circleYPosition).toEqual(4);
  });

  it('set no circle if one card is before time domain ', () => {
    fixture.detectChanges();
    component.domainId = 'Y'
    component.xDomain = [startDate,endDate];
    component.setXTicksValue();

    // Test 1
    const card1 = {
      date:   moment(startDate).subtract(2,'day'),
      severity: 'ALARM',
      summary: {parameters: 'param', key: 'process'},
      publisher: 'TEST',
      processVersion: '1',
    };

    component.cardsData = [card1];
    component.createCircles();

    expect(component.circles.length).toEqual(0);

  });

  it('set no circle if one card is after time domain ', () => {
    fixture.detectChanges();
    component.domainId = 'Y'
    component.xDomain = [startDate,endDate];
    component.setXTicksValue();
    // Test 1
    const card1 = {
      date:  moment(endDate).add(1,'hour'),
      severity: 'ALARM',
      summary: {parameters: 'param', key: 'process'},
      publisher: 'TEST',
      processVersion: '1',
    };

    component.cardsData = [card1];
    component.createCircles();

    expect(component.circles.length).toEqual(0);

  });

  it('set one circle with count=2 if two card in the same interval and same severity ', () => {
    fixture.detectChanges();
    component.domainId = 'Y'
    component.xDomain = [startDate,endDate];
    component.setXTicksValue();

    const card1 = {
      date:   moment(startDate).add(2,'day').add(1,'hour'),
      severity: 'ALARM',
      summary: {parameters: 'param', key: 'process'},
      publisher: 'TEST',
      processVersion: '1',
    };


    const card2 = {
      date: moment(startDate).add(4,'day').add(2,'hour'),
      severity: 'ALARM',
      summary: { parameters: 'param', key: 'process' },
      publisher: 'TEST',
      processVersion: '1',
    };

    component.cardsData = [card1,card2];
    component.createCircles();

    expect(component.circles.length).toEqual(1);
    expect(component.circles[0].count).toEqual(2);

  });


  it('set two circles with count=1 if two card are not in the same interval but same severity ', () => {
    fixture.detectChanges();
    component.domainId = 'Y'
    component.xDomain = [startDate,endDate];
    component.setXTicksValue();

    const card1 = {
      date:  moment(startDate).add(2,'day').add(1,'hour'),
      severity: 'ALARM',
      summary: {parameters: 'param', key: 'process'},
      publisher: 'TEST',
      processVersion: '1',
    };

    const card2 = {
      date: moment(startDate).add(2,'month').add(1,'hour'),
      severity: 'ALARM',
      summary: { parameters: 'param', key: 'process' },
      publisher: 'TEST',
      processVersion: '1',
    };

    component.cardsData = [card1,card2];
    component.createCircles();

    expect(component.circles.length).toEqual(2);
    expect(component.circles[0].count).toEqual(1);
    expect(component.circles[1].count).toEqual(1);

  });

  it('set two circles with count=1 if two cards are in the same interval but not same severity ', () => {
    fixture.detectChanges();
    component.domainId = 'Y'
    component.xDomain = [startDate,endDate];
    component.setXTicksValue();

    const card1 = {
      date: moment(startDate).add(2,'day').add(1,'hour'),
      severity: 'ALARM',
      summary: {parameters: 'param', key: 'process'},
      publisher: 'TEST',
      processVersion: '1',
    };

    const card2 = {
      date: moment(startDate).add(4,'day').add(1,'hour'),
      severity: 'INFORMATION',
      summary: { parameters: 'param', key: 'process' },
      publisher: 'TEST',
      processVersion: '1',
    };

    component.cardsData = [card1,card2];
    component.createCircles();

    expect(component.circles.length).toEqual(2);
    expect(component.circles[0].count).toEqual(1);
    expect(component.circles[1].count).toEqual(1);

  });

  it('set two circles with one count=1 and one count= 2 if three cards of same severity  and 2 in the same interval ', () => {
    fixture.detectChanges();
    component.domainId = 'Y'
    component.xDomain = [startDate,endDate];
    component.setXTicksValue();

    const card1 = {
      date:  moment(startDate).add(2,'day').add(1,'hour'),
      severity: 'ALARM',
      summary: {parameters: 'param', key: 'process'},
      publisher: 'TEST',
      processVersion: '1',
    };

    const card2 = {
      date: moment(startDate).add(4,'day').add(1,'hour'),
      severity: 'ALARM',
      summary: { parameters: 'param', key: 'process' },
      publisher: 'TEST',
      processVersion: '1',
    };

    const card3 = {
      date: moment(startDate).add(6,'month').add(1,'hour'),
      severity: 'ALARM',
      summary: { parameters: 'param', key: 'process' },
      publisher: 'TEST',
      processVersion: '1',
    };

    component.cardsData = [card1,card2,card3];
    component.createCircles();

    expect(component.circles.length).toEqual(2);
    expect(component.circles[0].count).toEqual(2);
    expect(component.circles[1].count).toEqual(1);

  });


  it('set three card in the same interval and same severity , the end date should be the max date of the cards ', () => {
    fixture.detectChanges();
    component.domainId = 'Y'
    component.xDomain = [startDate,endDate];
    component.setXTicksValue();

    const card1 = {
      date:  moment(startDate).add(2,'day').add(1,'hour'),
      severity: 'ALARM',
      summary: {parameters: 'param', key: 'process'},
      publisher: 'TEST',
      processVersion: '1',
    };


    const card2 = {
      date: moment(startDate).add(5,'day').add(1,'hour'),
      severity: 'ALARM',
      summary: { parameters: 'param', key: 'process' },
      publisher: 'TEST',
      processVersion: '1',
    };

    const card3 = {
      date:  moment(startDate).add(3,'day').add(1,'hour'),
      severity: 'ALARM',
      summary: { parameters: 'param', key: 'process' },
      publisher: 'TEST',
      processVersion: '1',
    };


    component.cardsData = [card1,card2,card3];
    component.createCircles();

    expect(component.circles.length).toEqual(1);
    expect(component.circles[0].end).toEqual(card2.date);

  });

  it('set three cards in the same interval and same severity , there shoud be one circle with 3 summary  ', () => {
    fixture.detectChanges();
    component.domainId = 'Y'
    component.xDomain = [startDate,endDate];
    component.setXTicksValue();

    const card1 = {
      date:   moment(startDate).add(5,'day').add(1,'hour'),
      severity: 'ALARM',
      summary: {parameters: 'param', key: 'process'},
      publisher: 'TEST',
      processVersion: '1',
    };


    const card2 = {
      date:  moment(startDate).add(6,'day').add(3,'hour'),
      severity: 'ALARM',
      summary: { parameters: 'param', key: 'process' },
      publisher: 'TEST',
      processVersion: '1',
    };

    const card3 = {
      date:  moment(startDate).add(8,'day').add(8,'hour'),
      severity: 'ALARM',
      summary: { parameters: 'param', key: 'process' },
      publisher: 'TEST',
      processVersion: '1',
    };


    component.cardsData = [card1,card2,card3];
    component.createCircles();

    expect(component.circles.length).toEqual(1);
    expect(component.circles[0].summary.length).toEqual(3);

  });

});
