/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
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
import {ProcessesService} from '@ofServices/processes.service';
import {Router} from '@angular/router';
import 'moment/locale/fr';
import {TimeService} from '@ofServices/time.service';
import {I18nService} from '@ofServices/i18n.service';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CountDownModule} from '../countdown/countdown.module';
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;


describe('LightCardComponent', () => {
    let lightCardDetailsComp: LightCardComponent;
    let fixture: ComponentFixture<LightCardComponent>;
    let store: Store<AppState>;
    let router: SpyObj<Router>;
    let injector: TestBed;
    let translateService: TranslateService;
    let i18nService: I18nService;


    beforeEach(waitForAsync(() => {
        const routerSpy = createSpyObj('Router', ['navigate']);
        let myrout = {... routerSpy};
        myrout.routerState = { snapshot : {url: "archives"}};
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                StoreModule.forRoot(appReducer),
                RouterTestingModule,
                HttpClientTestingModule,
                CountDownModule,
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
                TimeService, I18nService
            ]}).compileComponents();
        store = TestBed.inject(Store);
        spyOn(store, 'dispatch').and.callThrough();
        // avoid exceptions during construction and init of the component
        injector = getTestBed();
        translateService = injector.get(TranslateService);
        translateService.addLangs(['en', 'fr']);
        translateService.setDefaultLang('en');
        // translateService.use("en");
        i18nService = injector.get(I18nService);
        i18nService.changeLocale('en');

    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LightCardComponent);
        lightCardDetailsComp = fixture.debugElement.componentInstance;
        router = injectedSpy(Router);
    });
    it('should handle non existent timestamp with an empty string', () => {
        const expectedEmptyString = lightCardDetailsComp.handleDate(undefined);
        expect(expectedEmptyString).toEqual('');
    });

    it( 'should handle timestamp in English', () => {
        i18nService.changeLocale('en');
        const date = new Date();
        date.setFullYear(2019);
        date.setMonth(5);
        date.setDate(25);
        date.setHours(10);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setUTCMilliseconds(0);
        const TwentyFiveJune2019at10AMDateString = lightCardDetailsComp.handleDate(date.valueOf());
        expect(TwentyFiveJune2019at10AMDateString).toEqual('06/25/2019 10:00 AM');
        });

    it( 'should handle timestamp in French', () => {
        i18nService.changeLocale('fr');
        const date = new Date();
        date.setFullYear(2019);
        date.setMonth(5);
        date.setDate(25);
        date.setHours(10);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setUTCMilliseconds(0);
        const TwentyFiveJune2019at10AMDateString = lightCardDetailsComp.handleDate(date.valueOf());
        expect(TwentyFiveJune2019at10AMDateString).toEqual('25/06/2019 10:00');
        });


});
