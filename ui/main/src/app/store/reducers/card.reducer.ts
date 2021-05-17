/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


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
        case CardActionTypes.LoadCardSuccess: {
            return {
                ...state,
                selected: action.payload.card,
                selectedChildCards: action.payload.childCards
            };
        }
        case CardActionTypes.LoadCardFailure: {
            return {
                ...state,
                selected: null
            };
        }
        default: {
            return state;
        }
    }
}

