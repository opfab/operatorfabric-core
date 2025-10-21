/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NavigationService} from '@ofServices/navigation/NavigationService';

declare const opfab: any;

export function initNavigateAPI() {
    opfab.navigate = {
        showCardInFeed: function (cardId: string) {
            NavigationService.navigateToCard(cardId);
        },

        redirectToBusinessMenu: function (menuId: string, urlExtension: string) {
            NavigationService.redirectToBusinessMenu(menuId, urlExtension);
        }
    };

    // prevent unwanted modifications from templates code
    Object.freeze(opfab.navigate);
}
