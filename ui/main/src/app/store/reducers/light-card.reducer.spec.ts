/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {reducer} from './light-card.reducer';
import {feedInitialState} from '@ofStates/feed.state';
import {createEntityAdapter} from "@ngrx/entity";
import {LightCard} from "@ofModel/light-card.model";
import {getOneRandomLigthCard, getRandomAlphanumericValue, getSeveralRandomLightCards} from "@tests/helpers";
import {AddLightCardFailure, LoadLightCardsFailure} from "@ofActions/light-card.actions";
import {ApplyFilter, InitFilters} from "@ofActions/feed.actions";
import {Filter} from "@ofModel/feed-filter.model";
import {FilterType} from "@ofServices/filter.service";

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

      const previousState = lightCardEntityAdapter.addOne(getOneRandomLigthCard(),feedInitialState);
      const result = reducer(previousState,action);
      expect(result).toBe(previousState);
    });

  });

  describe('LoadLightCardsFailure', () => {
    it('should leave state unchanged with an additional message message', () =>{


      const severalRandomLightCards = getSeveralRandomLightCards(5);

      const previousState = lightCardEntityAdapter.addAll(severalRandomLightCards,feedInitialState);

      const currentError = new Error(getRandomAlphanumericValue(5,12));
      const loadLightCardsFailureAction = new LoadLightCardsFailure({error: currentError});

      const actualState = reducer(previousState,loadLightCardsFailureAction);
      expect(actualState).toBeTruthy();
      expect(actualState.loading).toEqual(previousState.loading);
      expect(actualState.entities).toEqual(previousState.entities);
      const actualError = actualState.error;
      expect(actualError).not.toEqual(previousState.error);
      expect(actualError).toEqual(`error while loading cards: '${currentError}'`)

    });
  });

  describe('AddLightCardFailure', () => {
    it('should leave state unchanged with an additional message message', () => {
      const severalRandomLightCards = getSeveralRandomLightCards(5);
      const previousState = lightCardEntityAdapter.addAll(severalRandomLightCards,feedInitialState);

      const currentError = new Error(getRandomAlphanumericValue(5,12));
      const addLightCardFailureAction= new AddLightCardFailure({error:currentError});

      const actualState = reducer(previousState, addLightCardFailureAction);

      expect(actualState).toBeTruthy();
      expect(actualState.loading).toEqual(previousState.loading);
      expect(actualState.entities).toEqual(previousState.entities);
      const actualError = actualState.error;
      expect(actualError).not.toEqual(previousState.error);
      expect(actualError).toEqual(`error while adding a single lightCard: '${currentError}'`)

    });
  });

    describe('init filter action', () => {
        it('should return initial state with an additionnal filter', () => {
            const filters = new Map();
            const testFilter = new Filter(
                (card,status)=>true,
                false,
                {}
            );
            filters.set(FilterType.TEST_FILTER,testFilter);

            expect(feedInitialState.filters.size).toBe(0);
            const result = reducer(feedInitialState, new InitFilters({filters:filters}));

            expect(result.filters.size).toBe(1);
            expect(result.filters.get(FilterType.TEST_FILTER)).toBe(testFilter);
            expect(result.filters.get(FilterType.TEST_FILTER).funktion).toBe(testFilter.funktion);
        });

    });

    describe('apply filter action', () => {
        it('should return initial state if the filter is not in state', () => {
            const action = new ApplyFilter({
                name: FilterType.TEST_FILTER,
                active: true,
                status: {}
            });

            expect(feedInitialState.filters.size).toBe(0);
            const result = reducer(feedInitialState, action);
            expect(feedInitialState.filters.size).toBe(0);

            expect(result).toEqual(feedInitialState);
        });
        it('should return state with filter updated', () => {
            const filter = new Filter(
                (card,status)=>true,
                false,
                {})
            const previousState = {...feedInitialState, filters: new Map()}
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
});
