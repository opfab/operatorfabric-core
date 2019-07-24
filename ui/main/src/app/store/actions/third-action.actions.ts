import {Action} from "@ngrx/store";
import {LightCard} from "@ofModel/light-card.model";
import {ActionStatus, ThirdActionHolder, Action as ThirdAction} from "@ofModel/thirds.model";

export enum ThirdActionTypes {
    LoadThirdActions = '[Action] Load Third Actions for the given state of a given Process',
    LoadThirdActionSuccess = '[Action] Third Actions successfully loaded',
    LoadThirdActionFailure = '[Action] Failed to load Third Actions',
    UpdateOneThirdAction = '[Action] Fetch One Third Action',
    UpdateOneThirdActionSuccess = '[Action] Fetch successfully one Third Action',
    UpdateOneThirdActionFailure = '[Action] Failed to fetch one Third Action'
}

export class LoadThirdActions implements Action {
    readonly type = ThirdActionTypes.LoadThirdActions;

    constructor(public payload: { card: LightCard }) {
    }

}

export class LoadThirdActionSuccess implements Action {
    readonly type = ThirdActionTypes.LoadThirdActionSuccess;

    constructor(public payload: { actions: Array<ThirdAction> }) {
    }

}

export class LoadThirdActionFailure implements Action {
    readonly type = ThirdActionTypes.LoadThirdActionFailure;

    constructor(public payload: { error: Error }) {
    }

}

export class UpdateOneThirdAction implements Action {
    readonly type = ThirdActionTypes.UpdateOneThirdAction;

    constructor(public payload: { thirdActionHolder: ThirdActionHolder, actionKey: string }) {
    }
}

export class UpdateOneThirdActionSuccess implements Action {
    readonly type = ThirdActionTypes.UpdateOneThirdActionSuccess;

    constructor(public payload: { thirdActionHolder: ThirdActionHolder, key:string,status:ActionStatus}) {
    }
}

export class UpdateOneThirdActionFailure implements Action {
    readonly type = ThirdActionTypes.UpdateOneThirdActionFailure;

    constructor(public payload: { error: Error }) {
    }
}

export type ThirdActionActions =
    LoadThirdActions
    | LoadThirdActionSuccess
    | LoadThirdActionFailure
    | UpdateOneThirdAction
    | UpdateOneThirdActionSuccess
    | UpdateOneThirdActionFailure;
