/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
                loading: false,
                lastCards: action.payload.lightCards
            };
        }

        case LightCardActionTypes.LoadLightCardsFailure: {
            return {
                ...state,
                loading: false,
                error: `error while loading cards: '${action.payload.error}'`,
                lastCards: []
            };
        }

        case LightCardActionTypes.SelectLightCard: {
            return {
                ...state,
                ...action.payload,
                lastCards: []
            }
        }

        case LightCardActionTypes.AddLightCardFailure: {
            return {
                ...state,
                loading: false,
                error: `error while adding a single lightCard: '${action.payload.error}'`,
                lastCards: []
            };
        }
        default: {
            return state;
        }
    }
}