
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