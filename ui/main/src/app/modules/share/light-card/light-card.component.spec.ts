/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
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
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {Router} from '@angular/router';
import {I18nService} from 'app/business/services/translation/i18n.service';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CountDownModule} from '../countdown/countdown.module';
import createSpyObj = jasmine.createSpyObj;
import {PipesModule} from '../pipes/pipes.module';
import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {ConfigServer} from 'app/business/server/config.server';
import {ProcessServerMock} from '@tests/mocks/processServer.mock';
import {OpfabEventStreamServer} from 'app/business/server/opfabEventStream.server';
import {ExternalDevicesServer} from 'app/business/server/external-devices.server';
import {RemoteLoggerServer} from 'app/business/server/remote-logger.server';
import {EntitiesServer} from 'app/business/server/entities.server';
import {UserServer} from 'app/business/server/user.server';
import {SoundServer} from 'app/business/server/sound.server';
import {TranslationService} from 'app/business/services/translation/translation.service';
import {TranslationServiceMock} from '@tests/mocks/translation.service.mock';
import {AcknowledgeServer} from '../../../business/server/acknowledge.server';
import {ConfigService} from 'app/business/services/config.service';
import {AngularTranslationService} from '@ofServices/angularTranslationService';
import {DateTimeFormatterService} from 'app/business/services/date-time-formatter.service';

describe('LightCardComponent', () => {
    let lightCardDetailsComp: LightCardComponent;
    let fixture: ComponentFixture<LightCardComponent>;
    let injector: TestBed;
    let translateService: TranslateService;

    beforeEach(waitForAsync(() => {
        const routerSpy = createSpyObj('Router', ['navigate']);
        const myrout = {...routerSpy};
        myrout.routerState = {snapshot: {url: 'archives'}};
        ConfigService.setConfigServer(new ConfigServerMock());
        ProcessesService.setProcessServer(new ProcessServerMock());
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
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
                {provide: Router, useValue: myrout},
                {provide: 'TimeEventSource', useValue: null},
                I18nService,
                {provide: ConfigServer, useClass: ConfigServerMock},
                {provide: RemoteLoggerServer, useValue: null},
                {provide: OpfabEventStreamServer, use: null},
                {provide: EntitiesServer, useValue: null},
                {provide: UserServer, useValue: null},
                {provide: ExternalDevicesServer, use: null},
                {provide: SoundServer, use: null},
                {provide: TranslationService, useClass: TranslationServiceMock},
                {provide: AcknowledgeServer, useClass: null}
            ]
        }).compileComponents();
        // avoid exceptions during construction and init of the component
        injector = getTestBed();
        translateService = injector.get(TranslateService);
        translateService.addLangs(['en', 'fr']);
        translateService.setDefaultLang('en');
        I18nService.setTranslationService(new AngularTranslationService(translateService));
        I18nService.changeLocale('en');
        DateTimeFormatterService.init();
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
        I18nService.changeLocale('en');
        const date = new Date(2019, 5, 25, 10, 0, 0, 0);
        const TwentyFiveJune2019at10AMDateString = lightCardDetailsComp.handleDate(date.valueOf());
        expect(TwentyFiveJune2019at10AMDateString).toEqual('06/25/2019 10:00 AM');
    });

    it('should handle timestamp in French', () => {
        I18nService.changeLocale('fr');
        const date = new Date(2019, 5, 25, 10, 0, 0, 0);
        const TwentyFiveJune2019at10AMDateString = lightCardDetailsComp.handleDate(date.valueOf());
        expect(TwentyFiveJune2019at10AMDateString).toEqual('25/06/2019 10:00');
    });
});
