/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {APP_BASE_HREF, CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {TimeLineComponent} from '../time-line.component';
import {CustomTimelineChartComponent} from '../custom-timeline-chart/custom-timeline-chart.component';
import {InitChartComponent} from '../init-chart/init-chart.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {XAxisTickFormatPipe} from './x-axis-tick-format.pipe';
import * as moment from 'moment';
import {TimeService} from "@ofServices/time.service";
import {Store, StoreModule} from "@ngrx/store";
import {RouterStateSerializer, StoreRouterConnectingModule} from "@ngrx/router-store";
import {CustomRouterStateSerializer} from "@ofStates/router.state";
import {appReducer, storeConfig} from "@ofStore/index";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AuthenticationImportHelperForSpecs} from "@ofServices/authentication/authentication.service.spec";

let component: CustomTimelineChartComponent;
let fixture: ComponentFixture<CustomTimelineChartComponent>;

describe('Directive: XAxisTickFormatPipe', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [CommonModule,
                BrowserAnimationsModule,
                FormsModule,
                StoreModule.forRoot(appReducer, storeConfig),
                RouterTestingModule,
                StoreRouterConnectingModule,
                NgxChartsModule,
                HttpClientTestingModule ],
            declarations: [ TimeLineComponent, CustomTimelineChartComponent, InitChartComponent, XAxisTickFormatPipe ],
            providers: [{provide: APP_BASE_HREF, useValue: '/'},
                Store,
                {provide: RouterStateSerializer, useClass: CustomRouterStateSerializer},
                TimeService,
                AuthenticationImportHelperForSpecs],
            schemas: [ NO_ERRORS_SCHEMA ]
        })
        .compileComponents();
        fixture = TestBed.createComponent(CustomTimelineChartComponent);
        component = fixture.componentInstance;
        component.xDomain = [moment().valueOf,moment().add(1,'year').valueOf];
    }));

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('check three functions of transformation: ' +
        'return an empty string when clusterLevel isnt precise', () => {
        fixture.detectChanges();
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe(component.timeService);
        expect(formatPipe.transform(moment(), null)).toEqual('');
        expect(formatPipe.transformAdvanced(moment(), null)).toEqual('');
        expect(formatPipe.transformHovered(moment(), null)).toEqual('');
        expect(component).toBeTruthy();
    });

    it('Check transform & transformHovered functions: ' +
        'return param received when its a string', () => {
        fixture.detectChanges();
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe(component.timeService);
        expect(formatPipe.transform('test', null)).toEqual('test');
        expect(formatPipe.transformHovered('test', null)).toEqual('test');
        expect(component).toBeTruthy();
    });

    it('Check transform & transformHovered functions: ' +
        'return date formatted by the clusterLevel pass on param', () => {
        fixture.detectChanges();
        const start = moment();
        start.date(3);
        start.hours(0).minutes(0).seconds(0).millisecond(0);
        const startCopy = moment(start);
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe(component.timeService);
        expect(formatPipe.transform(start, 'DD MM YY')).toEqual(startCopy.format('DD MM YY'));
        expect(formatPipe.transformHovered(start, 'DD MM YY')).toEqual(startCopy.format('DD MM YY'));
        expect(component).toBeTruthy();
    });


    it('Check transformHovered functions: ' +
        'return formatted date on W Zoom configuration', () => {
        fixture.detectChanges();
        const start = moment();
        start.date(3);
        start.hours(0).minutes(0).seconds(0).millisecond(0);
        const startCopy = moment(start);
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe(component.timeService);
        expect(formatPipe.transformHovered(start, 'Hou')).toEqual(startCopy.format('ddd DD MMM HH') + 'h');
        expect(formatPipe.transformHovered(start, 'Day')).toEqual(startCopy.format('ddd DD MMM YYYY'));
        expect(formatPipe.transformHovered(start, 'Min')).toEqual(startCopy.format('ddd DD MMM HH')
            + 'h' + startCopy.format('mm'));
    });

    it('Check transformAdvanced function: ' +
        'return formatted date on Min, Sec and nbW Zoom configuration', () => {
        fixture.detectChanges();
        const start = moment();
        start.date(16).startOf('day');
        start.hours(0).minutes(0).seconds(0).millisecond(0);
        const startCopy = moment(start);
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe(component.timeService);
        expect(formatPipe.transformAdvanced(start, 'Min')).toEqual(startCopy.format('mm'));
        expect(formatPipe.transformAdvanced(start, 'Sec')).toEqual(startCopy.format('ss'));
        expect(formatPipe.transformAdvanced(start, 'nbW')).toEqual(startCopy.format('ww'));
        expect(component).toBeTruthy();
    });

    xit('Check transform functions: ' +
        'return formatted date on W Zoom configuration', () => {
        fixture.detectChanges();
        const start = moment();
        start.date(4).hours(0).minutes(0).seconds(0).millisecond(0);
        const startCopy = moment(start);
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe(component.timeService);
        expect(formatPipe.transform(start, 'Hou')).toEqual(startCopy.format('ddd DD MMM'));
        start.hours(4);
        startCopy.hours(4);
        expect(formatPipe.transform(start, 'Hou')).toEqual(startCopy.format('HH'));
        expect(component).toBeTruthy();
    });

    
    it('Check transform function: ' +
        'return formatted date on M Zoom configuration', () => {
        fixture.detectChanges();
        const start = moment();
        start.date(3).startOf('day');
        start.hours(0).minutes(0).seconds(0).millisecond(0);
        const startCopy = moment(start);
        


        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe(component.timeService);
        expect(formatPipe.transform(start, 'Day')).toEqual(startCopy.format('ddd DD MMM'));
        expect(component).toBeTruthy();
    });

    it('Check transform function: ' +
        'return formatted date on Y Zoom configuration', () => {
        const startDomainYear = moment().startOf('year').hour(0).minutes(0).second(0).millisecond(0).valueOf;
        const endDomainYear = moment().startOf('year').hour(0).minutes(0).second(0).millisecond(0).add(1,'year').valueOf;
        component.xDomain = [startDomainYear,endDomainYear];
        fixture.detectChanges();
        const start = moment();
        start.date(16).startOf('day');
        start.hours(0).minutes(0).seconds(0).millisecond(0);
        const startCopy = moment(start);
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe(component.timeService);
        expect(formatPipe.transform(start, 'Dat')).toEqual(startCopy.format('D MMM'));
        expect(component).toBeTruthy();
    });

    it('Check transform function: ' +
        'return formatted date on RealW, RealM, RealY and nbW Zoom configuration', () => {
        const startDomainYear = moment().startOf('year').hour(0).minutes(0).second(0).millisecond(0).valueOf;
        const endDomainYear = moment().startOf('year').hour(0).minutes(0).second(0).millisecond(0).add(1,'year').valueOf;
        component.xDomain = [startDomainYear,endDomainYear];
        fixture.detectChanges();
        const start = moment();
        start.date(16).startOf('day');
        start.hours(0).minutes(0).seconds(0).millisecond(0);
        const startCopy = moment(start);
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe(component.timeService);
        expect(formatPipe.transform(start, 'Wee')).toEqual(startCopy.format('DD/MM/YY'));
        expect(formatPipe.transform(start, 'Mon')).toEqual(startCopy.format('MMM YY'));
        expect(formatPipe.transform(start, 'Yea')).toEqual(startCopy.format('YYYY'));
        expect(formatPipe.transform(start, 'nbW')).toEqual(startCopy.format('YYYY'));
        expect(component).toBeTruthy();
    });

    it('Check transform function: ' +
        'return formatted date on Min and Sec Zoom configuration', () => {
        fixture.detectChanges();
        const start = moment();
        start.date(16).startOf('day');
        start.hours(0).minutes(0).seconds(0).millisecond(0);
        const startCopy = moment(start);
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe(component.timeService);
        expect(formatPipe.transform(start, 'Min')).toEqual(startCopy.format('ddd DD MMM'));
        expect(formatPipe.transform(start, 'Sec')).toEqual(startCopy.format('ddd DD MMM'));
        start.hours(1);
        startCopy.hours(1);
        expect(formatPipe.transform(start, 'Min')).toEqual(startCopy.format('HH') + 'h');
        expect(formatPipe.transform(start, 'Sec')).toEqual(startCopy.format('HH') + 'h');
        start.minute(1);
        startCopy.minutes(1);
        expect(formatPipe.transform(start, 'Sec')).toEqual(startCopy.format('mm'));
        expect(component).toBeTruthy();
    });

    it('Check transform function: ' +
        'return formatted first day of year on W Zoom configuration', () => {
        fixture.detectChanges();
        const start = moment();
        start.hours(0).minutes(0).seconds(0).millisecond(0);
        start.startOf('year');
        const startCopy = moment(start);
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe(component.timeService);
        expect(formatPipe.transform(start, 'Hou')).toEqual(startCopy.format('DD MMM YY'));
        expect(component).toBeTruthy();
    });

    it('Check transform function: ' +
        'return formatted first day of year on M Zoom configuration', () => {
        fixture.detectChanges();
        const start = moment();
        start.hours(0).minutes(0).seconds(0).millisecond(0);
        start.startOf('year');
        const startCopy = moment(start);
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe(component.timeService);
        expect(formatPipe.transform(start, 'Day')).toEqual(startCopy.format('DD MMM YY'));
        expect(component).toBeTruthy();
    });

    it('Check transform function: ' +
        'return formatted first day of year on Y Zoom configuration', () => {
        fixture.detectChanges();
        const start = moment();
        start.hours(0).minutes(0).seconds(0).millisecond(0);
        start.startOf('year');
        const startCopy = moment(start);
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe(component.timeService);
        expect(formatPipe.transform(start, 'Dat')).toEqual(startCopy.format('D MMM YY'));
        expect(component).toBeTruthy();
    });
});
