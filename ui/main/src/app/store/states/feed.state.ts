/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {LightCard} from '@ofModel/light-card.model';
import {Filter} from '@ofModel/feed-filter.model';
import {FilterService, FilterType} from '@ofServices/filter.service';


export interface CardFeedState extends EntityState<LightCard> {
    selectedCardId: string;
    lastCardLoaded: LightCard;
    filters: Map<FilterType, Filter>;
    sortBySeverity: boolean;
    sortByRead: boolean;
}


export const LightCardAdapter: EntityAdapter<LightCard> = createEntityAdapter<LightCard>({
    /* The sortComparer property can only be defined statically for performance optimization reasons.
    * See https://github.com/ngrx/platform/issues/898
    * So to implement a sort criteria chosen by the user, I switched to an unsorted EntityAdapter and did the sorting
    * outside (see lightcards.service.ts) */
});

/**
 * Hack to solve OC-604
 * Init is done using a service , to be refactor
 */
function getDefaultFilter() {
    const filterService = new FilterService();
    return filterService.defaultFilters();
}

export const feedInitialState: CardFeedState = LightCardAdapter.getInitialState(
    {
        selectedCardId: null,
        lastCardLoaded: null,
        filters: getDefaultFilter(),
        sortBySeverity: false,
        sortByRead: true
    });
