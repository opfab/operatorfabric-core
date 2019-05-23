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
    EmptyLightCards = '[LCard] Empty',
    LoadLightCardsSuccess = '[LCard] Load Success',
    LoadLightCardsExtendedData = '[LCard] Load Extended Data',
    LoadLightCardsFailure = '[LCard] Load Fail',
    SelectLightCard = '[LCard] Select One',
    AddLightCardFailure = '[LCard] Add Light Card Fail',
    UpdatedSubscription = '[LCard] UpdateSubscription',
    HandleUnexpectedError = '[LCard] Handle unexpected error related to authentication issue',
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
    constructor(public payload: {selectedCardId:string}){}

}

export class AddLightCardFailure implements Action {
    readonly type = LightCardActionTypes.AddLightCardFailure;

    /* istanbul ignore next */
    constructor(public payload: { error: Error }) {
    }
}

export class UpdatedSubscription implements Action {
    readonly type = LightCardActionTypes.UpdatedSubscription;

    /* istanbul ignore next */
    constructor() {
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
    | AddLightCardFailure
    | UpdatedSubscription
    | HandleUnexpectedError
    | EmptyLightCards;
