import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {APP_BASE_HREF, CommonModule} from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TimeLineComponent } from './time-line.component';
import { CustomTimelineChartComponent } from '../custom-timeline-chart/custom-timeline-chart.component';
import { InitChartComponent } from '../init-chart/init-chart.component';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DraggableDirective } from './app-draggable';
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
            declarations: [ TimeLineComponent, CustomTimelineChartComponent, InitChartComponent, DraggableDirective ],
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

    it('simulate the combination of events when we make a drag on the chart ' +
        'emit all draggable directive signal', () => {
        // expect(component.onDragMove)
        inputEl.triggerEventHandler('pointerdown', null);
        inputEl.triggerEventHandler('pointermove', null);
        inputEl.triggerEventHandler('pointerup', null);
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('simulate the combination of events : mouse move & mouse release ' +
        'on the chart, nothing happen', () => {
        inputEl.triggerEventHandler('pointermove', null);
        inputEl.triggerEventHandler('pointerup', null);
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
});
