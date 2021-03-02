/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
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
import {GlobalStyleService} from "@ofServices/global-style.service";
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {TimelineButtonsComponent} from "../../../../share/timeline-buttons/timeline-buttons.component";
import {ConfigService} from "@ofServices/config.service";
import {HttpClient, HttpHandler} from "@angular/common/http";
import {AppService} from "@ofServices/app.service";


describe('InitChartComponent', () => {
  let component: InitChartComponent;
  let timelineButtonsComponent: TimelineButtonsComponent;
  let fixture: ComponentFixture<InitChartComponent>;
  let fixture2: ComponentFixture<TimelineButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule,
        BrowserAnimationsModule,
        FormsModule,
        StoreModule.forRoot(appReducer, storeConfig),
        RouterTestingModule,
        StoreRouterConnectingModule.forRoot(),
        NgxChartsModule,
        NgbModule],
      declarations: [ InitChartComponent, CustomTimelineChartComponent, MouseWheelDirective, TimelineButtonsComponent],
      providers: [{provide: APP_BASE_HREF, useValue: '/'},
        {provide: Store, useClass: Store},
        {provide: RouterStateSerializer, useClass: CustomRouterStateSerializer},
        {provide: TimeService, useClass: TimeService},
        {provide: ConfigService, useClass: ConfigService},
        {provide: HttpClient, useClass: HttpClient},
        {provide: HttpHandler, useClass: HttpHandler},
        {provide: AppService, useClass: AppService},
        {provide: GlobalStyleService, useClass: GlobalStyleService}],
      schemas: [ NO_ERRORS_SCHEMA ],
    })
    .compileComponents();
    fixture = TestBed.createComponent(InitChartComponent);
    component = fixture.componentInstance;

    fixture2 = TestBed.createComponent(TimelineButtonsComponent);
    timelineButtonsComponent = fixture2.componentInstance;
  }));


  it('should create button list', () => {
    fixture.detectChanges();
    timelineButtonsComponent.confDomain = [{
      buttonTitle: '7D',
      domainId:'7D',
      followClockTick: true
    }];
    timelineButtonsComponent.initDomains();
    expect(timelineButtonsComponent.buttonList.length).toEqual(1);
    expect(component).toBeTruthy();
  });


  xit('should apply different zoom movements on timeline' +
      'should verify domain value is changed after calling moveDomain function', () => {
    fixture.detectChanges();
    const tmp = timelineButtonsComponent.buttonTitle;
    timelineButtonsComponent.applyNewZoom('drag');
    expect(tmp).toEqual(timelineButtonsComponent.buttonTitle);

    timelineButtonsComponent.followClockTickMode = true;
    expect(timelineButtonsComponent.followClockTick).toBeTruthy();
    expect(timelineButtonsComponent.myDomain).toEqual([1, 2]);

    // check domain change after call moveDomain function with any buttonTitle
    let domain = timelineButtonsComponent.myDomain;
    timelineButtonsComponent.moveDomain(true);
    expect(timelineButtonsComponent.followClockTick).toBeFalsy();
    expect(domain).not.toEqual(timelineButtonsComponent.myDomain);
    domain = timelineButtonsComponent.myDomain;
    timelineButtonsComponent.moveDomain(false);
    expect(domain).not.toEqual(timelineButtonsComponent.myDomain);

    timelineButtonsComponent.followClockTick = true;
    domain = timelineButtonsComponent.myDomain;
    timelineButtonsComponent.buttonTitle = 'M';
    timelineButtonsComponent.moveDomain(true);
    expect(timelineButtonsComponent.followClockTick).toBeFalsy();
    expect(domain).not.toEqual(timelineButtonsComponent.myDomain);
    domain = timelineButtonsComponent.myDomain;
    timelineButtonsComponent.moveDomain(false);
    expect(domain).not.toEqual(timelineButtonsComponent.myDomain);

    domain = timelineButtonsComponent.myDomain;
    timelineButtonsComponent.buttonTitle = 'Y';
    timelineButtonsComponent.moveDomain(true);
    expect(domain).not.toEqual(timelineButtonsComponent.myDomain);
    domain = timelineButtonsComponent.myDomain;
    timelineButtonsComponent.moveDomain(false);
    expect(domain).not.toEqual(timelineButtonsComponent.myDomain);
    expect(component).toBeTruthy();
  });


  it('check applyNewZoom function with only one button' +
      'forward level activated is different', () => {
    fixture.detectChanges();
    timelineButtonsComponent.buttonTitle = 'W';
    timelineButtonsComponent.buttonList = [{buttonTitle: 'M',domainId:'M'}];
    const tmp = timelineButtonsComponent.buttonTitle;
    timelineButtonsComponent.applyNewZoom('in');
    // no change expected, cause button buttonList is not equal to buttonTitle
    expect(tmp).toEqual(timelineButtonsComponent.buttonTitle);
    timelineButtonsComponent.applyNewZoom('out');
    expect(tmp).toEqual(timelineButtonsComponent.buttonTitle);
    expect(component).toBeTruthy();
  });

  it('check applyNewZoom function with only one button' +
      'forward level activated is same than one button', () => {
    fixture.detectChanges();
    timelineButtonsComponent.buttonTitle = 'W';
    timelineButtonsComponent.buttonList = [{buttonTitle: 'W'}];
    const tmp = timelineButtonsComponent.buttonTitle;
    timelineButtonsComponent.applyNewZoom('in');
    // no change expected, cause buttonList got only one button
    expect(tmp).toEqual(timelineButtonsComponent.buttonTitle);
    timelineButtonsComponent.applyNewZoom('out');
    expect(tmp).toEqual(timelineButtonsComponent.buttonTitle);
    expect(component).toBeTruthy();
  });

  it('check applyNewZoom function with two buttons' +
      'forward level activated is same than last button', () => {
    fixture.detectChanges();
    timelineButtonsComponent.buttonTitle = 'W';
    timelineButtonsComponent.buttonList = [{buttonTitle: 'M',domainId:'M'}, {buttonTitle: 'W',domainId:'W'}];
    timelineButtonsComponent.applyNewZoom('in');
    // change expected, cause buttonList got two buttons :
    //  - one is the same than actual buttonTitle
    //  - next one has buttonList differe
    expect(timelineButtonsComponent.buttonTitle).toEqual('M');
    expect(timelineButtonsComponent.buttonList[0].selected).toBeTruthy();
    expect(timelineButtonsComponent.buttonList[1].selected).toBeFalsy();
    timelineButtonsComponent.applyNewZoom('out');
    expect(timelineButtonsComponent.buttonTitle).toEqual('W');
    expect(timelineButtonsComponent.buttonList[0].selected).toBeFalsy();
    expect(timelineButtonsComponent.buttonList[1].selected).toBeTruthy();

    expect(component).toBeTruthy();
  });

});
