/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {reducer} from "@ofStore/reducers/settings.reducer";
import {getRandomAlphanumericValue} from "@tests/helpers";
import {
    LoadSettings,
    LoadSettingsFailure,
    LoadSettingsSuccess,
    PatchSettings,
    PatchSettingsFailure,
    PatchSettingsSuccess
} from "@ofActions/settings.actions";
import {settingsInitialState, SettingsState} from "@ofStates/settings.state";

describe('Config Reducer', () => {
    describe('unknown action', () => {
        it('should return the initial state unchange', () => {
            const unknownAction = {} as any;
            const actualState = reducer(settingsInitialState, unknownAction);
            expect(actualState).toBe(settingsInitialState);
        });

        it('should return the previous state on living state', () => {
            const unknowAction = {} as any;
            const previousState: SettingsState = {
                settings:{test:'config'},
                loading: false,
                error: getRandomAlphanumericValue(5, 12),
                loaded:false
            }
            const actualState = reducer(previousState, unknowAction);
            expect(actualState).toBe(previousState);
        });
    });
    describe('Load Setting action', () => {
        it('should set state load to true', () => {
            // settingsInitialState.load is false
            const actualState = reducer(settingsInitialState,
                new LoadSettings());
            expect(actualState).not.toBe(settingsInitialState);
            expect(actualState.loading).toEqual(true);
        });
        it('should leave state load to true', () => {
            const previousState: SettingsState = {
                settings: null,
                loading: true,
                error: null,
                loaded:false
            }
            const actualState = reducer(previousState,
                new LoadSettings());
            expect(actualState).not.toBe(previousState);
            expect(actualState).toEqual(previousState);
        });
    });
    describe('LoadSettingsFailure', () => {
        it('should set loading to false and message to specific message', () => {
            const actualSettings = {test:'config'};
            const previousState: SettingsState = {
                settings: actualSettings,
                loading: true,
                error: null,
                loaded:false
            };
            const actualState = reducer(previousState,
                new LoadSettingsFailure({error: new Error(getRandomAlphanumericValue(5, 12))}));
            expect(actualState).not.toBe(previousState);
            expect(actualState).not.toEqual(previousState);
            expect(actualState.loading).toEqual(false);
            expect(actualState.error).not.toBeNull();
            expect(actualState.loaded).toEqual(false);

        });
    });
    describe('LoadSettingsSuccess', () => {
        it('should set loading to false and selected to corresponding payload', () => {
            const previousSettings = {test:'config'};
            const previousState: SettingsState = {
                settings: previousSettings,
                loading: true,
                error: getRandomAlphanumericValue(5, 12),
                loaded:false
            };

            const actualSettings = {setting:'config2'};
            const actualState = reducer(previousState, new LoadSettingsSuccess({settings: actualSettings}));
            expect(actualState).not.toBe(previousState);
            expect(actualState).not.toEqual(previousState);
            expect(actualState.error).toEqual(previousState.error);
            expect(actualState.loading).toEqual(false);
            expect(actualState.settings).toEqual(actualSettings);
            expect(actualState.loaded).toEqual(true);
        });
    });
    describe('Patch Setting action', () => {
        it('should set state loading to true', () => {
            // settingsInitialState.patch is false
            const actualState = reducer(settingsInitialState,
                new PatchSettings({settings:{prop:"value"}}));
            expect(actualState).not.toBe(settingsInitialState);
            expect(actualState.loading).toEqual(true);
        });
        it('should leave state loading to true', () => {
            const previousState: SettingsState = {
                settings: null,
                loading: true,
                error: null,
                loaded:false
            }
            const actualState = reducer(previousState,
                new PatchSettings({settings:{prop:"value"}}));
            expect(actualState).not.toBe(previousState);
            expect(actualState).toEqual(previousState);
        });
    });
    describe('PatchSettingsFailure', () => {
        it('should set loading to false and message to specific message', () => {
            const actualSettings = {test:'config'};
            const previousState: SettingsState = {
                settings: actualSettings,
                loading: true,
                error: null,
                loaded:false
            };
            const actualState = reducer(previousState,
                new PatchSettingsFailure({error: new Error(getRandomAlphanumericValue(5, 12))}));
            expect(actualState).not.toBe(previousState);
            expect(actualState).not.toEqual(previousState);
            expect(actualState.loading).toEqual(false);
            expect(actualState.error).not.toBeNull();
            expect(actualState.loaded).toEqual(false);

        });
    });
    describe('PatchSettingsSuccess', () => {
        it('should set loading to false and settings to payload', () => {
            const previousSettings = {test:'config'};
            const previousState: SettingsState = {
                settings: previousSettings,
                loading: true,
                error: getRandomAlphanumericValue(5, 12),
                loaded:false
            };

            const actualSettings = {setting:'config2'};
            const actualState = reducer(previousState, new PatchSettingsSuccess({settings: actualSettings}));
            expect(actualState).not.toBe(previousState);
            expect(actualState).not.toEqual(previousState);
            expect(actualState.error).toEqual(previousState.error);
            expect(actualState.loading).toEqual(false);
            expect(actualState.settings).toEqual(actualSettings);
            expect(actualState.loaded).toEqual(true);
        });
    });
});