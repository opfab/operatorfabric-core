/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Action} from '@ngrx/store';

export enum CardsSubscriptionActionTypes {
    CardSubscriptionOpen = '[Card] Subscription open',
    CardSubscriptionClosed = '[Card] Subscription closed',
    UIReloadRequested = '[UI] Reload requested'
}

export class CardSubscriptionOpenAction implements Action {
    readonly type = CardsSubscriptionActionTypes.CardSubscriptionOpen;
}

export class CardSubscriptionClosedAction implements Action {
    readonly type = CardsSubscriptionActionTypes.CardSubscriptionClosed;
}

export class UIReloadRequestedAction implements Action {
    readonly type = CardsSubscriptionActionTypes.UIReloadRequested;
}

export type CardSubscriptionActions =
    | CardSubscriptionOpenAction
    | CardSubscriptionClosedAction
    | UIReloadRequestedAction;
