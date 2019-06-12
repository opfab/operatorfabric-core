/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Action} from '@ngrx/store';

export enum TimelineActionTypes {
    InitTimeline = '[timeline] Init timeline',
    AddCardDataTimeline = '[timeline] Add Card to data'
}

export class InitTimeline implements Action {
    readonly type = TimelineActionTypes.InitTimeline
    constructor(public payload:{data: any[]}){}
}

export class AddCardDataTimeline implements Action {
    readonly type = TimelineActionTypes.AddCardDataTimeline
    constructor(public payload:{cardTimeline: any}){}
}

export type TimelineActions =
    InitTimeline
    | AddCardDataTimeline;
