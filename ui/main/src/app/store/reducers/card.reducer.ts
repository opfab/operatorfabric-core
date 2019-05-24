/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {CardFeedState} from '@ofStates/feed.state';
import {cardInitialState, CardState} from "@ofStates/card.state";
import {CardActions, CardActionTypes} from "@ofActions/card.actions";

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
                loading: false
            };
        }

        case CardActionTypes.LoadCardFailure: {
            return {
                ...state,
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
