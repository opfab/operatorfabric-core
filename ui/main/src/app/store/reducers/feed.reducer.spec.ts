/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {reducer} from './feed.reducer';
import {feedInitialState} from '@ofStates/feed.state';
import {createEntityAdapter} from "@ngrx/entity";
import {LightCard} from "@ofModel/light-card.model";
import {getOneRandomLigthCard, getRandomAlphanumericValue, getSeveralRandomLightCards} from "@tests/helpers";
import {ApplyFilter, InitFilter} from "@ofActions/feed.actions";
import {Filter} from "@ofModel/feed-filter.model";

describe('Feed Reducer', () => {

  const lightCardEntityAdapter = createEntityAdapter<LightCard>();


  describe('unknown action', () => {
    it('should return the initial state on unknown action', () => {
      const action = {} as any;

      const result = reducer(feedInitialState, action);

      expect(result).toBe(feedInitialState);
    });

    it('should return the previous state on unknown state', () => {
      const action = {} as any;

      const previousState = lightCardEntityAdapter.addOne(getOneRandomLigthCard(),feedInitialState);
      const result = reducer(previousState,action);
      expect(result).toBe(previousState);
    });

  });

    describe('init filter action', () => {
        it('should return initial state with an additionnal filter', () => {
            const action = new InitFilter({
                name: 'testFilter',
            filter: new Filter(
                (card,status)=>true,
                false,
                {}
            )});

            expect(feedInitialState.filters.size).toBe(0);
            const result = reducer(feedInitialState, action);

            expect(result.filters.size).toBe(1);
            expect(result.filters.get('testFilter')).toBe(action.payload.filter);
            expect(result.filters.get('testFilter').funktion).toBe(action.payload.filter.funktion);
        });

    });

    describe('apply filter action', () => {
        it('should return initial state if the filter is not in state', () => {
            const action = new ApplyFilter({
                name: 'testFilter',
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
            previousState.filters.set('testFilter', filter);

            const action = new ApplyFilter({
                name: 'testFilter',
                active: true,
                status: {prop: 'value'}
            });

            expect(previousState.filters.size).toBe(1);
            expect(previousState.filters.get('testFilter')).not.toBeNull();
            expect(previousState.filters.get('testFilter').active).toBeFalsy();
            const result = reducer(previousState, action);

            expect(result.filters.size).toBe(1);
            expect(result.filters.get('testFilter')).not.toBeNull();
            expect(result.filters.get('testFilter').active).toBeTruthy();
            expect(result.filters.get('testFilter').status.prop).toBe('value');
        });

    });

});
