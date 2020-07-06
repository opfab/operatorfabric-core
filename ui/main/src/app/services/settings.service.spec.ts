/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {environment} from '../../environments/environment';
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState} from "../store/index";
import {SettingsService} from "@ofServices/settings.service";
import {AcceptLogIn, PayloadForSuccessfulAuthentication} from "@ofActions/authentication.actions";

describe('Businessconfig Services', () => {
    let injector: TestBed;
    let settingsService: SettingsService;
    let httpMock: HttpTestingController;
    let store: Store<AppState>;
    let settings = {
        setting1: 'one',
        setting2: 'two'
    };
    let settingsUrl = `${environment.urls.users}/users/test-user/settings`;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(appReducer),
                HttpClientTestingModule,
                // RouterTestingModule,
                ],
            providers: [
                // {provide: store, useClass: Store},
                SettingsService,
            ]
        });
        injector = getTestBed();
        store = TestBed.get(Store);
        // spyOn(store, 'dispatch').and.callThrough();
        // avoid exceptions during construction and init of the component
        // spyOn(store, 'select').and.callFake(() => of('/test/url'));
        httpMock = injector.get(HttpTestingController);
        settingsService = TestBed.get(SettingsService);
        store.dispatch(new AcceptLogIn(new PayloadForSuccessfulAuthentication('test-user',null,null,null)))
    });
    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(settingsService).toBeTruthy();
    });

    describe('#fetchSettings', () => {
        it('should return settings on 200', () => {
            settingsService.fetchUserSettings().subscribe(
                result => expect(eval(result)).toBe(settings)
            )
            let calls = httpMock.match(req => req.url == settingsUrl);
            expect(calls.length).toEqual(1);
            calls[0].flush(settings);
        });

    });
    describe('#patchSettings', () => {
        it('should return settings on 200', () => {
            settingsService.patchUserSettings({patched:"value"}).subscribe(
                result => expect(eval(result)).toEqual({...settings, patched: "value"})
            )
            let calls = httpMock.match(req => req.url == settingsUrl);
            expect(calls.length).toEqual(1);
            calls[0].flush({...settings, patched: "value"});
        });

    });

})
;

