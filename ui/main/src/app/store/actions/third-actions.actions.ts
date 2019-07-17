import {Action} from "@ngrx/store";
import {LightCard} from "@ofModel/light-card.model";
import {Action as ThirdAction} from "@ofModel/thirds.model";

export enum ThirdActionTypes {
    LoadThirdAction = '[ACtion] Load Action for the given state of a given Process',
    LoadThirdActionSuccess = '[Action] Actions successfully loaded',
    LoadThirdActionFailure = '[Action] Failed load of Actions'

}

export class LoadThirdAction implements Action {
    readonly type = ThirdActionTypes.LoadThirdAction;

    constructor(public payload: { card: LightCard }) {
    }

}

export class LoadThirdActionSuccess implements Action {
    readonly type = ThirdActionTypes.LoadThirdActionSuccess;

    constructor(public payload: { actions: Map<string, ThirdAction> }) {
    }
}

export class LoadThirdActionFailure implements Action {
    readonly type = ThirdActionTypes.LoadThirdActionFailure;

    constructor(public payload: { error: Error }) {

    }
}

export type ThirdActionsActions =
    LoadThirdAction
    | LoadThirdActionSuccess
    | LoadThirdActionFailure;
