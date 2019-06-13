/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ConfigEffects} from './config.effects';
import {Actions} from '@ngrx/effects';
import {cold, hot} from 'jasmine-marbles';
import {
    ConfigActions,
    ConfigActionTypes,
    LoadConfig,
    LoadConfigFailure,
    LoadConfigSuccess, LoadSettings, LoadSettingsSuccess
} from "@ofActions/config.actions";
import {async} from "@angular/core/testing";
import {ConfigService} from "@ofServices/config.service";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {selectConfigRetry} from "@ofSelectors/config.selectors";
import {of} from "rxjs";
import SpyObj = jasmine.SpyObj;
import {AcceptLogIn} from "@ofActions/authentication.actions";

describe('ConfigEffects', () => {
    let effects: ConfigEffects;
    let configService: SpyObj<ConfigService>;
    let mockStore: SpyObj<Store<AppState>>;

    beforeEach(async(() => {
        configService = jasmine.createSpyObj('ConfigService', ['fetchConfiguration','fetchUserSettings']);
        mockStore = jasmine.createSpyObj('Store', ['dispatch', 'select']);

    }))
    describe('loadConfiguration', () => {
        it('should return a LoadConfigsSuccess when the configService serve configuration', () => {
            const expectedConfig = {value: {subValue1: 1, subValue2: 2}};

            const localActions$ = new Actions(hot('-a--', {a: new LoadConfig()}));

            // const localMockConfigService = jasmine.createSpyObj('ConfigService', ['fetchConfiguration']);

            configService.fetchConfiguration.and.returnValue(hot('---b', {b: expectedConfig}));
            const expectedAction = new LoadConfigSuccess({config: expectedConfig});
            const localExpected = hot('---c', {c: expectedAction});

            effects = new ConfigEffects(mockStore, localActions$, configService);

            expect(effects).toBeTruthy();
            expect(effects.loadConfiguration).toBeObservable(localExpected);
        });
        it('should return a LoadConfigsFailure when the configService doesn\'t serve configuration', () => {

            const localActions$ = new Actions(hot('-a--', {a: new LoadConfig()}));
            configService.fetchConfiguration.and.returnValue(hot('---#'));
            effects = new ConfigEffects(mockStore, localActions$, configService);
            expect(effects).toBeTruthy();
            effects.loadConfiguration.subscribe((action: ConfigActions) => expect(action.type).toEqual(ConfigActionTypes.LoadConfigFailure));
            // expect(effects.loadConfiguration).toBeObservable(localExpected);
        });
    });
    describe('retryConfigurationLoading', () => {
        it('should return a LoadConfig if not much retry', () => {
            mockStore.select.withArgs(selectConfigRetry).and.returnValue(of(1));
            const localActions$ = new Actions(hot('-a--', {a: new LoadConfigFailure({error: new Error('test message')})}));

            const expectedAction = new LoadConfig();
            const localExpected = hot('-c', {c: expectedAction});

            effects = new ConfigEffects(mockStore, localActions$, configService,0);
            expect(effects).toBeTruthy();
            expect(effects.retryConfigurationLoading).toBeObservable(localExpected);
        })
    })
    describe('loadSettings', () => {
        it('should return a LoadSettingsSuccess when the configService serve settings', () => {
            const expectedSettings = {value: 1};

            const localActions$ = new Actions(hot('-a--', {a: new LoadSettings()}));

            // const localMockConfigService = jasmine.createSpyObj('ConfigService', ['fetchConfiguration']);

            configService.fetchUserSettings.and.returnValue(hot('---b', {b: expectedSettings}));
            const expectedAction = new LoadSettingsSuccess({settings: expectedSettings});
            const localExpected = hot('---c', {c: expectedAction});

            effects = new ConfigEffects(mockStore, localActions$, configService);

            expect(effects).toBeTruthy();
            expect(effects.loadSettings).toBeObservable(localExpected);
        });
        it('should return a LoadSettingsFailure when the configService doesn\'t serve settings', () => {

            const localActions$ = new Actions(hot('-a--', {a: new LoadSettings()}));
            configService.fetchUserSettings.and.returnValue(hot('---#'));
            effects = new ConfigEffects(mockStore, localActions$, configService);
            expect(effects).toBeTruthy();
            effects.loadSettings.subscribe((action: ConfigActions) => expect(action.type).toEqual(ConfigActionTypes.LoadSettingsFailure));
            // expect(effects.loadConfiguration).toBeObservable(localExpected);
        });
    });
    describe('loadSettingsOnLogin', () => {
        it('should return a LoadSettings Action', () => {

            const localActions$ = new Actions(hot('-a--', {a: new AcceptLogIn(null)}));

            const expectedAction = new LoadSettings();
            const localExpected = hot('-c--', {c: expectedAction});

            effects = new ConfigEffects(mockStore, localActions$, configService);

            expect(effects).toBeTruthy();
            expect(effects.loadSettingsOnLogin).toBeObservable(localExpected);
        });
    });
});
