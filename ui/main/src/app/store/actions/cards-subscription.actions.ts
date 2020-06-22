/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Action} from '@ngrx/store';

export enum CardsSubscriptionActionTypes {
    CardSubscriptionOpen = '[Card] Subscription open',
    CardSubscriptionClosed = '[Card] Subscription closed',
}

export class CardSubscriptionOpen implements Action {
    readonly type = CardsSubscriptionActionTypes.CardSubscriptionOpen;
}

export class CardSubscriptionClosed implements Action {
    readonly type = CardsSubscriptionActionTypes.CardSubscriptionClosed;
}


export type CardSubscriptionActions = CardSubscriptionOpen
    | CardSubscriptionClosed;
