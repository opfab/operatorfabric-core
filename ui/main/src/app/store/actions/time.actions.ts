/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Action} from "@ngrx/store";
import {TimeReference} from "@ofModel/time.model";
import {Message} from "@ofModel/message.model";
import * as moment from "moment-timezone";

export enum TimeActionTypes{
    Tick='[Time] tick',
    UpdateTimeReference='[Time] try to update the time reference',
    FailToUpdateTimeReference='[Time] fail to update the time reference'
}

/**
 * Heart beat of the application change current date
 * Contains the elapsed virtual time since the previous heart beat so any components following the clock
 * can shift their timespan accordingly
 */
export class Tick implements  Action{
    readonly type=TimeActionTypes.Tick;
    constructor(public payload:TickPayload){}
}

/**
 * Clock tick (heart beat) payload
 */
export class TickPayload {
    constructor(public currentTime: moment.Moment,
                public elapsedSinceLast: number) {
    }
}

/**
 * Action dispatch to update the current virtual time of the application
 */

export class UpdateTimeReference implements Action{
    readonly type=TimeActionTypes.UpdateTimeReference;
    constructor(public payload:{timeReference:TimeReference}){};
}


/**
 * Notify that something went wrong while changing the virtual time.
 * Nothing has been done and an error is reported
 */
export class FailToUpdateTimeReference implements Action{
    readonly type = TimeActionTypes.FailToUpdateTimeReference;
    constructor(public payload:{ error: Message;}){}
}


export type TimeActions =
      Tick
    | UpdateTimeReference
    | FailToUpdateTimeReference;
