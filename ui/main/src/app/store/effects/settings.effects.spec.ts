/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {SettingsEffects} from './settings.effects';
import {Actions} from '@ngrx/effects';
import {hot} from 'jasmine-marbles';
import {LoadSettings, LoadSettingsSuccess, SettingsActions, SettingsActionTypes} from "@ofActions/settings.actions";
import {async} from "@angular/core/testing";
import {SettingsService} from "@ofServices/settings.service";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {AcceptLogIn} from "@ofActions/authentication.actions";
import SpyObj = jasmine.SpyObj;

describe('SettingsEffects', () => {
    let effects: SettingsEffects;
    let settingsService: SpyObj<SettingsService>;
    let mockStore: SpyObj<Store<AppState>>;

    beforeEach(async(() => {
        settingsService = jasmine.createSpyObj('SettingsService', ['fetchUserSettings']);
        mockStore = jasmine.createSpyObj('Store', ['dispatch', 'select']);

    }))
    describe('loadSettings', () => {
        it('should return a LoadSettingsSuccess when the settingsService serve settings', () => {
            const expectedSettings = {value: 1};

            const localActions$ = new Actions(hot('-a--', {a: new LoadSettings()}));

            // const localMockSettingsService = jasmine.createSpyObj('SettingsService', ['fetchSettingsuration']);

            settingsService.fetchUserSettings.and.returnValue(hot('---b', {b: expectedSettings}));
            const expectedAction = new LoadSettingsSuccess({settings: expectedSettings});
            const localExpected = hot('---c', {c: expectedAction});

            effects = new SettingsEffects(mockStore, localActions$, settingsService);

            expect(effects).toBeTruthy();
            expect(effects.loadSettings).toBeObservable(localExpected);
        });
        it('should return a LoadSettingsFailure when the settingsService doesn\'t serve settings', () => {

            const localActions$ = new Actions(hot('-a--', {a: new LoadSettings()}));
            settingsService.fetchUserSettings.and.returnValue(hot('---#'));
            effects = new SettingsEffects(mockStore, localActions$, settingsService);
            expect(effects).toBeTruthy();
            effects.loadSettings.subscribe((action: SettingsActions) => expect(action.type).toEqual(SettingsActionTypes.LoadSettingsFailure));
            // expect(effects.loadSettingsuration).toBeObservable(localExpected);
        });
    });
    describe('loadSettingsOnLogin', () => {
        it('should return a LoadSettings Action', () => {

            const localActions$ = new Actions(hot('-a--', {a: new AcceptLogIn(null)}));

            const expectedAction = new LoadSettings();
            const localExpected = hot('-c--', {c: expectedAction});

            effects = new SettingsEffects(mockStore, localActions$, settingsService);

            expect(effects).toBeTruthy();
            expect(effects.loadSettingsOnLogin).toBeObservable(localExpected);
        });
    });
});
