/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AppState} from "@ofStore/index";
import {settingsInitialState, SettingsState} from "@ofStates/settings.state";
import {configInitialState, ConfigState} from "@ofStates/config.state";
import {buildSettingsOrConfigSelector, selectMergedSettings} from "@ofSelectors/settings.x.config.selectors";

describe('SettingsXConfigSelectors', () => {
    let emptyAppState: AppState = {
        router: null,
        feed: null,
        timeline: null,
        authentication: null,
        card: null,
        menu: null,
        config: null,
        settings: null,
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
    let loadedConfigState: ConfigState = {
        ...configInitialState,
        loaded: true,
        config: {
            settings: {
                test: {
                    path: {my: {settings: 'default value'}},
                    byDefault:{
                        value: 'default value'
                    }
                }
            }
        }
    };



    it('manage empty', () => {
        let testAppState = {...emptyAppState, settings: settingsInitialState, config: configInitialState};
        expect(selectMergedSettings(testAppState)).toEqual({});
        expect(buildSettingsOrConfigSelector('test.path.my.settings')(testAppState)).toEqual(null);
        expect(buildSettingsOrConfigSelector('test.byDefault.value')(testAppState)).toEqual(null);
        expect(buildSettingsOrConfigSelector('test.byDefault.value','fallback')(testAppState)).toEqual('fallback');
    });

    it('manage loaded settings and config', () => {
        let testAppState = {...emptyAppState, settings: loadedSettingsState, config: loadedConfigState};
        expect(selectMergedSettings(testAppState)).toEqual({
            test: {
                path: {my: {settings: 'value'}},
                byDefault:{
                    value: 'default value'
                }
            }
        });
        expect(buildSettingsOrConfigSelector('test.path.my.settings')(testAppState)).toEqual('value');
        expect(buildSettingsOrConfigSelector('test.byDefault.value')(testAppState)).toEqual('default value');
        expect(buildSettingsOrConfigSelector('test.byDefault.value','fallback')(testAppState)).toEqual('default value');
    });


})
;
