/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {CardFeedState} from '@ofStates/feed.state';
import {cardInitialState, CardState} from '@ofStates/card.state';
import {CardActions, CardActionTypes} from '@ofActions/card.actions';

export function reducer(
    state = cardInitialState,
    action: CardActions
): CardState {
    switch (action.type) {
        case CardActionTypes.ClearCard: {
            return cardInitialState;
        }
        case CardActionTypes.LoadCard: {
            return {
                ...state,
                loading: true
            };
        }
        case CardActionTypes.LoadCardSuccess: {
            return {
                ...state,
                selected: action.payload.card,
                selectedChildCards: action.payload.childCards,
                loading: false
            };
        }
        case CardActionTypes.LoadCardFailure: {
            return {
                ...state,
                selected: null,
                loading: false,
                error: `error while loading a Card: '${action.payload.error}'`
            };
        }
        case CardActionTypes.LoadArchivedCard: {
            return {
                ...state,
                loading: true
            };
        }
        case CardActionTypes.LoadArchivedCardSuccess: {
            return {
                ...state,
                selected: action.payload.card,
                loading: false
            };
        }
        case CardActionTypes.LoadArchivedCardFailure: {
            return {
                ...state,
                selected: null,
                loading: false,
                error: `error while loading a Card: '${action.payload.error}'`
            };
        }

        default: {
            return state;
        }
    }
}


export const getSelectedId = (state: CardFeedState) => state.selectedCardId;
