/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Action} from '@ngrx/store';
import {Update} from '@ngrx/entity';
import {LightCard} from './light-card.model';

export enum LightCardActionTypes {
    LoadLightCards = '[Card] Load Light Cards',
    LoadLightCardsSuccess = '[Card] Load Light Cards Success',
    LoadLightCardsFail = '[Card] Load Light Cards Fail',
    LoadLightCard = '[Card] Load Light Card',
    LoadLightCardSuccess = '[Card] Load Light Card Success',
    LoadLightCardFail = '[Card] Load Light Card Fail',
    AddLightCard = '[Card] Add Light Card',
    AddLightCardSuccess = '[Card] Add Light Card Success',
    AddLightCardFailure = '[Card] Add Light Card Fail',
    UpsertLightCard = '[Card] Upset Light Card',
    AddLightCards = '[Card] Add Light Cards',
    UpsertLightCards = '[Card] Upset Light Cards',
    UpdateLightCard = '[Card] Update Light Card',
    UpdateLightCards = '[Card] Update Light Cards',
    DeleteLightCard = '[Card] Delete Light Card',
    DeleteLightCards = '[Card] Delete Light Cards',
    ClearLightCards = '[Card] Clear Light Cards',
    HandleUnexpectedError = '[Card] Handle unexpected error related to authentication issue'
}

export class LoadLightCards implements Action {
    readonly type = LightCardActionTypes.LoadLightCards;
}

export class LoadLightCardsSuccess implements Action {
    readonly type = LightCardActionTypes.LoadLightCardsSuccess;

    constructor(public payload: { lightCards: LightCard[] }) {
    }
}

export class LoadLightCardsFail implements Action {
    readonly type = LightCardActionTypes.LoadLightCardsFail;
}

export class LoadLightCard implements Action {
    readonly type = LightCardActionTypes.LoadLightCard;

    constructor(public payload: { id: string }) {
    }
}

export class LoadLightCardSuccess implements Action {
    readonly type = LightCardActionTypes.LoadLightCardSuccess;

    constructor(public payload: { lightCard: LightCard }) {
    }
}

export class LoadLightCardFail implements Action {
    readonly type = LightCardActionTypes.LoadLightCardFail;
}

export class AddLightCard implements Action {
    readonly type = LightCardActionTypes.AddLightCard;

    constructor(public payload: { lightCard: LightCard }) {
    }
}

export class AddLightCardSuccess implements Action {
    readonly type = LightCardActionTypes.AddLightCardSuccess;

    constructor(public payload: { lightCard: LightCard }) {
    }
}

export class AddLightCardFailure implements Action {
    readonly type = LightCardActionTypes.AddLightCardFailure;

    constructor(public payload: { error: Error }) {
    }
}

export class UpsertLightCard implements Action {
    readonly type = LightCardActionTypes.UpsertLightCard;

    constructor(public payload: { lightCard: LightCard }) {
    }
}

export class AddLightCards implements Action {
    readonly type = LightCardActionTypes.AddLightCards;

    constructor(public payload: { lightCards: LightCard[] }) {
    }
}

export class UpsertLightCards implements Action {
    readonly type = LightCardActionTypes.UpsertLightCards;

    constructor(public payload: { lightCards: LightCard[] }) {
    }
}

export class UpdateLightCard implements Action {
    readonly type = LightCardActionTypes.UpdateLightCard;

    constructor(public payload: { lightCard: Update<LightCard> }) {
    }
}

export class UpdateLightCards implements Action {
    readonly type = LightCardActionTypes.UpdateLightCards;

    constructor(public payload: { lightCards: Update<LightCard>[] }) {
    }
}

export class DeleteLightCard implements Action {
    readonly type = LightCardActionTypes.DeleteLightCard;

    constructor(public payload: { id: string }) {
    }
}

export class DeleteLightCards implements Action {
    readonly type = LightCardActionTypes.DeleteLightCards;

    constructor(public payload: { ids: string[] }) {
    }
}

export class ClearLightCards implements Action {
    readonly type = LightCardActionTypes.ClearLightCards;
}

export class HandleUnexpectedError implements Action {
    readonly type = LightCardActionTypes.HandleUnexpectedError;
}

export type LightCardActions =
    LoadLightCards
    | LoadLightCardsSuccess
    | LoadLightCardsFail
    | LoadLightCard
    | LoadLightCardSuccess
    | LoadLightCardFail
    | AddLightCard
    | AddLightCardSuccess
    | AddLightCardFailure
    | UpsertLightCard
    | AddLightCards
    | UpsertLightCards
    | UpdateLightCard
    | UpdateLightCards
    | DeleteLightCard
    | DeleteLightCards
    | ClearLightCards
    | HandleUnexpectedError;
