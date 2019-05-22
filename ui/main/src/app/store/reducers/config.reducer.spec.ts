/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {reducer} from "@ofStore/reducers/config.reducer";
import {configInitialState, ConfigState} from "@ofStates/config.state";
import {getRandomAlphanumericValue} from "@tests/helpers";
import {LoadConfig, LoadConfigFailure, LoadConfigSuccess} from "@ofActions/config.actions";

describe('Config Reducer', () => {
    describe('unknown action', () => {
        it('should return the initial state unchange', () => {
            const unknownAction = {} as any;
            const actualState = reducer(configInitialState, unknownAction);
            expect(actualState).toBe(configInitialState);
        });

        it('should return the previous state on living state', () => {
            const unknowAction = {} as any;
            const previousState: ConfigState = {
                config:{test:'config'},
                loading: false,
                error: getRandomAlphanumericValue(5, 12),
                loaded:false,
                retry:0
            }
            const actualState = reducer(previousState, unknowAction);
            expect(actualState).toBe(previousState);
        });
    });
    describe('Load Config action', () => {
        it('should set state load to true', () => {
            // configInitialState.load is false
            const actualState = reducer(configInitialState,
                new LoadConfig());
            expect(actualState).not.toBe(configInitialState);
            expect(actualState.loading).toEqual(true);
        });
        it('should leave state load to true', () => {
            const previousState: ConfigState = {
                config: null,
                loading: true,
                error: null,
                loaded:false,
                retry:0
            }
            const actualState = reducer(previousState,
                new LoadConfig());
            expect(actualState).not.toBe(previousState);
            expect(actualState).toEqual(previousState);
        });
    });
    describe('LoadConfigFailure', () => {
        it('should set loading to false and message to specific message', () => {
            const actualConfig = {test:'config'};
            const previousState: ConfigState = {
                config: actualConfig,
                loading: true,
                error: null,
                loaded:false,
                retry:0
            };
            const actualState = reducer(previousState,
                new LoadConfigFailure({error: new Error(getRandomAlphanumericValue(5, 12))}));
            expect(actualState).not.toBe(previousState);
            expect(actualState).not.toEqual(previousState);
            expect(actualState.loading).toEqual(false);
            expect(actualState.error).not.toBeNull();
            expect(actualState.loaded).toEqual(false);
            expect(actualState.retry).toEqual(1);

        });
    });
    describe('LoadConfigSuccess', () => {
        it('should set loading to false and selected to corresponding payload', () => {
            const previousConfig = {test:'config'};
            const previousState: ConfigState = {
                config: previousConfig,
                loading: true,
                error: getRandomAlphanumericValue(5, 12),
                loaded:false,
                retry:0
            };

            const actualConfig = {test:'config2'};
            const actualState = reducer(previousState, new LoadConfigSuccess({config: actualConfig}));
            expect(actualState).not.toBe(previousState);
            expect(actualState).not.toEqual(previousState);
            expect(actualState.error).toEqual(previousState.error);
            expect(actualState.loading).toEqual(false);
            expect(actualState.config).toEqual(actualConfig);
            expect(actualState.retry).toEqual(0);
            expect(actualState.loaded).toEqual(true);
        });
    });
});