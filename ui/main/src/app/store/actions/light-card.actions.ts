/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Action} from '@ngrx/store';

export enum LightCardActionTypes {
    SelectLightCard = '[LCard] Select One',
    ClearLightCardSelection = '[LCard] Clear Light Card Selection',
    RemoveLightCard = '[LCard] Remove a card'
}

export class SelectLightCard implements Action {
    readonly type = LightCardActionTypes.SelectLightCard;
    constructor(public payload: { selectedCardId: string }) {
    }
}

export class ClearLightCardSelection implements Action {
    readonly type = LightCardActionTypes.ClearLightCardSelection;
}

export class RemoveLightCard implements Action {
    readonly type = LightCardActionTypes.RemoveLightCard;
    constructor(public  payload: { card: string }) {
    }
}

export type LightCardActions =
    SelectLightCard
    | ClearLightCardSelection
    | RemoveLightCard;


