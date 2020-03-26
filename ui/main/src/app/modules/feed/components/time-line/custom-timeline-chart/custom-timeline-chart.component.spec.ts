/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
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
import {AuthenticationImportHelperForSpecs} from '@ofServices/authentication/authentication.service.spec';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('CustomTimelineChartComponent', () => {
  let component: CustomTimelineChartComponent;
  let fixture: ComponentFixture<CustomTimelineChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule,
        BrowserAnimationsModule,
        FormsModule,
        StoreModule.forRoot(appReducer, storeConfig),
        RouterTestingModule,
        StoreRouterConnectingModule,
        NgxChartsModule,
        HttpClientTestingModule],
      declarations: [ CustomTimelineChartComponent,
   MouseWheelDirective],
      providers: [{provide: APP_BASE_HREF, useValue: '/'},
        {provide: Store, useClass: Store},
        {provide: RouterStateSerializer, useClass: CustomRouterStateSerializer},
        {provide: TimeService, useClass: TimeService},
      AuthenticationImportHelperForSpecs],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(CustomTimelineChartComponent);
    component = fixture.componentInstance;
    component.xDomain = [moment().valueOf,moment().add(1,'year').valueOf];

  }));


  it('should call update() and create chart by calling updateYAxisWidth function', () => {
    fixture.detectChanges();
    component.domainId = 'W'
    component.updateYAxisWidth({width: 1920});
    expect(component).toBeTruthy();
  });

  it('should format dateFirsTick when the domain set is smaller than 1 day', () => {
    fixture.detectChanges();
    component.valueDomain = [0, 5000000];
    expect(component.underDayPeriod).toBeTruthy();
  });

  it('should create', () => {
    fixture.detectChanges();
    component.ngOnInit();
    expect(component).toBeTruthy();
  });

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


  xit('check clusterize functions : ' +
    'two algos create circle when detect one data in the scope of xTicks ' +
    'this test doesnt look the date assigned', () => {
    fixture.detectChanges();
    const tmpMoment = moment();
    component.xTicks.push(tmpMoment);

    // Test 1
    const tmpData = {
      date: tmpMoment,
      color: 'red',
      count: 1,
      cy: 0,
      value: 4,
      summary: {parameters: 'param', key: 'process'},
      publisher: 'TEST',
      publisherVersion: '1',
    };
    component.myData = [[tmpData]];
    component.domainId = 'W'
    component.setTicksAndClusterize([0, 1]);
    expect(component.dataClustered).toEqual([[]]);

    // Test 2
    const tmpData2 = {
      date: moment(),
      color: 'orange',
      count: 1,
      cy: 0,
      value: 3,
      summary: {parameters: 'param2', key: 'process'},
      publisher: 'TEST',
      publisherVersion: '2',
    };
    component.setTicksAndClusterize([tmpData.date.valueOf(), tmpData2.date.valueOf()]);
    // Check if dataClustered was feed with the circle in myData
    // can't compare date cause of _i property inside moment
    expect(component.dataClustered[0][0].start).toEqual(tmpMoment);
    expect(component.dataClustered[0][0].end).toEqual(tmpMoment);
    expect(component.dataClustered[0][0].count).toEqual(1);
    expect(component.dataClustered[0][0].color).toEqual('red');
    expect(component.dataClustered[0][0].cy).toEqual(0);
    expect(component.dataClustered[0][0].value).toEqual(4);
    expect(component.dataClustered[0][0].summary[0].summaryDate).toEqual(tmpMoment.format('DD/MM') + ' - ' + tmpMoment.format('HH:mm') +
    ' : ');
    expect(component.dataClustered[0][0].summary[0].i18nPrefix).toEqual('TEST.1.');
    expect(component.dataClustered[0][0].summary[0].parameters).toEqual('param');
    expect(component.dataClustered[0][0].summary[0].key).toEqual('process');
    expect(component.dataClustered[0][0].r).toEqual(10);
    expect(component.dataClustered[0][2]).toEqual(undefined);

    // Test 3
    const tmpData3 = {
      date: moment(),
      color: 'blue',
      count: 1,
      cy: 0,
      value: 2,
      summary: {parameters: 'param3', key: 'process'},
      publisher: 'TEST',
      publisherVersion: '3',
    };
    tmpData2.date.add(3, 'days');
    tmpData3.date.subtract(3, 'days');
    component.myData = [[tmpData3, tmpData, tmpData2]];
    component.setTicksAndClusterize([tmpData.date.valueOf(), tmpData2.date.valueOf()]);
    // First Circle
    expect(component.dataClustered[0][0].start).toEqual(tmpMoment);
    expect(component.dataClustered[0][0].end).toEqual(tmpMoment);
    expect(component.dataClustered[0][0].count).toEqual(1);
    expect(component.dataClustered[0][0].color).toEqual('red');
    expect(component.dataClustered[0][0].cy).toEqual(0);
    expect(component.dataClustered[0][0].value).toEqual(4);
    expect(component.dataClustered[0][0].summary[0].summaryDate).toEqual(tmpMoment.format('DD/MM') + ' - ' + tmpMoment.format('HH:mm') +
    ' : ');
    expect(component.dataClustered[0][0].summary[0].i18nPrefix).toEqual('TEST.1.');
    expect(component.dataClustered[0][0].summary[0].parameters).toEqual('param');
    expect(component.dataClustered[0][0].summary[0].key).toEqual('process');
    expect(component.dataClustered[0][0].r).toEqual(10);
    // Second Circle
    expect(component.dataClustered[0][1].start).toEqual(tmpData2.date);
    expect(component.dataClustered[0][1].end).toEqual(tmpData2.date);
    expect(component.dataClustered[0][1].count).toEqual(1);
    expect(component.dataClustered[0][1].color).toEqual('orange');
    expect(component.dataClustered[0][1].cy).toEqual(0);
    expect(component.dataClustered[0][1].value).toEqual(3);
    expect(component.dataClustered[0][1].summary[0].summaryDate).toEqual(tmpData2.date.format('DD/MM') + ' - ' + tmpMoment.format('HH:mm') +
    ' : ');
    expect(component.dataClustered[0][1].summary[0].i18nPrefix).toEqual('TEST.2.');
    expect(component.dataClustered[0][1].summary[0].parameters).toEqual('param2');
    expect(component.dataClustered[0][1].summary[0].key).toEqual('process');
    expect(component.dataClustered[0][1].r).toEqual(10);
    // Third circle isn't in the scope of ticks
    expect(component.dataClustered[0][3]).toEqual(undefined);
    expect(component).toBeTruthy();
  });

  it('simulate circle hovered', () => {
    fixture.detectChanges();
    const circleTest = {
      start: moment(),
      end: moment(),
      count: 5,
    };
    const end = moment();
    end.add(1, 'days');
    const circleTestPeriod = {
      start: moment(),
      end,
      count: 5,
    };
    expect(component.circleHovered.period).toEqual('');


    const tmp = component.circleHovered.period;
    component.feedCircleHovered(circleTestPeriod);
    fixture.detectChanges();
    expect(component.circleHovered.period).not.toEqual(tmp);
    expect(component).toBeTruthy();
  });


});
