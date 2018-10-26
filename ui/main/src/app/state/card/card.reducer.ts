/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {Card} from './card.model';
import {CardActions, CardActionTypes} from './card.actions';

export interface State extends EntityState<Card> {
  selectedCardId: number | string;
  loading: boolean;
  error: string;
}

export const adapter: EntityAdapter<Card> = createEntityAdapter<Card>();

export const initialState: State = adapter.getInitialState(
  {
    selectedCardId: null, loading: false, error: ''
  });

export function reducer(
  state = initialState,
  action: CardActions
): State {
  switch (action.type) {
    case CardActionTypes.AddCard: {
      return adapter.addOne(action.payload.card, state);
    }

    case CardActionTypes.UpsetCard: {
      return adapter.upsertOne(action.payload.card, state);
    }

    case CardActionTypes.AddCards: {
      return adapter.addMany(action.payload.cards, state);
    }

    case CardActionTypes.UpsetCards: {
      return adapter.upsertMany(action.payload.cards, state);
    }

    case CardActionTypes.UpdateCard: {
      return adapter.updateOne(action.payload.card, state);
    }

    case CardActionTypes.UpdateCards: {
      return adapter.updateMany(action.payload.cards, state);
    }

    case CardActionTypes.DeleteCard: {
      return adapter.removeOne(action.payload.id, state);
    }

    case CardActionTypes.DeleteCards: {
      return adapter.removeMany(action.payload.ids, state);
    }

    case CardActionTypes.LoadCards: {
      return {
        ...adapter.removeAll(state),
        loading: true,
        error: ''
      };
    }

    case CardActionTypes.LoadCardsSuccess: {
      return {
        ...adapter.addMany(action.payload.cards, state),
        loading: false
      };
    }

    case CardActionTypes.LoadCardsFail: {
      return {
        ...state,
        loading: false,
        error: 'error while loading cards'
      };
    }

    case CardActionTypes.LoadCard: {
      return {
        ...state,
        loading: true,
        error: ''
      };
    }

    case CardActionTypes.LoadCardSuccess: {
      return {
        ...adapter.addOne(action.payload.card, state),
        loading: false
      };
    }

    case CardActionTypes.LoadCardFail: {
      return {
        ...state,
        loading: false,
        error: 'error while loading a single card'
      };
    }

    case CardActionTypes.AddCardFailure:{
      return{
        ...state,
        loading:false,
        error: 'error while adding a single card'
      }
    }
    case CardActionTypes.ClearCards: {
      return adapter.removeAll(state);
    }

    default: {
      return state;
    }
  }
}



export const getSelectedId = (state: State) => state.selectedCardId;
export const getLoading = (state: State) => state.loading;
export const getError = (state: State) => state.error;
