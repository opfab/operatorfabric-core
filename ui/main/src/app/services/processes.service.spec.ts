/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {getTestBed, TestBed} from '@angular/core/testing';

import {ProcessesService} from './processes.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {environment} from '@env/environment';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {RouterTestingModule} from '@angular/router/testing';
import {Store, StoreModule} from '@ngrx/store';
import {appReducer, AppState} from '@ofStore/index';
import {BusinessconfigI18nLoaderFactory, getRandomAlphanumericValue} from '@tests/helpers';
import {AuthenticationService} from '@ofServices/authentication/authentication.service';
import {GuidService} from '@ofServices/guid.service';
import {ConfigService} from '@ofServices/config.service';
import {Process} from '@ofModel/processes.model';
import {EffectsModule} from '@ngrx/effects';
import {MenuEffects} from '@ofEffects/menu.effects';


describe('Processes Services', () => {
    let injector: TestBed;
    let processesService: ProcessesService;
    let translateService: TranslateService;
    let httpMock: HttpTestingController;
    let store: Store<AppState>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(appReducer),
                EffectsModule.forRoot([MenuEffects]),
                HttpClientTestingModule,
                RouterTestingModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useFactory: BusinessconfigI18nLoaderFactory
                    },
                    useDefaultLang: false
                })],
            providers: [
                {provide: store, useClass: Store},
                ProcessesService,
                AuthenticationService,
                GuidService,
                ConfigService
            ]
        });
        injector = getTestBed();
        store = TestBed.inject(Store);
        spyOn(store, 'dispatch').and.callThrough();
        // avoid exceptions during construction and init of the component
        // spyOn(store, 'select').and.callFake(() => of('/test/url'));
        httpMock = injector.get(HttpTestingController);
        processesService = TestBed.inject(ProcessesService);
        translateService = injector.get(TranslateService);
        translateService.addLangs(['en', 'fr']);
        translateService.setDefaultLang('en');
        translateService.use('en');
    });
    afterEach(() => {
        httpMock.verify();
    });


    describe('#fetchHbsTemplate', () => {
            const templates = {
                en: 'English template {{card.data.name}}',
                fr: 'Template Français {{card.data.name}}'
            };
        it('should return different files for each language', () => {
            processesService.fetchHbsTemplate('testPublisher', '0', 'testTemplate', 'en')
                .subscribe((result) => expect(result).toEqual('English template {{card.data.name}}'));
            processesService.fetchHbsTemplate('testPublisher', '0', 'testTemplate', 'fr')
                .subscribe((result) => expect(result).toEqual('Template Français {{card.data.name}}'));
            const calls = httpMock.match(req => req.url === `${environment.urls.processes}/testPublisher/templates/testTemplate`);
            expect(calls.length).toEqual(2);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush(templates[call.request.params.get('locale')]);
            });
        });
    });


    it('should compute url with encoding special characters', () => {
        const urlFromPublishWithSpaces = processesService.computeBusinessconfigCssUrl('publisher with spaces'
            , getRandomAlphanumericValue(3, 12)
            , getRandomAlphanumericValue(2.5));
        expect(urlFromPublishWithSpaces.includes(' ')).toEqual(false);
        const dico = new Map();
        dico.set('À', '%C3%80');
        dico.set('à', '%C3%A0');
        dico.set('É', '%C3%89');
        dico.set('é', '%C3%A9');
        dico.set('È', '%C3%88');
        dico.set('è', '%C3%A8');
        dico.set('Â', '%C3%82');
        dico.set('â', '%C3%A2');
        dico.set('Ô', '%C3%94');
        dico.set('ô', '%C3%B4');
        dico.set('Ù', '%C3%99');
        dico.set('ù', '%C3%B9');
        dico.set('Ï', '%C3%8F');
        dico.set('ï', '%C3%AF');
        let stringToTest = '';
        for (const char of dico.keys()) {
            stringToTest += char;
        }
        const urlFromPublishWithAccentuatedChar = processesService.computeBusinessconfigCssUrl(`publisherWith${stringToTest}`
            , getRandomAlphanumericValue(3, 12)
            , getRandomAlphanumericValue(3, 4));
        dico.forEach((value, key) => {
            expect(urlFromPublishWithAccentuatedChar.includes(key)).toEqual(false);
            // `should normally contain '${value}'`
            expect(urlFromPublishWithAccentuatedChar.includes(value)).toEqual(true);
        });
        const urlWithSpacesInVersion = processesService.computeBusinessconfigCssUrl(getRandomAlphanumericValue(5, 12)
            , getRandomAlphanumericValue(5.12),
            'some spaces in version');
        expect(urlWithSpacesInVersion.includes(' ')).toEqual(false);

        const urlWithAccentuatedCharsInVersion = processesService.computeBusinessconfigCssUrl(getRandomAlphanumericValue(5, 12)
            , getRandomAlphanumericValue(5.12)
            , `${stringToTest}InVersion`);
        dico.forEach((value, key) => {
            expect(urlWithAccentuatedCharsInVersion.includes(key)).toEqual(false);
            // `should normally contain '${value}'`
            expect(urlWithAccentuatedCharsInVersion.includes(value)).toEqual(true);
        });

    });
    describe('#queryProcess', () => {
        const businessconfig = new Process('testPublisher', '0', 'businessconfig.label');
        it('should load businessconfig from remote server', () => {
            processesService.queryProcess('testPublisher', '0')
                .subscribe((result) => expect(result).toEqual(businessconfig));
            const calls = httpMock.match(req => req.url === `${environment.urls.processes}/testPublisher/`);
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush(businessconfig);
            });
        });
    });
    describe('#queryProcess', () => {
        const businessconfig = new Process('testPublisher', '0', 'businessconfig.label');
        it('should load and cache businessconfig from remote server', () => {
            processesService.queryProcess('testPublisher', '0')
                .subscribe((result) => {
                    expect(result).toEqual(businessconfig);
                    processesService.queryProcess('testPublisher', '0')
                        .subscribe((extracted) => expect(extracted).toEqual(businessconfig));
                });
            const calls = httpMock.match(req => req.url === `${environment.urls.processes}/testPublisher/`);
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush(businessconfig);
            });
        });
    });

})
;


