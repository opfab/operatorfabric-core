/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {LightCard} from './light-card.model';
import {LightCardActions, LightCardActionTypes} from './light-card.actions';

export interface State extends EntityState<LightCard> {
    selectedCardId: number | string;
    loading: boolean;
    error: string;
}

export const adapter: EntityAdapter<LightCard> = createEntityAdapter<LightCard>();

export const initialState: State = adapter.getInitialState(
    {
        selectedCardId: null, loading: false, error: ''
    });

export function reducer(
    state = initialState,
    action: LightCardActions
): State {
    switch (action.type) {
        case LightCardActionTypes.AddLightCard: {
            return adapter.addOne(action.payload.lightCard, state);
        }

        case LightCardActionTypes.UpsertLightCard: {
            return adapter.upsertOne(action.payload.lightCard, state);
        }

        case LightCardActionTypes.AddLightCards: {
            return adapter.addMany(action.payload.lightCards, state);
        }

        case LightCardActionTypes.UpsertLightCards: {
            return adapter.upsertMany(action.payload.lightCards, state);
        }

        case LightCardActionTypes.UpdateLightCard: {
            return adapter.updateOne(action.payload.lightCard, state);
        }

        case LightCardActionTypes.UpdateLightCards: {
            return adapter.updateMany(action.payload.lightCards, state);
        }

        case LightCardActionTypes.DeleteLightCard: {
            return adapter.removeOne(action.payload.id, state);
        }

        case LightCardActionTypes.DeleteLightCards: {
            return adapter.removeMany(action.payload.ids, state);
        }

        case LightCardActionTypes.LoadLightCards: {
            return {
                ...adapter.removeAll(state),
                loading: true,
                error: ''
            };
        }

        case LightCardActionTypes.LoadLightCardsSuccess: {
            return {
                ...adapter.upsertMany(action.payload.lightCards, state),
                loading: false
            };
        }

        case LightCardActionTypes.LoadLightCardsFail: {
            return {
                ...state,
                loading: false,
                error: 'error while loading cards'
            };
        }

        case LightCardActionTypes.LoadLightCard: {
            return {
                ...state,
                loading: true,
                error: ''
            };
        }

        case LightCardActionTypes.LoadLightCardSuccess: {
            return {
                ...adapter.addOne(action.payload.lightCard, state),
                loading: false
            };
        }

        case LightCardActionTypes.LoadLightCardFail: {
            return {
                ...state,
                loading: false,
                error: 'error while loading a single lightCard'
            };
        }

        case LightCardActionTypes.AddLightCardFailure: {
            return {
                ...state,
                loading: false,
                error: 'error while adding a single lightCard'
            };
        }
        case LightCardActionTypes.ClearLightCards: {
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
