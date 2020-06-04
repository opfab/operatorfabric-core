

import {Action} from '@ngrx/store';
import {FilterType} from "@ofServices/filter.service";

export enum FeedActionTypes {
    ApplyFilter = '[Feed] Change filter Status',
    ChangeSort = '[Feed] Change sort order'
}

export class ApplyFilter implements Action {
    readonly type = FeedActionTypes.ApplyFilter;
    /* istanbul ignore next */
    constructor(public payload:{name: FilterType, active: boolean, status: any}){}
}

export class ChangeSort implements Action {
    readonly type = FeedActionTypes.ChangeSort;
    /* istanbul ignore next */
    constructor(){}
}

export type FeedActions =
    ApplyFilter
    | ChangeSort;
