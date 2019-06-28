import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {APP_BASE_HREF, CommonModule} from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TimeLineComponent } from './time-line.component';
import { CustomTimelineChartComponent } from '../custom-timeline-chart/custom-timeline-chart.component';
import { InitChartComponent } from '../init-chart/init-chart.component';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { MouseWheelDirective } from './mouse-wheel.directive';
import { By } from '@angular/platform-browser';
import {TimeService} from "@ofServices/time.service";
import {Store, StoreModule} from "@ngrx/store";
import {RouterStateSerializer, StoreRouterConnectingModule} from "@ngrx/router-store";
import {CustomRouterStateSerializer} from "@ofStates/router.state";
import {appReducer, storeConfig} from "@ofStore/index";
import {RouterTestingModule} from "@angular/router/testing";

let component: CustomTimelineChartComponent;
let fixture: ComponentFixture<CustomTimelineChartComponent>;
let inputEl: DebugElement;

describe('Directive: AppMouseWheel', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [CommonModule,
                BrowserAnimationsModule,
                FormsModule,
                StoreModule.forRoot(appReducer, storeConfig),
                RouterTestingModule,
                StoreRouterConnectingModule,
                NgxChartsModule ],
            declarations: [ TimeLineComponent, CustomTimelineChartComponent, InitChartComponent, MouseWheelDirective ],
            providers: [{provide: APP_BASE_HREF, useValue: '/'},
                {provide: Store, useClass: Store},
                {provide: RouterStateSerializer, useClass: CustomRouterStateSerializer},
                {provide: TimeService, useClass: TimeService}],
            schemas: [ NO_ERRORS_SCHEMA ]
        })
        .compileComponents();
        fixture = TestBed.createComponent(CustomTimelineChartComponent);
        component = fixture.componentInstance;
        inputEl = fixture.debugElement.query(By.css('ngx-charts-chart'));
    }));

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

    /*fit('event not window.event & not preventDefault' +
        'event.wheelDelta > 0', () => {
        const event = new WheelEvent('mouseup', {
            deltaX: -200,
            deltaY: -200,
            deltaZ: -200,
        });
        const event2 = new MouseEvent('mouseup', {
            detail: 200,
        });
        inputEl.triggerEventHandler('mousewheel', event);
        inputEl.triggerEventHandler('mousewheel', event2);
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
*/
    it('event not window.event & not preventDefault' +
        'event.wheelDelta > 0', () => {
        inputEl.triggerEventHandler('mousewheel', {wheelDelta: 50});
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('event not window.event & not preventDefault' +
        'event.wheelDelta < 0', () => {
        inputEl.triggerEventHandler('mousewheel', {wheelDelta: -50});
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
});
