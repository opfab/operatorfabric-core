import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {APP_BASE_HREF, CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {TimeLineComponent} from './time-line.component';
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
                NgxChartsModule ],
            declarations: [ TimeLineComponent, CustomTimelineChartComponent, InitChartComponent, XAxisTickFormatPipe ],
            providers: [{provide: APP_BASE_HREF, useValue: '/'},
                {provide: Store, useClass: Store},
                {provide: RouterStateSerializer, useClass: CustomRouterStateSerializer},
                {provide: TimeService, useClass: TimeService}],
            schemas: [ NO_ERRORS_SCHEMA ]
        })
        .compileComponents();
        fixture = TestBed.createComponent(CustomTimelineChartComponent);
        component = fixture.componentInstance;
    }));

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('Check transform & transformHovered function : ' +
        'return param when cluster level isnt identified ' +
        'return nothing for transformAdvanced function', () => {
        fixture.detectChanges();
        const start = moment();
        // const startCopy = moment(start);
        const tmp = start.format('M');
        // console.log(tmp, startCopy.format('M'))
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
        expect(formatPipe.transform(tmp, null)).toEqual(tmp);
        expect(formatPipe.transformHovered(tmp, null)).toEqual(tmp);
        expect(formatPipe.transformAdvanced(start, null)).toEqual('');
        expect(component).toBeTruthy();
    });

    it('Check transform & transformHovered function : ' +
        'return formatted date on Week Zoom configuration', () => {
        fixture.detectChanges();
        const start = moment();
        start.date(4).hours(0).minutes(0).seconds(0).millisecond(0);
        const startCopy = moment(start);
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
        expect(formatPipe.transform(start, 'W')).toEqual(startCopy.format('ddd DD MMM'));
        start.hours(4);
        startCopy.hours(4);
        expect(formatPipe.transform(start, 'W')).toEqual(startCopy.format('HH'));
        expect(component).toBeTruthy();
    });

    it('Check transform & transformHovered function : ' +
        'return formatted date on Month Zoom configuration', () => {
        fixture.detectChanges();
        const start = moment();
        start.date(3).startOf('day');
        start.hours(0).minutes(0).seconds(0).millisecond(0);
        const startCopy = moment(start);
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
        formatPipe.transformHovered(start, 'M');
        expect(formatPipe.transform(start, 'M')).toEqual(startCopy.format('ddd DD MMM'));
        expect(component).toBeTruthy();
    });

    it('Check transform & transformHovered function : ' +
        'return formatted date on Year Zoom configuration', () => {
        fixture.detectChanges();
        const start = moment();
        start.date(16).startOf('day');
        start.hours(0).minutes(0).seconds(0).millisecond(0);
        const startCopy = moment(start);
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
        formatPipe.transformHovered(start, 'Y');
        expect(formatPipe.transform(start, 'Y')).toEqual(startCopy.format('D MMM'));
        expect(component).toBeTruthy();
    });

    it('Check transform & transformHovered function : ' +
        'return formatted first day of year on Week Zoom configuration', () => {
        fixture.detectChanges();
        const start = moment();
        start.hours(0).minutes(0).seconds(0).millisecond(0);
        start.startOf('year');
        const startCopy = moment(start);
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
        formatPipe.transformHovered(start, 'W');
        expect(formatPipe.transform(start, 'W')).toEqual(startCopy.format('ddd DD MMM YYYY'));
        expect(component).toBeTruthy();
    });

    it('Check transform function : ' +
        'return formatted first day of year on Month Zoom configuration', () => {
        fixture.detectChanges();
        const start = moment();
        start.hours(0).minutes(0).seconds(0).millisecond(0);
        start.startOf('year');
        const startCopy = moment(start);
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
        expect(formatPipe.transform(start, 'M')).toEqual(startCopy.format('DD MMM YY'));
        expect(component).toBeTruthy();
    });

    it('Check transform function : ' +
        'return formatted first day of year on Year Zoom configuration', () => {
        fixture.detectChanges();
        const start = moment();
        start.hours(0).minutes(0).seconds(0).millisecond(0);
        start.startOf('year');
        const startCopy = moment(start);
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
        expect(formatPipe.transform(start, 'Y')).toEqual(startCopy.format('D MMM YY'));
        expect(component).toBeTruthy();
    });

   /* it('Check transformAdvanced function : ' +
        'return empty string', () => {
        fixture.detectChanges();
        const start = moment();
        start.hours(0).minutes(0).seconds(0).millisecond(0);
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
        expect(formatPipe.transformAdvanced(start, 'Y')).toEqual('00h');
        expect(component).toBeTruthy();
    });*/
});
