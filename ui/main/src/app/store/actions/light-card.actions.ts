/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
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
    SelectLightCard = '[LCard] Select One',
    ClearLightCardSelection = '[LCard] Clear Light Card Selection',
    AddLightCardFailure = '[LCard] Add Light Card Fail',
    RemoveLightCard = '[LCard] Remove a card',
    UpdateALightCard = '[LCard] Update a Light Card',
    LightCardAlreadyUpdated = '[LCard] Light Card already Updated'
}

export class LoadLightCards implements Action {
    readonly type = LightCardActionTypes.LoadLightCards;
}

export class EmptyLightCards implements Action {
    readonly type = LightCardActionTypes.EmptyLightCards;
}

export class LoadLightCardsSuccess implements Action {
    readonly type = LightCardActionTypes.LoadLightCardsSuccess;
    constructor(public payload: {lightCard: LightCard} ) {
    }
}


export class SelectLightCard implements Action {
    readonly type = LightCardActionTypes.SelectLightCard;
    constructor(public payload: { selectedCardId: string }) {
    }

}

export class ClearLightCardSelection implements Action {
    readonly type = LightCardActionTypes.ClearLightCardSelection;
}

export class AddLightCardFailure implements Action {
    readonly type = LightCardActionTypes.AddLightCardFailure;
    constructor(public payload: { error: Error }) {
    }
}

export class RemoveLightCard implements Action {
    readonly type = LightCardActionTypes.RemoveLightCard;
    constructor(public  payload: { card: string }) {
    }
}

export class UpdateALightCard implements Action {
    readonly type = LightCardActionTypes.UpdateALightCard;
    constructor(public payload: { card: LightCard }) {
    }
}

export class LightCardAlreadyUpdated implements Action {
    readonly type = LightCardActionTypes.LightCardAlreadyUpdated;
}

export type LightCardActions =
    LoadLightCards
    | LoadLightCardsSuccess
    | SelectLightCard
    | ClearLightCardSelection
    | AddLightCardFailure
    | EmptyLightCards
    | UpdateALightCard
    | LightCardAlreadyUpdated
    | RemoveLightCard;
