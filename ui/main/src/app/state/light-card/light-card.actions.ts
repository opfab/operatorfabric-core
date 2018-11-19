/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Action} from '@ngrx/store';
import {LightCard} from './light-card.model';

export enum LightCardActionTypes {
    LoadLightCards = '[Card] Load Light Cards',
    LoadLightCardsSuccess = '[Card] Load Light Cards Success',
    LoadLightCardsFail = '[Card] Load Light Cards Fail',
    LoadLightCard = '[Card] Load Light Card',
    LoadLightCardSuccess = '[Card] Load Light Card Success',
    LoadLightCardFail = '[Card] Load Light Card Fail',
    AddLightCardFailure = '[Card] Add Light Card Fail',
    HandleUnexpectedError = '[Card] Handle unexpected error related to authentication issue'
}
// needed by NGRX entities
export class LoadLightCards implements Action {
    readonly type = LightCardActionTypes.LoadLightCards;
}

export class LoadLightCardsSuccess implements Action {
    readonly type = LightCardActionTypes.LoadLightCardsSuccess;

    constructor(public payload: { lightCards: LightCard[] }) {
    }
}
// needed by NGRX entities
export class LoadLightCard implements Action {
    readonly type = LightCardActionTypes.LoadLightCard;

    constructor(public payload: { id: string }) {
            }
}
export class LoadLightCardsFail implements Action {
    readonly type = LightCardActionTypes.LoadLightCardsFail;
}

export class LoadLightCardSuccess implements Action {
    readonly type = LightCardActionTypes.LoadLightCardSuccess;

    constructor(public payload: { lightCard: LightCard }) {
    }
}

export class LoadLightCardFail implements Action {
    readonly type = LightCardActionTypes.LoadLightCardFail;
}

export class AddLightCardFailure implements Action {
    readonly type = LightCardActionTypes.AddLightCardFailure;

    constructor(public payload: { error: Error }) {
    }
}

export class HandleUnexpectedError implements Action {
    readonly type = LightCardActionTypes.HandleUnexpectedError;

    constructor(public payload: {error: Error}) {

    }
}

export type LightCardActions =
    LoadLightCards
    |  LoadLightCardsSuccess
    | LoadLightCardsFail
    | LoadLightCard
    | LoadLightCardSuccess
    | LoadLightCardFail
    | AddLightCardFailure
    | HandleUnexpectedError;
