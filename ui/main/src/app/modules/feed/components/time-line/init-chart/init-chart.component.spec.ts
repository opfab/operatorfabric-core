/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {InitChartComponent} from './init-chart.component';
import {APP_BASE_HREF, CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {CustomTimelineChartComponent} from '../custom-timeline-chart/custom-timeline-chart.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {Store, StoreModule} from '@ngrx/store';
import {appReducer, storeConfig} from '@ofStore/index';
import {RouterStateSerializer, StoreRouterConnectingModule} from '@ngrx/router-store';
import {CustomRouterStateSerializer} from '@ofStates/router.state';
import {RouterTestingModule} from '@angular/router/testing';
import {MouseWheelDirective} from '../directives/mouse-wheel.directive';
import {TimeService} from '@ofServices/time.service';


describe('InitChartComponent', () => {
  let component: InitChartComponent;
  let fixture: ComponentFixture<InitChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule,
        BrowserAnimationsModule,
        FormsModule,
        StoreModule.forRoot(appReducer, storeConfig),
        RouterTestingModule,
        StoreRouterConnectingModule,
        NgxChartsModule ],
      declarations: [ InitChartComponent, CustomTimelineChartComponent, MouseWheelDirective],
      providers: [{provide: APP_BASE_HREF, useValue: '/'},
        {provide: Store, useClass: Store},
        {provide: RouterStateSerializer, useClass: CustomRouterStateSerializer},
        {provide: TimeService, useClass: TimeService}],
      schemas: [ NO_ERRORS_SCHEMA ],
    })
    .compileComponents();
    fixture = TestBed.createComponent(InitChartComponent);
    component = fixture.componentInstance;
  }));


  it('should create button list', () => {
    fixture.detectChanges();
    component.confDomain = [{
      buttonTitle: '7D',
      domainId:'7D',
      followClockTick: true
    }];
    component.initDomains();
    expect(component.buttonList.length).toEqual(1);
    expect(component).toBeTruthy();
  });


  xit('should apply differents zoom movements on timeline' +
      'should verify domain value is changed after calling moveDomain & homeClick functions', () => {
    fixture.detectChanges();
    const tmp = component.buttonTitle;
    component.applyNewZoom('drag');
    expect(tmp).toEqual(component.buttonTitle);
    expect(component.buttonHomeActive).toBeTruthy();

    component.followClockTickMode = true;
    component.homeClick(1, 2);
    expect(component.buttonHomeActive).toBeFalsy();
    expect(component.followClockTick).toBeTruthy();
    expect(component.myDomain).toEqual([1, 2]);

    // check domain change after call moveDomain function with any buttonTitle
    let domain = component.myDomain;
    component.moveDomain(true);
    expect(component.followClockTick).toBeFalsy();
    expect(domain).not.toEqual(component.myDomain);
    domain = component.myDomain;
    component.moveDomain(false);
    expect(domain).not.toEqual(component.myDomain);

    component.followClockTick = true;
    domain = component.myDomain;
    component.buttonTitle = 'M';
    component.moveDomain(true);
    expect(component.followClockTick).toBeFalsy();
    expect(domain).not.toEqual(component.myDomain);
    domain = component.myDomain;
    component.moveDomain(false);
    expect(domain).not.toEqual(component.myDomain);

    domain = component.myDomain;
    component.buttonTitle = 'Y';
    component.moveDomain(true);
    expect(domain).not.toEqual(component.myDomain);
    domain = component.myDomain;
    component.moveDomain(false);
    expect(domain).not.toEqual(component.myDomain);
    expect(component).toBeTruthy();
  });


  it('check applyNewZoom function with only one button' +
      'forward level activated is different', () => {
    fixture.detectChanges();
    component.buttonTitle = 'W';
    component.buttonList = [{buttonTitle: 'M',domainId:'M'}];
    const tmp = component.buttonTitle;
    component.applyNewZoom('in');
    // no change expected, cause button buttonList is not equal to buttonTitle
    expect(tmp).toEqual(component.buttonTitle);
    component.applyNewZoom('out');
    expect(tmp).toEqual(component.buttonTitle);
    expect(component).toBeTruthy();
  });

  it('check applyNewZoom function with only one button' +
      'forward level activated is same than one button', () => {
    fixture.detectChanges();
    component.buttonTitle = 'W';
    component.buttonList = [{buttonTitle: 'W'}];
    const tmp = component.buttonTitle;
    component.applyNewZoom('in');
    // no change expected, cause buttonList got only one button
    expect(tmp).toEqual(component.buttonTitle);
    component.applyNewZoom('out');
    expect(tmp).toEqual(component.buttonTitle);
    expect(component).toBeTruthy();
  });

  it('check applyNewZoom function with two buttons' +
      'forward level activated is same than last button', () => {
    fixture.detectChanges();
    component.buttonTitle = 'W';
    component.buttonList = [{buttonTitle: 'M',domainId:'M'}, {buttonTitle: 'W',domainId:'W'}];
    component.applyNewZoom('in');
    // change expected, cause buttonList got two buttons :
    //  - one is the same than actual buttonTitle
    //  - next one has buttonList differe
    expect(component.buttonTitle).toEqual('M');
    expect(component.buttonList[0].selected).toBeTruthy();
    expect(component.buttonList[1].selected).toBeFalsy();
    component.applyNewZoom('out');
    expect(component.buttonTitle).toEqual('W');
    expect(component.buttonList[0].selected).toBeFalsy();
    expect(component.buttonList[1].selected).toBeTruthy();

    expect(component).toBeTruthy();
  });

});
