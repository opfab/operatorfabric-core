/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {getTestBed, TestBed} from '@angular/core/testing';

import {BusinessconfigI18nLoaderFactory, ProcessesService} from './processes.service';
import {HttpClientTestingModule, HttpTestingController, TestRequest} from '@angular/common/http/testing';
import {environment} from '@env/environment';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {RouterTestingModule} from '@angular/router/testing';
import {Store, StoreModule} from '@ngrx/store';
import {appReducer, AppState} from '@ofStore/index';
import {generateBusinessconfigWithVersion, getOneRandomLightCard, getRandomAlphanumericValue} from '@tests/helpers';
import * as _ from 'lodash';
import {LightCard} from '@ofModel/light-card.model';
import {AuthenticationService} from '@ofServices/authentication/authentication.service';
import {GuidService} from '@ofServices/guid.service';
import {Menu, MenuEntry, Process, MenuEntryLinkTypeEnum} from '@ofModel/processes.model';
import {EffectsModule} from '@ngrx/effects';
import {MenuEffects} from '@ofEffects/menu.effects';
import {UpdateTranslation} from '@ofActions/translate.actions';
import {TranslateEffects} from '@ofEffects/translate.effects';
import {I18n} from "@ofModel/i18n.model";

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
                EffectsModule.forRoot([MenuEffects, TranslateEffects]),
                HttpClientTestingModule,
                RouterTestingModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useFactory: BusinessconfigI18nLoaderFactory,
                        deps: [ProcessesService]
                    },
                    useDefaultLang: false
                })],
            providers: [
                {provide: store, useClass: Store},
                ProcessesService,
                AuthenticationService,
                GuidService
            ]
        });
        injector = getTestBed();
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        // avoid exceptions during construction and init of the component
        // spyOn(store, 'select').and.callFake(() => of('/test/url'));
        httpMock = injector.get(HttpTestingController);
        processesService = TestBed.get(ProcessesService);
        translateService = injector.get(TranslateService);
        translateService.addLangs(['en', 'fr']);
        translateService.setDefaultLang('en');
        translateService.use('en');
    });
    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(processesService).toBeTruthy();
    });
    describe('#computeMenu', () => {
        it('should return message on network problem', () => {
            processesService.computeMenu().subscribe(
                result => fail('expected message not raised'),
                error => expect(error.status).toBe(0));
            const calls = httpMock.match(req => req.url === `${environment.urls.processes}/`);
            expect(calls.length).toEqual(1);
            calls[0].error(new ErrorEvent('Network message'));
        });
        it('should compute menu from processes data', () => {
            processesService.computeMenu().subscribe(
                result => {
                    expect(result.length).toBe(2); // 2 Processes -> 2 Menus
                    expect(result[0].label).toBe('process1.menu.label');
                    expect(result[0].id).toBe('process1');
                    expect(result[1].label).toBe('process2.menu.label');
                    expect(result[1].id).toBe('process2');
                    expect(result[0].entries.length).toBe(2);
                    expect(result[1].entries.length).toBe(1);
                    expect(result[0].entries[0].label).toBe('label1');
                    expect(result[0].entries[0].id).toBe('id1');
                    expect(result[0].entries[0].url).toBe('link1');
                    expect(result[0].entries[1].label).toBe('label2');
                    expect(result[0].entries[1].id).toBe('id2');
                    expect(result[0].entries[1].url).toBe('link2');
                    expect(result[1].entries[0].label).toBe('label3');
                    expect(result[1].entries[0].id).toBe('id3');
                    expect(result[1].entries[0].url).toBe('link3');
                });
            const calls = httpMock.match(req => req.url === `${environment.urls.processes}/`);
            expect(calls.length).toEqual(1);
            calls[0].flush([
                new Process(
                    'process1', '1',  'process1.label', [], [], [], 'process1.menu.label',
                    [new MenuEntry('id1', 'label1', 'link1', MenuEntryLinkTypeEnum.BOTH),
                        new MenuEntry('id2', 'label2', 'link2', MenuEntryLinkTypeEnum.BOTH)]
                ),
                new Process(
                    'process2', '1', 'process2.label', [], [], [], 'process2.menu.label',
                    [new MenuEntry('id3', 'label3', 'link3', MenuEntryLinkTypeEnum.BOTH)]
                )
            ]);
        });
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

    it('should update translate service upon new card arrival', (done) => {
        const card = getOneRandomLightCard();
        const i18n = {};
        _.set(i18n, `en.${card.title.key}`, 'en title');
        _.set(i18n, `en.${card.summary.key}`, 'en summary');
        _.set(i18n, `fr.${card.title.key}`, 'titre fr');
        _.set(i18n, `fr.${card.summary.key}`, 'résumé fr');
        const setTranslationSpy = spyOn(translateService, 'setTranslation').and.callThrough();
        const getLangsSpy = spyOn(translateService, 'getLangs').and.callThrough();
        const translationToUpdate = generateBusinessconfigWithVersion(card.publisher, new Set([card.processVersion]));
        store.dispatch(
            new UpdateTranslation({versions: translationToUpdate})
        );
        const calls = httpMock.match(req => req.url === `${environment.urls.processes}/testPublisher/i18n`);
        expect(calls.length).toEqual(2);

        expect(calls[0].request.method).toBe('GET');
        flushI18nJson(calls[0], i18n);
        expect(calls[1].request.method).toBe('GET');
        flushI18nJson(calls[1], i18n);
        setTimeout(() => {
            expect(setTranslationSpy.calls.count()).toEqual(2);
            translateService.use('fr');
            translateService.get(cardPrefix(card) + card.title.key)
                .subscribe(value => expect(value).toEqual('titre fr'));
            translateService.get(cardPrefix(card) + card.summary.key)
                .subscribe(value => expect(value).toEqual('résumé fr'));
            translateService.use('en');
            translateService.get(cardPrefix(card) + card.title.key)
                .subscribe(value => expect(value).toEqual('en title'));
            translateService.get(cardPrefix(card) + card.summary.key)
                .subscribe(value => expect(value).toEqual('en summary'));
            done();
        }, 1000);
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

function flushI18nJson(request: TestRequest, json: any, prefix?: string) {
    const locale = request.request.params.get('locale');
    // console.debug(`flushing ${request.request.urlWithParams}`);
    // console.debug(`request is ${request.cancelled ? '' : 'not'} canceled`);
    request.flush(_.get(json, prefix ? `${locale}.${prefix}` : locale));
}

function cardPrefix(card: LightCard) {
    return card.publisher + '.' + card.processVersion + '.';
}

function businessconfigPrefix(menu: Menu) {
    return menu.id + '.' + menu.version + '.';
}
