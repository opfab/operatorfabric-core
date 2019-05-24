/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {reducer} from "@ofStore/reducers/card.reducer";
import {cardInitialState, CardState} from "@ofStates/card.state";
import {getOneRandomCard, getRandomAlphanumericValue} from "@tests/helpers";
import {ClearCard, LoadCard, LoadCardFailure, LoadCardSuccess} from "@ofActions/card.actions";

describe('Card Reducer', () => {
    describe('unknown action', () => {
        it('should return the initial state unchange', () => {
            const unknownAction = {} as any;
            const actualState = reducer(cardInitialState, unknownAction);
            expect(actualState).toBe(cardInitialState);
        });

        it('should return the previous state on living state', () => {
            const unknowAction = {} as any;
            const previousState: CardState = {
                selected: getOneRandomCard(),
                loading: false,
                error: getRandomAlphanumericValue(5, 12)
            }
            const actualState = reducer(previousState, unknowAction);
            expect(actualState).toBe(previousState);
        });
    });
    describe('Load Card action', () => {
        it('should set state load to true', () => {
            // cardInitialState.load is false
            const actualState = reducer(cardInitialState,
                new LoadCard({id: getRandomAlphanumericValue(5, 12)}));
            expect(actualState).not.toBe(cardInitialState);
            expect(actualState.loading).toEqual(true);
        });
        it('should leave state load to true', () => {
            const previousState: CardState = {
                selected: null,
                loading: true,
                error: null
            }
            const actualState = reducer(previousState,
                new LoadCard({id: getRandomAlphanumericValue(5, 12)}));
            expect(actualState).not.toBe(previousState);
            expect(actualState).toEqual(previousState);
        });
    });
    describe('LoadCardFailure', () => {
        it('should set loading to false and message to specific message', () => {
            const actualCard = getOneRandomCard();
            const previousState: CardState = {
                selected: actualCard,
                loading: true,
                error: null
            };
            const actualState = reducer(previousState,
                new LoadCardFailure({error: new Error(getRandomAlphanumericValue(5, 12))}));
            expect(actualState).not.toBe(previousState);
            expect(actualState).not.toEqual(previousState);
            expect(actualState.loading).toEqual(false);
            expect(actualState.error).not.toBeNull();

        });
    });
    describe('LoadCardSuccess', () => {
        it('should set loading to false and selected to corresponding payload', () => {
            const previousCard = getOneRandomCard();
            const previousState: CardState = {
                selected: previousCard,
                loading: true,
                error: getRandomAlphanumericValue(5, 12)
            };

            const actualCard = getOneRandomCard();
            const actualState = reducer(previousState, new LoadCardSuccess({card: actualCard}));
            expect(actualState).not.toBe(previousState);
            expect(actualState).not.toEqual(previousState);
            expect(actualState.error).toEqual(previousState.error);
            expect(actualState.loading).toEqual(false);
            expect(actualState.selected).toEqual(actualCard);
        });
    });

    describe('ClearCard', () => {
        it('should clear state', () => {
            const previousCard = getOneRandomCard();
            const previousState: CardState = {
                selected: previousCard,
                loading: true,
                error: getRandomAlphanumericValue(5, 12)
            };

            const actualState = reducer(previousState, new ClearCard());
            expect(actualState).not.toBe(previousState);
            expect(actualState).not.toEqual(previousState);
            expect(actualState.error).toBeNull();
            expect(actualState.loading).toBeFalsy();
            expect(actualState.selected).toBeNull();
        });
    });
});