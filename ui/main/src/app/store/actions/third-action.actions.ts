import {Action} from "@ngrx/store";
import {LightCard} from "@ofModel/light-card.model";
import {Action as ThirdAction, ThirdActionHolder} from "@ofModel/thirds.model";

export enum ThirdActionTypes {
    LoadThirdActions = '[Action] Load Third Actions for the given state of a given Process',
    LoadThirdActionSuccess = '[Action] Third Actions successfully loaded',
    LoadThirdActionFailure = '[Action] Failed to load Third Actions',
    FetchOneThirdAction = '[Action] Fetch One Third Action',
    FetchOneThirdActionSuccess = '[Action] Fetch successfylly one Third Action',
    FetchOneThirdActionFailure = '[Action] Failed to fetch one Third Action'
}

export class LoadThirdActions implements Action {
    readonly type = ThirdActionTypes.LoadThirdActions;

    constructor(public payload: { card: LightCard }) {
    }

}

export class LoadThirdActionSuccess implements Action {
    readonly type = ThirdActionTypes.LoadThirdActionSuccess;

    constructor(public payload: { actions: ThirdActionHolder }) {
    }

}

export class LoadThirdActionFailure implements Action {
    readonly type = ThirdActionTypes.LoadThirdActionFailure;

    constructor(public payload: { error: Error }) {
    }

}

export class FetchOneThirdAction implements Action {
    readonly type = ThirdActionTypes.FetchOneThirdAction;

    constructor(public payload: { publisher: string, process: string, state: string, actionKey: string }) {
    }
}

export class FetchOneThirdActionSuccess implements Action {
    readonly type = ThirdActionTypes.FetchOneThirdActionSuccess;

    constructor(public payload: { thirdActionHolder: ThirdActionHolder, key:string }) {
    }
}

export class FetchOneThirdActionFailure implements Action {
    readonly type = ThirdActionTypes.FetchOneThirdActionFailure;

    constructor(public payload: { error: Error }) {
    }
}

export type ThirdActionActions =
    LoadThirdActions
    | LoadThirdActionSuccess
    | LoadThirdActionFailure
    | FetchOneThirdAction
    | FetchOneThirdActionSuccess
    | FetchOneThirdActionFailure;
