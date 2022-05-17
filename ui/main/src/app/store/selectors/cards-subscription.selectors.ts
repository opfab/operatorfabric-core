/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {createSelector} from '@ngrx/store';
import {AppState} from "@ofStore/index";

export const selectCardsSubscriptionState = (state: AppState) => state.cardsSubscription;

export const selectSubscriptionOpen = createSelector(selectCardsSubscriptionState,
    state => state.subscriptionOpen);

export const selectRelodRequested = createSelector(selectCardsSubscriptionState,
    state => state.reloadRequested);