/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {getTestBed, TestBed} from '@angular/core/testing';

import {ThirdsI18nLoaderFactory, ThirdsService} from './thirds.service';
import {HttpClientTestingModule, HttpTestingController, TestRequest} from '@angular/common/http/testing';
import {environment} from '../../environments/environment';
import {TranslateLoader, TranslateModule, TranslateService} from "@ngx-translate/core";
import {RouterTestingModule} from "@angular/router/testing";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState} from "../store/index";
import {getOneRandomLigthCard, getRandomAlphanumericValue, getRandomMenu} from "../../tests/helpers";
import * as _ from 'lodash';
import {LoadLightCardsSuccess} from "../store/actions/light-card.actions";
import {LightCard} from "../model/light-card.model";
import {AuthenticationService} from "@ofServices/authentication.service";
import {GuidService} from "@ofServices/guid.service";
import {Third, ThirdMenu, ThirdMenuEntry} from "@ofModel/thirds.model";
import {EffectsModule} from "@ngrx/effects";
import {LightCardEffects} from "@ofEffects/light-card.effects";
import {MenuEffects} from "@ofEffects/menu.effects";
import {empty, from, merge, Observable, of, zip} from "rxjs";
import {switchMap} from "rxjs/operators";
import {ConfigService} from "@ofServices/config.service";

describe('Thirds Services', () => {
    let injector: TestBed;
    let configService: ConfigService;
    let httpMock: HttpTestingController;
    let store: Store<AppState>;
    let config = {
        level1:{
            level2: 'value'
        }
    };
    let url = `${environment.urls.config}`;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                // StoreModule.forRoot(appReducer),
                HttpClientTestingModule,
                // RouterTestingModule,
                ],
            providers: [
                // {provide: store, useClass: Store},
                ConfigService,
            ]
        });
        injector = getTestBed();
        // store = TestBed.get(Store);
        // spyOn(store, 'dispatch').and.callThrough();
        // avoid exceptions during construction and init of the component
        // spyOn(store, 'select').and.callFake(() => of('/test/url'));
        httpMock = injector.get(HttpTestingController);
        configService = TestBed.get(ConfigService);
    });
    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(configService).toBeTruthy();
    });
    describe('#fetchConfiguration', () => {
        it('should return configuration on 200', () => {
            configService.fetchConfiguration().subscribe(
                result => expect(eval(result)).toBe(config)
            )
            let calls = httpMock.match(req => req.url == url);
            expect(calls.length).toEqual(1);
            calls[0].flush(config);
        });

    });

})
;

