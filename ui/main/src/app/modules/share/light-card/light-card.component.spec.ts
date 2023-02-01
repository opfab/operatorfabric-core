/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';

import {LightCardComponent} from './light-card.component';
import {BusinessconfigI18nLoaderFactory, injectedSpy} from '@tests/helpers';
import {RouterTestingModule} from '@angular/router/testing';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {Store, StoreModule} from '@ngrx/store';
import {appReducer, AppState} from '@ofStore/index';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {ProcessesService} from 'app/business/services/processes.service';
import {Router} from '@angular/router';
import {I18nService} from 'app/business/services/i18n.service';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CountDownModule} from '../countdown/countdown.module';
import createSpyObj = jasmine.createSpyObj;
import {DateTimeFormatterService} from 'app/business/services/date-time-formatter.service';
import {PipesModule} from '../pipes/pipes.module';
import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {ConfigServer} from 'app/business/server/config.server';
import {ProcessServerMock} from '@tests/mocks/processServer.mock';
import {ProcessServer} from 'app/business/server/process.server';
import {OpfabEventStreamServer} from 'app/business/server/opfabEventStream.server';

describe('LightCardComponent', () => {
    let lightCardDetailsComp: LightCardComponent;
    let fixture: ComponentFixture<LightCardComponent>;
    let store: Store<AppState>;
    let injector: TestBed;
    let translateService: TranslateService;
    let i18nService: I18nService;

    beforeEach(waitForAsync(() => {
        const routerSpy = createSpyObj('Router', ['navigate']);
        const myrout = {...routerSpy};
        myrout.routerState = {snapshot: {url: 'archives'}};
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                StoreModule.forRoot(appReducer),
                RouterTestingModule,
                HttpClientTestingModule,
                CountDownModule,
                PipesModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useFactory: BusinessconfigI18nLoaderFactory
                    },
                    useDefaultLang: false
                }),
                NgbModule
            ],
            declarations: [LightCardComponent],
            providers: [
                {provide: store, useClass: Store},
                {provide: Router, useValue: myrout},
                ProcessesService,
                {provide: 'TimeEventSource', useValue: null},
                DateTimeFormatterService,
                I18nService,
                {provide: ConfigServer, useClass: ConfigServerMock},
                {provide: ProcessServer, useClass: ProcessServerMock},
                {provide: OpfabEventStreamServer, use:null}
            ]
        }).compileComponents();
        store = TestBed.inject(Store);
        spyOn(store, 'dispatch').and.callThrough();
        // avoid exceptions during construction and init of the component
        injector = getTestBed();
        translateService = injector.get(TranslateService);
        translateService.addLangs(['en', 'fr']);
        translateService.setDefaultLang('en');
        i18nService = injector.get(I18nService);
        i18nService.changeLocale('en');
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LightCardComponent);
        lightCardDetailsComp = fixture.debugElement.componentInstance;
        injectedSpy(Router);
    });
    it('should handle non existent timestamp with an empty string', () => {
        const expectedEmptyString = lightCardDetailsComp.handleDate(undefined);
        expect(expectedEmptyString).toEqual('');
    });

    it('should handle timestamp in English', () => {
        i18nService.changeLocale('en');
        const date = new Date(2019, 5, 25, 10, 0, 0, 0);
        const TwentyFiveJune2019at10AMDateString = lightCardDetailsComp.handleDate(date.valueOf());
        expect(TwentyFiveJune2019at10AMDateString).toEqual('06/25/2019 10:00 AM');
    });

    it('should handle timestamp in French', () => {
        i18nService.changeLocale('fr');
        const date = new Date(2019, 5, 25, 10, 0, 0, 0);
        const TwentyFiveJune2019at10AMDateString = lightCardDetailsComp.handleDate(date.valueOf());
        expect(TwentyFiveJune2019at10AMDateString).toEqual('25/06/2019 10:00');
    });
});
