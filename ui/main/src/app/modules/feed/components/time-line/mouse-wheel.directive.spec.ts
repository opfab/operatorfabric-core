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
import {Component, DebugElement, NO_ERRORS_SCHEMA} from "@angular/core";
import {MouseWheelDirective} from "./mouse-wheel.directive";
import {By} from "@angular/platform-browser";

let component: CustomTimelineChartComponent;
let store: Store<AppState>;
let fixture: ComponentFixture<CustomTimelineChartComponent>;
let inputEl: DebugElement;

describe('Directive: AppMouseWheel', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CommonModule,
                BrowserAnimationsModule,
                FormsModule,
                StoreModule.forRoot(appReducer, storeConfig),
                RouterTestingModule,
                StoreRouterConnectingModule,
                NgxChartsModule ],
            declarations: [ TimeLineComponent, CustomTimelineChartComponent, InitChartComponent, MouseWheelDirective ],
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
        inputEl = fixture.debugElement.query(By.css('ngx-charts-chart'));
    });

    it('Mouse wheel event mousewheel', () => {
        inputEl.triggerEventHandler('mousewheel', null);
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('Mouse wheel event DOMMouseScroll', () => {
        inputEl.triggerEventHandler('DOMMouseScroll', null);
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('Mouse wheel event onmousewheel', () => {
        inputEl.triggerEventHandler('onmousewheel', null);
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
});
