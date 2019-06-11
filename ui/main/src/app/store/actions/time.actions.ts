import {Action} from "@ngrx/store";
import {TimeReference} from "@ofModel/time.model";
import {Message} from "@ofModel/message.model";
import * as moment from "moment-timezone";

export enum TimeActionTypes{
    Tick='[Time] tick',
    UpdateTimeReference='[Time] try to upadate the time reference',
    FailToUpdateTimeReference='[Time] fail to update the time reference'
}

/**
 * Heart beat of the application change current date
 */
export class Tick implements  Action{
    readonly type=TimeActionTypes.Tick;
    constructor(public payload:{currentTime:moment.Moment}){}
}

/**
 * Action dispatch to update the current virtual time of the application
 */

export class UpdateTimeReference implements Action{
    readonly type=TimeActionTypes.UpdateTimeReference;
    constructor(public payload:{timeReference:TimeReference}){};
}


/**
 * Notify thate something went wrong while changing the virtual time.
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
