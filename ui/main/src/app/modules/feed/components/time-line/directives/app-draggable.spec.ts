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
import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';
import {By} from '@angular/platform-browser';
import {DraggableDirective} from './app-draggable';
import {TimeService} from '@ofServices/time.service';
import {Store, StoreModule} from '@ngrx/store';
import {RouterStateSerializer, StoreRouterConnectingModule} from '@ngrx/router-store';
import {CustomRouterStateSerializer} from '@ofStates/router.state';
import {appReducer, storeConfig} from '@ofStore/index';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {AuthenticationImportHelperForSpecs} from '@ofServices/authentication/authentication.service.spec';

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
                NgxChartsModule,
                HttpClientTestingModule
            ],
            declarations: [ TimeLineComponent, CustomTimelineChartComponent, InitChartComponent, DraggableDirective ],
            providers: [{provide: APP_BASE_HREF, useValue: '/'},
                {provide: Store, useClass: Store},
                {provide: RouterStateSerializer, useClass: CustomRouterStateSerializer},
                TimeService,
                AuthenticationImportHelperForSpecs],
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

    xit('simulate the combination of events : mouse move & mouse release ' +
        'on the chart, nothing happen', () => {
        inputEl.triggerEventHandler('pointermove', null);
        inputEl.triggerEventHandler('pointerup', null);
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
});
