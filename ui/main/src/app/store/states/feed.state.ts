/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Filter} from '@ofModel/feed-filter.model';
import {FilterService, FilterType} from '@ofServices/filter.service';


export interface CardFeedState {
    selectedCardId: string;
    filters: Map<FilterType, Filter>;
    sortBySeverity: boolean;
    sortByRead: boolean;
    domainId: string,
    domainStartDate: number;
    domainEndDate: number;
}


/**
 * Hack to solve OC-604
 * Init is done using a service , to be refactor
 */
function getDefaultFilter() {
    const filterService = new FilterService();
    return filterService.defaultFilters();
}

export const feedInitialState: CardFeedState = 
    {
        selectedCardId: null,
        filters: getDefaultFilter(),
        sortBySeverity: false,
        sortByRead: true,
        domainId: null,
        domainStartDate: null,
        domainEndDate: null
    };
