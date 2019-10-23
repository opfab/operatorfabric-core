/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Action} from '@ngrx/store';
import {Card} from '@ofModel/card.model';

export enum CardActionTypes {
    ClearCard = '[Card] Clear',
    LoadCard = '[Card] Load Card',
    LoadCardSuccess = '[Card] Load Card Success',
    LoadCardFailure = '[Card] Load Card Fail',
    LoadArchivedCard = '[Card] Load Archived Card',
    LoadArchivedCardSuccess = '[Card] Load Archived Card Success',
    LoadArchivedCardFailure = '[Card] Load Archived Card Fail',
    HandleUnexpectedError = '[Card] Handle unexpected error related to card issue',
    AddActionsAppear = '[Card] Add Actions Appear'
}
// needed by NGRX entities
export class ClearCard implements Action {
    readonly type = CardActionTypes.ClearCard;
}
export class LoadCard implements Action {
    readonly type = CardActionTypes.LoadCard;

    /* istanbul ignore next */
    constructor(public payload: { id: string }) {}
}
export class LoadCardFailure implements Action {
    readonly type = CardActionTypes.LoadCardFailure;

    /* istanbul ignore next */
    constructor(public payload: { error: Error }) {}
}

export class LoadCardSuccess implements Action {
    readonly type = CardActionTypes.LoadCardSuccess;

    /* istanbul ignore next */
    constructor(public payload: { card: Card }) {}
}

export class LoadArchivedCard implements Action {
    readonly type = CardActionTypes.LoadArchivedCard;

    /* istanbul ignore next */
    constructor(public payload: { id: string }) {}
}
export class LoadArchivedCardFailure implements Action {
    readonly type = CardActionTypes.LoadArchivedCardFailure;

    /* istanbul ignore next */
    constructor(public payload: { error: Error }) {}
}

export class LoadArchivedCardSuccess implements Action {
    readonly type = CardActionTypes.LoadArchivedCardSuccess;

    /* istanbul ignore next */
    constructor(public payload: { card: Card }) {}
}

export class HandleUnexpectedError implements Action {
    /* istanbul ignore next */
    readonly type = CardActionTypes.HandleUnexpectedError;

    /* istanbul ignore next */
    constructor(public payload: {error: Error}) {}
}

export class AddActionsAppear implements Action {
    readonly type = CardActionTypes.AddActionsAppear;
    /* istanbul ignore next */
    constructor(public payload: string) {}
}

export type CardActions = ClearCard
    | LoadCard
    | LoadCardSuccess
    | LoadCardFailure
    | LoadArchivedCard
    | LoadArchivedCardSuccess
    | LoadArchivedCardFailure
    | HandleUnexpectedError
    | AddActionsAppear;
