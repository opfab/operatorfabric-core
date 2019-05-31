import {async, ComponentFixture, TestBed} from '@angular/core/testing';


import {CommonModule} from "@angular/common";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule} from "@angular/forms";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState, storeConfig} from "@ofStore/index";
import {RouterTestingModule} from "@angular/router/testing";
import {RouterStateSerializer, StoreRouterConnectingModule} from "@ngrx/router-store";
import {NgxChartsModule} from "@swimlane/ngx-charts";
import {TimeLineComponent} from "./time-line.component";
import {CustomTimelineChartComponent} from "../custom-timeline-chart/custom-timeline-chart.component";
import {InitChartComponent} from "../init-chart/init-chart.component";
import {CustomRouterStateSerializer} from "@ofStates/router.state";
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {XAxisTickFormatPipe} from "./x-axis-tick-format.pipe";
import * as moment from "moment";

let component: CustomTimelineChartComponent;
let store: Store<AppState>;
let fixture: ComponentFixture<CustomTimelineChartComponent>;

describe('Directive: XAxisTickFormatPipe', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CommonModule,
                BrowserAnimationsModule,
                FormsModule,
                StoreModule.forRoot(appReducer, storeConfig),
                RouterTestingModule,
                StoreRouterConnectingModule,
                NgxChartsModule ],
            declarations: [ TimeLineComponent, CustomTimelineChartComponent, InitChartComponent, XAxisTickFormatPipe ],
            providers: [{provide: Store, useClass: Store},{provide: RouterStateSerializer, useClass: CustomRouterStateSerializer}],
            schemas: [ NO_ERRORS_SCHEMA ]
        })
        .compileComponents();
    });

    beforeEach(() => {
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        fixture = TestBed.createComponent(CustomTimelineChartComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('Check transform fct :' +
        'return the string like it is, if no lang specified', () => {
        fixture.detectChanges();
        const start = 'not Date';
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
        formatPipe.transform(start, null, 'Y');
        expect(component).toBeTruthy();
    });

    it('Check transform fct :' +
        'return format date on Month Zoom configuration', () => {
        fixture.detectChanges();
        const start = moment();
        start.hours(0).minutes(0).seconds(0).millisecond(0);
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
        formatPipe.transform(start, 'en-US', 'M');
        expect(component).toBeTruthy();
    });

    it('Check transform fct :' +
        'return format first day of year on Month Zoom configuration', () => {
        fixture.detectChanges();
        const start = moment();
        start.hours(0).minutes(0).seconds(0).millisecond(0);
        start.startOf('year');
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
        formatPipe.transform(start, 'en-US', 'M');
        expect(component).toBeTruthy();
    });

    it('Check transform fct :' +
        'return format date on Year Zoom configuration', () => {
        fixture.detectChanges();
        const start = moment();
        start.hours(0).minutes(0).seconds(0).millisecond(0);
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
        formatPipe.transform(start, 'en-US', 'Y');
        expect(component).toBeTruthy();
    });

    it('Check transform fct :' +
        'return format first day of year on Year Zoom configuration', () => {
        fixture.detectChanges();
        const start = moment();
        start.hours(0).minutes(0).seconds(0).millisecond(0);
        start.startOf('year');
        const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
        formatPipe.transform(start, 'en-US', 'Y');
        expect(component).toBeTruthy();
    });
});
