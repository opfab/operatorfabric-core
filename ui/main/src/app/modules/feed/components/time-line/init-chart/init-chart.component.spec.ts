/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
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
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {GlobalStyleService} from '@ofServices/global-style.service';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {TimelineButtonsComponent} from '../../../../share/timeline-buttons/timeline-buttons.component';
import {ConfigService} from 'app/business/services/config.service';
import {HttpClient, HttpHandler} from '@angular/common/http';
import {AppService} from '@ofServices/app.service';
import {BusinessconfigI18nLoaderFactory} from '@tests/helpers';
import {LightCardsServiceMock} from '@tests/mocks/lightcards.service.mock';
import {LightCardsFeedFilterService} from '@ofServices/lightcards/lightcards-feed-filter.service';
import {OpfabLoggerService} from '@ofServices/logs/opfab-logger.service';
import {RemoteLoggerService} from '@ofServices/logs/remote-logger.service';
import {RemoteLoggerServiceMock} from '@tests/mocks/remote-logger.service.mock';
import {DateTimeFormatterService} from 'app/business/services/date-time-formatter.service';
import {ConfigServer} from 'app/business/server/config.server';
import {ConfigServerMock} from '@tests/mocks/configServer.mock';

describe('InitChartComponent', () => {
    let component: InitChartComponent;
    let timelineButtonsComponent: TimelineButtonsComponent;
    let fixture: ComponentFixture<InitChartComponent>;
    let fixture2: ComponentFixture<TimelineButtonsComponent>;
    let translate: TranslateService;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                BrowserAnimationsModule,
                FormsModule,
                StoreModule.forRoot(appReducer, storeConfig),
                RouterTestingModule,
                StoreRouterConnectingModule.forRoot(),
                NgxChartsModule,
                NgbModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useFactory: BusinessconfigI18nLoaderFactory
                    },
                    useDefaultLang: false
                })
            ],
            declarations: [
                InitChartComponent,
                CustomTimelineChartComponent,
                MouseWheelDirective,
                TimelineButtonsComponent
            ],
            providers: [
                {provide: APP_BASE_HREF, useValue: '/'},
                {provide: Store, useClass: Store},
                {provide: RouterStateSerializer, useClass: CustomRouterStateSerializer},
                {provide: DateTimeFormatterService, useClass: DateTimeFormatterService},
                {provide: ConfigService, useClass: ConfigService},
                {provide: ConfigServer, useClass: ConfigServerMock},
                {provide: HttpClient, useClass: HttpClient},
                {provide: HttpHandler, useClass: HttpHandler},
                {provide: AppService, useClass: AppService},
                {provide: GlobalStyleService, useClass: GlobalStyleService},
                {provide: LightCardsFeedFilterService, useClass: LightCardsServiceMock},
                {provide: OpfabLoggerService, useClass: OpfabLoggerService},
                {provide: RemoteLoggerService, useClass: RemoteLoggerServiceMock}
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(InitChartComponent);
        component = fixture.componentInstance;

        fixture2 = TestBed.createComponent(TimelineButtonsComponent);
        timelineButtonsComponent = fixture2.componentInstance;
    }));

    it('check applyNewZoom function with only one button' + 'forward level activated is different', () => {
        fixture.detectChanges();
        timelineButtonsComponent.selectedButtonTitle = 'W';
        timelineButtonsComponent.buttonList = [{buttonTitle: 'M', domainId: 'M'}];
        const tmp = timelineButtonsComponent.selectedButtonTitle;
        timelineButtonsComponent.applyNewZoom('in');
        // no change expected, cause button buttonList is not equal to buttonTitle
        expect(tmp).toEqual(timelineButtonsComponent.selectedButtonTitle);
        timelineButtonsComponent.applyNewZoom('out');
        expect(tmp).toEqual(timelineButtonsComponent.selectedButtonTitle);
        expect(component).toBeTruthy();
    });

    it('check applyNewZoom function with only one button' + 'forward level activated is same than one button', () => {
        fixture.detectChanges();
        timelineButtonsComponent.selectedButtonTitle = 'W';
        timelineButtonsComponent.buttonList = [{buttonTitle: 'W'}];
        const tmp = timelineButtonsComponent.selectedButtonTitle;
        timelineButtonsComponent.applyNewZoom('in');
        // no change expected, cause buttonList got only one button
        expect(tmp).toEqual(timelineButtonsComponent.selectedButtonTitle);
        timelineButtonsComponent.applyNewZoom('out');
        expect(tmp).toEqual(timelineButtonsComponent.selectedButtonTitle);
        expect(component).toBeTruthy();
    });

    it('check applyNewZoom function with two buttons' + 'forward level activated is same than last button', () => {
        fixture.detectChanges();
        timelineButtonsComponent.selectedButtonTitle = 'W';
        timelineButtonsComponent.buttonList = [
            {buttonTitle: 'M', domainId: 'M'},
            {buttonTitle: 'W', domainId: 'W'}
        ];
        timelineButtonsComponent.applyNewZoom('in');
        // change expected, cause buttonList got two buttons :
        //  - one is the same than actual buttonTitle
        //  - next one has buttonList differe
        expect(timelineButtonsComponent.selectedButtonTitle).toEqual('M');
        expect(timelineButtonsComponent.buttonList[0].selected).toBeTruthy();
        expect(timelineButtonsComponent.buttonList[1].selected).toBeFalsy();
        timelineButtonsComponent.applyNewZoom('out');
        expect(timelineButtonsComponent.selectedButtonTitle).toEqual('W');
        expect(timelineButtonsComponent.buttonList[0].selected).toBeFalsy();
        expect(timelineButtonsComponent.buttonList[1].selected).toBeTruthy();

        expect(component).toBeTruthy();
    });
});
