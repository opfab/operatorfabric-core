/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Action} from '@ngrx/store';
import {LightCard} from '@ofModel/light-card.model';

export enum LightCardActionTypes {
    LoadLightCards = '[LCard] Load',
    LoadLightCardsSuccess = '[LCard] Load Success',
    LoadLightCardsExtendedData = '[LCard] Load Extended Data',
    LoadLightCardsFailure = '[LCard] Load Fail',
    SelectLightCard = '[LCard] Select One',
    AddLightCardFailure = '[LCard] Add Light Card Fail',
    HandleUnexpectedError = '[LCard] Handle unexpected error related to authentication issue'
}
// needed by NGRX entities
export class LoadLightCards implements Action {
    /* istanbul ignore next */
    readonly type = LightCardActionTypes.LoadLightCards;
}

export class LoadLightCardsSuccess implements Action {
    readonly type = LightCardActionTypes.LoadLightCardsSuccess;

    constructor(public payload: { lightCards: LightCard[] }) {
    }
}

export class LoadLightCardsExtendedData implements Action {
    readonly type = LightCardActionTypes.LoadLightCardsExtendedData;

    constructor() {
    }
}

export class LoadLightCardsFailure implements Action {
    readonly type = LightCardActionTypes.LoadLightCardsFailure;

    constructor(public payload: { error: Error }) {
    }
}

export class SelectLightCard implements Action {
    /* istanbul ignore next */
    readonly type = LightCardActionTypes.SelectLightCard;
    /* istanbul ignore next */
    constructor(public payload: {selectedCardId:string}){}

}

export class AddLightCardFailure implements Action {
    readonly type = LightCardActionTypes.AddLightCardFailure;

    constructor(public payload: { error: Error }) {
    }
}

export class HandleUnexpectedError implements Action {
    /* istanbul ignore next */
    readonly type = LightCardActionTypes.HandleUnexpectedError;
    /* istanbul ignore next */
    constructor(public payload: {error: Error}) {

    }
}

export type LightCardActions =
    LoadLightCards
    | LoadLightCardsSuccess
    | LoadLightCardsFailure
    | SelectLightCard
    // | LoadLightCard
    // | LoadLightCardSuccess
    // | LoadLightCardFailure
    | AddLightCardFailure
    | HandleUnexpectedError;
