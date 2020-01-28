/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Action} from '@ngrx/store';
import {Filter} from "@ofModel/feed-filter.model";
import {FilterType} from "@ofServices/filter.service";

export enum FeedActionTypes {
    ApplyFilter = '[Feed] Change filter Status',
    InitFilter = '[Feed] Init filter',
}

export class ApplyFilter implements Action {
    readonly type = FeedActionTypes.ApplyFilter;
    /* istanbul ignore next */
    constructor(public payload:{name: FilterType, active: boolean, status: any}){}
}

export class InitFilters implements Action {
    readonly type = FeedActionTypes.InitFilter;

    /* istanbul ignore next */
    constructor(public payload:{filters: Map<FilterType,Filter>}){}
}

export type FeedActions =
    InitFilters
    | ApplyFilter;
