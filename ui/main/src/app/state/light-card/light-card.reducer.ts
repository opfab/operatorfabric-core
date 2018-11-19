/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
        case LightCardActionTypes.LoadLightCardsSuccess: {
            return {
                ...adapter.upsertMany(action.payload.lightCards, state),
                loading: false
            };
        }

        case LightCardActionTypes.LoadLightCardsFailure: {
            return {
                ...state,
                loading: false,
                error: `error while loading cards: '${action.payload.error}'`
            };
        }

        case LightCardActionTypes.LoadLightCardSuccess: {
            return {
                ...adapter.addOne(action.payload.lightCard, state),
                loading: false
            };
        }

        case LightCardActionTypes.LoadLightCardFailure: {
            return {
                ...state,
                loading: false,
                error: `error while loading a single lightCard: '${action.payload.error}'`
            };
        }

        case LightCardActionTypes.AddLightCardFailure: {
            return {
                ...state,
                loading: false,
                error: `error while adding a single lightCard: '${action.payload.error}'`
            };
        }
        default: {
            return state;
        }
    }
}


export const getSelectedId = (state: State) => state.selectedCardId;
