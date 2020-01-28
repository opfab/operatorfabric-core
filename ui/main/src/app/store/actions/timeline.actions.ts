/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Action} from '@ngrx/store';

export enum TimelineActionTypes {
    InitTimeline = '[timeline] Init timeline',
    SetCardDataTimeline = '[timeline] Set Card Data'
}

export class InitTimeline implements Action {
    readonly type = TimelineActionTypes.InitTimeline
    constructor(public payload:{data: any[]}){}
}

export class SetCardDataTimeline implements Action {
    readonly type = TimelineActionTypes.SetCardDataTimeline
    constructor(public payload:{cardsTimeline: any}){}
}

export type TimelineActions =
    InitTimeline
    | SetCardDataTimeline;