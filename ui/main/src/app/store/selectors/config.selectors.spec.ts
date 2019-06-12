/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AppState} from "@ofStore/index";
import {
    buildConfigSelector,
    selectConfig,
    selectConfigData,
    selectConfigLoaded,
    selectConfigRetry,
    selectMaxedRetries
} from "@ofSelectors/config.selectors";
import {configInitialState, ConfigState} from "@ofStates/config.state";

describe('ConfigSelectors', () => {
    let emptyAppState: AppState = {
        router: null,
        feed: null,
        timeline: null,
        authentication: null,
        card: null,
        menu: null,
        config: null
    }

    let loadedConfigState: ConfigState = {
        ...configInitialState,
        loaded: true,
        retry: 2,
        config: {
            test: {
                path: {my: {config: 'value'}}
            }
        }
    };

    let errorConfigState: ConfigState = {
        ...configInitialState,
        retry: 6,
        error: 'this is not working'
    };


    it('manage empty config', () => {
        let testAppState = {...emptyAppState, config: configInitialState};
        expect(selectConfig(testAppState)).toEqual(configInitialState);
        expect(selectConfigLoaded(testAppState)).toEqual(false);
        expect(selectConfigRetry(testAppState)).toEqual(0);
        expect(selectMaxedRetries(testAppState)).toEqual(false);
        expect(selectConfigData(testAppState)).toEqual({});
        expect(buildConfigSelector('test.path')(testAppState)).toEqual({});
    });

    it('manage message config', () => {
        let testAppState = {...emptyAppState, config: errorConfigState};
        expect(selectConfig(testAppState)).toEqual(errorConfigState);
        expect(selectConfigLoaded(testAppState)).toEqual(false);
        expect(selectConfigRetry(testAppState)).toEqual(6);
        expect(selectMaxedRetries(testAppState)).toEqual(true);
        expect(selectConfigData(testAppState)).toEqual({});
        expect(selectConfigData(testAppState)).toEqual({});
        expect(buildConfigSelector('test.path')(testAppState)).toEqual({});
    });

    it('manage loaded config', () => {
        let testAppState = {...emptyAppState, config: loadedConfigState};
        expect(selectConfig(testAppState)).toEqual(loadedConfigState);
        expect(selectConfigLoaded(testAppState)).toEqual(true);
        expect(selectConfigRetry(testAppState)).toEqual(2);
        expect(selectMaxedRetries(testAppState)).toEqual(false);
        expect(selectConfigData(testAppState)).toEqual({test: {path: {my: {config: 'value'}}}});
        expect(buildConfigSelector('test.path')(testAppState)).toEqual({my: {config: 'value'}});
    });


});
