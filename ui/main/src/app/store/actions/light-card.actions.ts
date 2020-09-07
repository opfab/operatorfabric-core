/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Action} from '@ngrx/store';
import {LightCard} from '@ofModel/light-card.model';

export enum LightCardActionTypes {
    LoadLightCards = '[LCard] Load',
    EmptyLightCards = '[LCard] Empty',
    LoadLightCardsSuccess = '[LCard] Load Success',
    LoadLightCardsExtendedData = '[LCard] Load Extended Data',
    LoadLightCardsFailure = '[LCard] Load Fail',
    SelectLightCard = '[LCard] Select One',
    ClearLightCardSelection = '[LCard] Clear Light Card Selection',
    AddLightCardFailure = '[LCard] Add Light Card Fail',
    HandleUnexpectedError = '[LCard] Handle unexpected error related to authentication issue',
    RemoveLightCard = '[LCard] Remove a card',
    UpdateALightCard = '[LCard] Update a Light Card',
    LightCardAlreadyUpdated = '[LCard] Light Card already Updated'
}

// needed by NGRX entities
export class LoadLightCards implements Action {
    /* istanbul ignore next */
    readonly type = LightCardActionTypes.LoadLightCards;
}

export class EmptyLightCards implements Action {
    /* istanbul ignore next */
    readonly type = LightCardActionTypes.EmptyLightCards;
}

export class LoadLightCardsSuccess implements Action {
    readonly type = LightCardActionTypes.LoadLightCardsSuccess;

    /* istanbul ignore next */
    constructor(public payload: { lightCards: LightCard[] }) {
    }
}

export class LoadLightCardsExtendedData implements Action {
    readonly type = LightCardActionTypes.LoadLightCardsExtendedData;

    /* istanbul ignore next */
    constructor() {
    }
}

export class LoadLightCardsFailure implements Action {
    readonly type = LightCardActionTypes.LoadLightCardsFailure;

    /* istanbul ignore next */
    constructor(public payload: { error: Error }) {
    }
}

export class SelectLightCard implements Action {
    /* istanbul ignore next */
    readonly type = LightCardActionTypes.SelectLightCard;

    /* istanbul ignore next */
    constructor(public payload: { selectedCardId: string }) {
    }

}

export class ClearLightCardSelection implements Action {

    readonly type = LightCardActionTypes.ClearLightCardSelection;

    constructor() {
    }
}

export class AddLightCardFailure implements Action {
    readonly type = LightCardActionTypes.AddLightCardFailure;

    /* istanbul ignore next */
    constructor(public payload: { error: Error }) {
    }
}

export class HandleUnexpectedError implements Action {
    /* istanbul ignore next */
    readonly type = LightCardActionTypes.HandleUnexpectedError;

    /* istanbul ignore next */
    constructor(public payload: { error: Error }) {
    }
}

export class RemoveLightCard implements Action {
    readonly type = LightCardActionTypes.RemoveLightCard;

    constructor(public  payload: { cards: string[] }) {
    }
}

export class UpdateALightCard implements Action {
    readonly type = LightCardActionTypes.UpdateALightCard;

    constructor(public payload: { card: LightCard }) {
    }
}


export class LightCardAlreadyUpdated implements Action {
    readonly type = LightCardActionTypes.LightCardAlreadyUpdated;

    constructor() {
    }
}

export type LightCardActions =
    LoadLightCards
    | LoadLightCardsSuccess
    | LoadLightCardsFailure
    | SelectLightCard
    | ClearLightCardSelection
    | AddLightCardFailure
    | HandleUnexpectedError
    | EmptyLightCards
    | UpdateALightCard
    | LightCardAlreadyUpdated
    | RemoveLightCard;
