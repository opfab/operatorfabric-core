/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {reducer} from './light-card.reducer';
import {CardFeedState, feedInitialState, LightCardAdapter} from '@ofStates/feed.state';
import {createEntityAdapter} from '@ngrx/entity';
import {LightCard} from '@ofModel/light-card.model';
import {
    getOneRandomLightCard,
    getRandomAlphanumericValue,
    getRandomBoolean,
    getSeveralRandomLightCards
} from '@tests/helpers';
import {
    AddLightCardFailure,
    ClearLightCardSelection,
    EmptyLightCards,
    LoadLightCardsFailure,
    LoadLightCardsSuccess
} from '@ofActions/light-card.actions';
import {ApplyFilter, ChangeReadSort, ChangeSort} from '@ofActions/feed.actions';
import {Filter} from '@ofModel/feed-filter.model';
import {FilterType} from '@ofServices/filter.service';

describe('LightCard Reducer', () => {

    const lightCardEntityAdapter = createEntityAdapter<LightCard>();


    describe('unknown action', () => {
        it('should return the initial state on initial state', () => {
            const action = {} as any;

            const result = reducer(feedInitialState, action);

            expect(result).toBe(feedInitialState);
        });

        it('should return the previous state on living state', () => {
            const action = {} as any;

            const previousState = lightCardEntityAdapter.addOne(getOneRandomLightCard(), feedInitialState);
            const result = reducer(previousState, action);
            expect(result).toBe(previousState);
        });

    });

    describe('LoadLightCardsFailure', () => {
        it('should leave state unchanged with an additional message message', () => {


            const severalRandomLightCards = getSeveralRandomLightCards(5);

            const previousState = lightCardEntityAdapter.setAll(severalRandomLightCards, feedInitialState);

            const currentError = new Error(getRandomAlphanumericValue(5, 12));
            const loadLightCardsFailureAction = new LoadLightCardsFailure({error: currentError});

            const actualState = reducer(previousState, loadLightCardsFailureAction);
            expect(actualState).toBeTruthy();
            expect(actualState.loading).toEqual(previousState.loading);
            expect(actualState.entities).toEqual(previousState.entities);
            const actualError = actualState.error;
            expect(actualError).not.toEqual(previousState.error);
            expect(actualError).toEqual(`error while loading cards: '${currentError}'`);

        });
    });
    describe('EmptyLightCards', () => {
        it('should empty entities', () => {
            const severalRandomLightCards = getSeveralRandomLightCards(5);
            const previousState = lightCardEntityAdapter.setAll(severalRandomLightCards, feedInitialState);
            const actualState = reducer(previousState, new EmptyLightCards());
            expect(actualState).toBeTruthy();
            expect(actualState.loading).toEqual(false);
            expect(lightCardEntityAdapter.getSelectors().selectTotal(actualState)).toEqual(0);
            expect(actualState.lastCards).toEqual([]);
        });
    });

    describe('LoadLightCardsSuccess', () => {
        it('should add cards to state', () => {
            const severalRandomLightCards = getSeveralRandomLightCards(5);
            const actualState = reducer(feedInitialState, new LoadLightCardsSuccess({lightCards: severalRandomLightCards}));
            expect(actualState).toBeTruthy();
            expect(actualState.loading).toEqual(false);
            expect(lightCardEntityAdapter.getSelectors().selectAll(actualState).map(c => c.id).sort())
                .toEqual(severalRandomLightCards.map(c => c.id).sort());
            expect(actualState.lastCards.map(c => c.id).sort()).toEqual(severalRandomLightCards.map(c => c.id).sort());
        });
    });

    describe('AddLightCardFailure', () => {
        it('should leave state unchanged with an additional message message', () => {
            const severalRandomLightCards = getSeveralRandomLightCards(5);
            const previousState = lightCardEntityAdapter.setAll(severalRandomLightCards, feedInitialState);

            const currentError = new Error(getRandomAlphanumericValue(5, 12));
            const addLightCardFailureAction = new AddLightCardFailure({error: currentError});

            const actualState = reducer(previousState, addLightCardFailureAction);

            expect(actualState).toBeTruthy();
            expect(actualState.loading).toEqual(previousState.loading);
            expect(actualState.entities).toEqual(previousState.entities);
            const actualError = actualState.error;
            expect(actualError).not.toEqual(previousState.error);
            expect(actualError).toEqual(`error while adding a single lightCard: '${currentError}'`);

        });
    });


    describe('apply filter action', () => {
        it('should return state with filter updated', () => {
            const filter = new Filter(
                (card, status) => true,
                false,
                {});
            const previousState = {...feedInitialState, filters: new Map()};
            previousState.filters.set(FilterType.TEST_FILTER, filter);

            const action = new ApplyFilter({
                name: FilterType.TEST_FILTER,
                active: true,
                status: {prop: 'value'}
            });

            expect(previousState.filters.size).toBe(1);
            expect(previousState.filters.get(FilterType.TEST_FILTER)).not.toBeNull();
            expect(previousState.filters.get(FilterType.TEST_FILTER).active).toBeFalsy();
            const result = reducer(previousState, action);

            expect(result.filters.size).toBe(1);
            expect(result.filters.get(FilterType.TEST_FILTER)).not.toBeNull();
            expect(result.filters.get(FilterType.TEST_FILTER).active).toBeTruthy();
            expect(result.filters.get(FilterType.TEST_FILTER).status.prop).toBe('value');
        });

    });

    describe('ClearLightCardSelection', () => {

        it('should clear the selected card', () => {
            const action = new ClearLightCardSelection();
            const previousState: CardFeedState = LightCardAdapter.getInitialState(
                {
                    selectedCardId: getRandomAlphanumericValue(5, 10),
                    lastCards: [],
                    loading: false,
                    error: '',
                    filters: new Map(),
                    sortBySeverity: false,
                    sortByRead: false
                });

            const expectedState: CardFeedState = LightCardAdapter.getInitialState(
                {
                    selectedCardId: null,
                    lastCards: [],
                    loading: false,
                    error: '',
                    filters: new Map(),
                    sortBySeverity: false,
                    sortByRead: false
                });

            const result = reducer(previousState, action);

            expect(result).toEqual(expectedState);

        });

    });

    describe('ChangeSort', () => {

        it('should toggle the sortBySeverity property', () => {
            const action = new ChangeSort();
            const initialSort = getRandomBoolean();
            const initialSelectedCardId = getRandomAlphanumericValue(5, 10);
            const previousState: CardFeedState = LightCardAdapter.getInitialState(
                {
                    selectedCardId: initialSelectedCardId,
                    lastCards: [],
                    loading: false,
                    error: '',
                    filters: new Map(),
                    sortBySeverity: initialSort,
                    sortByRead: false
                });

            const expectedState: CardFeedState = LightCardAdapter.getInitialState(
                {
                    selectedCardId: initialSelectedCardId,
                    lastCards: [],
                    loading: false,
                    error: '',
                    filters: new Map(),
                    sortBySeverity: !initialSort,
                    sortByRead: false
                });

            const result = reducer(previousState, action);

            expect(result).toEqual(expectedState);

        });

    });

    describe('ChangeReadSort', () => {

        it('should toggle the sortByRead property', () => {
            const action = new ChangeReadSort();
            const initialSort = getRandomBoolean();
            const initialSelectedCardId = getRandomAlphanumericValue(5, 10);
            const previousState: CardFeedState = LightCardAdapter.getInitialState(
                {
                    selectedCardId: initialSelectedCardId,
                    lastCards: [],
                    loading: false,
                    error: '',
                    filters: new Map(),
                    sortBySeverity: false,
                    sortByRead: initialSort
                });

            const expectedState: CardFeedState = LightCardAdapter.getInitialState(
                {
                    selectedCardId: initialSelectedCardId,
                    lastCards: [],
                    loading: false,
                    error: '',
                    filters: new Map(),
                    sortBySeverity: false,
                    sortByRead: !initialSort
                });

            const result = reducer(previousState, action);

            expect(result).toEqual(expectedState);

        });

    });
});
