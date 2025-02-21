/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {FilteredLightCardsStore} from './lightcards/FilteredLightcardsStore';
import {LightCardsStore} from './lightcards/LightcardsStore';

export class OpfabStore {
    private static lightCardsStore: LightCardsStore = new LightCardsStore();
    private static filteredLightCardsStore: FilteredLightCardsStore = new FilteredLightCardsStore(
        OpfabStore.lightCardsStore
    );

    public static getFilteredLightCardStore() {
        return OpfabStore.filteredLightCardsStore;
    }

    public static getLightCardStore() {
        return OpfabStore.lightCardsStore;
    }

    public static init() {
        OpfabStore.lightCardsStore.initStore();
    }

    public static reset() {
        OpfabStore.lightCardsStore = new LightCardsStore();
        OpfabStore.filteredLightCardsStore = new FilteredLightCardsStore(OpfabStore.lightCardsStore);
        OpfabStore.init();
    }
}
