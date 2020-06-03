

import {Action} from '@ngrx/store';

export enum TimelineActionTypes {
    SetCardDataTimeline = '[timeline] Set Card Data'
}

export class SetCardDataTimeline implements Action {
    readonly type = TimelineActionTypes.SetCardDataTimeline
    constructor(public payload:{cardsTimeline: any}){}
}

export type TimelineActions = SetCardDataTimeline;
