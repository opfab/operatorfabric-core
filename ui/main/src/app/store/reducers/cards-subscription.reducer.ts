/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {cardsSubscriptionInitialState, CardsSubscriptionState} from '@ofStates/cards-subscription.state';
import {CardSubscriptionActions, CardsSubscriptionActionTypes} from '@ofActions/cards-subscription.actions';

export function cardsSubscriptionReducer(
    state = cardsSubscriptionInitialState,
    action: CardSubscriptionActions
): CardsSubscriptionState {
    switch (action.type) {

        case CardsSubscriptionActionTypes.CardSubscriptionOpen: {
            return {
                ...state,
                subscriptionOpen: true
            };

        }
        case CardsSubscriptionActionTypes.CardSubscriptionClosed: {
            return {
                ...state,
                subscriptionOpen: false
            };

        }
        case CardsSubscriptionActionTypes.UIReloadRequested: {
            return {
                ...state,
                reloadRequested: true
            };

        }
    
        default: {
            return state;
        }
    }
}
