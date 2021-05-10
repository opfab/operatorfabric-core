/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
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
    ClearLightCardSelection,
    EmptyLightCards,
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

    describe('EmptyLightCards', () => {
        it('should empty entities', () => {
            const severalRandomLightCards = getSeveralRandomLightCards(5);
            const previousState = lightCardEntityAdapter.setAll(severalRandomLightCards, feedInitialState);
            const actualState = reducer(previousState, new EmptyLightCards());
            expect(actualState).toBeTruthy();
            expect(lightCardEntityAdapter.getSelectors().selectTotal(actualState)).toEqual(0);
            expect(actualState.lastCardLoaded).toEqual(null);
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
                    lastCardLoaded: null,
                    error: '',
                    filters: new Map(),
                    sortBySeverity: false,
                    sortByRead: false
                });

            const expectedState: CardFeedState = LightCardAdapter.getInitialState(
                {
                    selectedCardId: null,
                    lastCardLoaded: null,
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
                    lastCardLoaded: null,
                    error: '',
                    filters: new Map(),
                    sortBySeverity: initialSort,
                    sortByRead: false
                });

            const expectedState: CardFeedState = LightCardAdapter.getInitialState(
                {
                    selectedCardId: initialSelectedCardId,
                    lastCardLoaded: null,
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
                    lastCardLoaded: null,
                    error: '',
                    filters: new Map(),
                    sortBySeverity: false,
                    sortByRead: initialSort
                });

            const expectedState: CardFeedState = LightCardAdapter.getInitialState(
                {
                    selectedCardId: initialSelectedCardId,
                    lastCardLoaded: null,
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
