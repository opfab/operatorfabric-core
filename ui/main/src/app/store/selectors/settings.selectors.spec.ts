/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AppState} from "@ofStore/index";
import {
    buildSettingsSelector,
    selectSettings,
    selectSettingsData,
    selectSettingsLoaded
} from "@ofSelectors/settings.selectors";
import {settingsInitialState, SettingsState} from "@ofStates/settings.state";

describe('SettingsSelectors', () => {
    let emptyAppState: AppState = {
        router: null,
        feed: null,
        timeline: null,
        authentication: null,
        card: null,
        menu: null,
        config: null,
        settings:null,
        archive: null,
        time:null,
        thirdActions:null
    }

    let loadedSettingsState: SettingsState = {
        ...settingsInitialState,
        loaded: true,
        settings: {
            test: {
                path: {my: {settings: 'value'}}
            }
        }
    };

    let errorSettingsState: SettingsState = {
        ...settingsInitialState,
        error: 'this is not working'
    };


    it('manage empty settings', () => {
        let testAppState = {...emptyAppState, settings: settingsInitialState};
        expect(selectSettings(testAppState)).toEqual(settingsInitialState);
        expect(selectSettingsLoaded(testAppState)).toEqual(false);
        expect(selectSettingsData(testAppState)).toEqual({});
        expect(buildSettingsSelector('test.path')(testAppState)).toEqual(null);
        expect(buildSettingsSelector('test.path','fallback')(testAppState)).toEqual('fallback');
    });

    it('manage message settings', () => {
        let testAppState = {...emptyAppState, settings: errorSettingsState};
        expect(selectSettings(testAppState)).toEqual(errorSettingsState);
        expect(selectSettingsLoaded(testAppState)).toEqual(false);
        expect(selectSettingsData(testAppState)).toEqual({});
        expect(selectSettingsData(testAppState)).toEqual({});
        expect(buildSettingsSelector('test.path')(testAppState)).toEqual(null);
        expect(buildSettingsSelector('test.path','fallback')(testAppState)).toEqual('fallback');
    });

    it('manage loaded settings', () => {
        let testAppState = {...emptyAppState, settings: loadedSettingsState};
        expect(selectSettings(testAppState)).toEqual(loadedSettingsState);
        expect(selectSettingsLoaded(testAppState)).toEqual(true);
        expect(selectSettingsData(testAppState)).toEqual({test: {path: {my: {settings: 'value'}}}});
        expect(buildSettingsSelector('test.path')(testAppState)).toEqual({my: {settings: 'value'}});
        expect(buildSettingsSelector('test.path','fallback')(testAppState)).toEqual({my: {settings: 'value'}});
    });


});
