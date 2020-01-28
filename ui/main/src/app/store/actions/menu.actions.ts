
import {Action} from '@ngrx/store';
import {ThirdMenu} from "@ofModel/thirds.model";

export enum MenuActionTypes {
    LoadMenu = '[Menu] Load Menu',
    LoadMenuSuccess = '[Menu] Load Menu Success',
    LoadMenuFailure = '[Menu] Load Menu Fail',
    HandleUnexpectedError = '[Menu] Handle unexpected error',
    SelectMenuLink = '[Menu] Select Menu Link',
    SelectMenuLinkSuccess = '[Menu] Select Menu Link Success',
    SelectMenuLinkFailure = '[Menu] Select Menu Link Failure',
}
// needed by NGRX entities
export class LoadMenu implements Action {
    readonly type = MenuActionTypes.LoadMenu;

    /* istanbul ignore next */
    constructor() {
    }
}
export class LoadMenuFailure implements Action {
    readonly type = MenuActionTypes.LoadMenuFailure;

    /* istanbul ignore next */
    constructor(public payload: { error: Error }) {
    }
}

export class LoadMenuSuccess implements Action {
    readonly type = MenuActionTypes.LoadMenuSuccess;

    /* istanbul ignore next */
    constructor(public payload: { menu: ThirdMenu[] }) {
    }
}

export class HandleUnexpectedError implements Action {
    readonly type = MenuActionTypes.HandleUnexpectedError;

    /* istanbul ignore next */
    constructor(public payload: {error: Error}) {

    }
}

/**
 * Action triggered by navigation to /thirparty/*** (for example by clicking on a third-party menu link)
 * Payload contains route parameters identifying the clicked menu entry (menu id, menu version and menu entry id)
 * Emitted by {CustomRouterEffects} in the following {Observable} @member: navigateToMenuURL
 */
export class SelectMenuLink implements Action {
    readonly type = MenuActionTypes.SelectMenuLink;

    /* istanbul ignore next */
    constructor(public payload: {menu_id: string, menu_version: string, menu_entry_id: string}) {}
}

/**
 * Action triggered if menu link url was correctly computed from the given parameters (menu_id, menu_version and menu_entry_id)
 * Payload contains the computed url
 */
export class SelectMenuLinkSuccess implements Action {
    readonly type = MenuActionTypes.SelectMenuLinkSuccess;

    /* istanbul ignore next */
    constructor(public payload: {iframe_url: string}) {}
}

/**
 * Action triggered if no menu entry was found for the given parameters (menu_id, menu_version and menu_entry_id)
 * Payload contains the error
 */
export class SelectMenuLinkFailure implements Action {
    readonly type = MenuActionTypes.SelectMenuLinkFailure;

    /* istanbul ignore next */
    constructor(public payload: { error: Error }) {
    }
}

export type MenuActions =
    LoadMenu
    | LoadMenuSuccess
    | LoadMenuFailure
    | HandleUnexpectedError
    | SelectMenuLink
    | SelectMenuLinkSuccess
    | SelectMenuLinkFailure;
