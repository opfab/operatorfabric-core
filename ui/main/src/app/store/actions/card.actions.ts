/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Action} from '@ngrx/store';
import {Card} from '@ofModel/card.model';

export enum CardActionTypes {
    ClearCard = '[Card] Clear',
    LoadCard = '[Card] Load Card',
    LoadCardSuccess = '[Card] Load Card Success',
    LoadCardFailure = '[Card] Load Card Fail'
}

export class ClearCard implements Action {
    readonly type = CardActionTypes.ClearCard;
}
export class LoadCard implements Action {
    readonly type = CardActionTypes.LoadCard;
    constructor(public payload: { id: string }) {}
}
export class LoadCardFailure implements Action {
    readonly type = CardActionTypes.LoadCardFailure;
    constructor(public payload: { error: Error }) {}
}

export class LoadCardSuccess implements Action {
    readonly type = CardActionTypes.LoadCardSuccess;
    constructor(public payload: { card: Card, childCards: Card[] }) {}
}


export type CardActions = ClearCard
    | LoadCard
    | LoadCardSuccess
    | LoadCardFailure;
