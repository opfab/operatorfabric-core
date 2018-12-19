/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {LightCard} from '@ofModel/light-card.model';
import {LightCardActions, LightCardActionTypes} from '@ofActions/light-card.actions';
import {LightCardAdapter, lightCardInitialState, LightCardStateEntity} from '@ofStates/light-card.state';

export function reducer(
    state = lightCardInitialState,
    action: LightCardActions
): LightCardStateEntity {
    switch (action.type) {
        case LightCardActionTypes.LoadLightCardsSuccess: {
            return {
                ...LightCardAdapter.upsertMany(action.payload.lightCards, state),
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
                ...LightCardAdapter.addOne(action.payload.lightCard, state),
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


export const getSelectedId = (state: LightCardStateEntity) => state.selectedCardId;
