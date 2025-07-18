/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabStore} from '@ofStore/OpfabStore';
import {Card} from 'app/model/Card';

declare const opfab: any;

export function initLightCardsAPI() {
    opfab.lightCards = {
        getCurrentUserChildCardsForParentCard: function (parentCardId: string): Card[] {
            // Ensure we return a deep copy of the cards to avoid storage mutation from outside
            return structuredClone(OpfabStore.getLightCardStore().getCurrentUserChildCardsForParentCard(parentCardId));
        }
    };
}
