/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {reducer} from './light-card.reducer';
import {lightCardInitialState} from '@ofStates/feed.state';
import {createEntityAdapter} from "@ngrx/entity";
import {LightCard} from "@ofModel/light-card.model";
import {getOneRandomLigthCard, getRandomAlphanumericValue, getSeveralRandomLightCards} from "@tests/helpers";
import {AddLightCardFailure, LoadLightCardsFailure} from "@ofActions/light-card.actions";

describe('LightCard Reducer', () => {

  const lightCardEntityAdapter = createEntityAdapter<LightCard>();


  describe('unknown action', () => {
    it('should return the initial state on initial state', () => {
      const action = {} as any;

      const result = reducer(lightCardInitialState, action);

      expect(result).toBe(lightCardInitialState);
    });

    it('should return the previous state on living state', () => {
      const action = {} as any;

      const previousState = lightCardEntityAdapter.addOne(getOneRandomLigthCard(),lightCardInitialState);
      const result = reducer(previousState,action);
      expect(result).toBe(previousState);
    });

  });

  describe('LoadLightCardsFailure', () => {
    it('should leave state unchanged with an additional error message', () =>{


      const severalRandomLightCards = getSeveralRandomLightCards(5);

      const previousState = lightCardEntityAdapter.addAll(severalRandomLightCards,lightCardInitialState);

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
    it('should leave state unchanged with an additional error message', () => {
      const severalRandomLightCards = getSeveralRandomLightCards(5);
      const previousState = lightCardEntityAdapter.addAll(severalRandomLightCards,lightCardInitialState);

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


});
