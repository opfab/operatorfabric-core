/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Action} from '@ngrx/store';
import {FilterType} from '@ofServices/filter.service';
import {Filter, FilterStatus} from '@ofModel/feed-filter.model';


export enum FeedActionTypes {
    ApplyFilter = '[Feed] Change filter Status',
    ChangeSort = '[Feed] Change sort order',
    ResetFilter = '[Feed] Reset filter Status',
    ResetFilterForMonitoring = '[Feed] Reset filter Status for monitoring screen',
    ApplySeveralFilters = '[Feed] Change several filters Status at Once',
    ChangeReadSort = "[Feed] Sort by read"
}

export class ApplyFilter implements Action {
    readonly type = FeedActionTypes.ApplyFilter;

    /* istanbul ignore next */
    constructor(public payload: { name: FilterType, active: boolean, status: any }) {
    }
}

export class ChangeSort implements Action {
    readonly type = FeedActionTypes.ChangeSort;

    /* istanbul ignore next */
    constructor() {
    }
}

export class ChangeReadSort implements Action {
    readonly type = FeedActionTypes.ChangeReadSort;

    constructor() {
    }
}

export class ResetFilter implements  Action {
    readonly type  = FeedActionTypes.ResetFilter;
}

export class ResetFilterForMonitoring implements  Action {
    readonly type  = FeedActionTypes.ResetFilterForMonitoring;
}

export class ApplySeveralFilters implements Action {
    readonly type = FeedActionTypes.ApplySeveralFilters;

    constructor(public payload: {filterStatuses: Map<FilterType, Filter>}) {
    }
}
export type FeedActions =
    ApplyFilter
    | ChangeSort
    | ChangeReadSort
    | ResetFilter
    | ResetFilterForMonitoring
    | ApplySeveralFilters;
