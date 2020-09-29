/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Action} from '@ngrx/store';

export enum TranslateActionsTypes {
    TranslationUpdateDone = '[i18n] translation update Done ',
    LoadProcessesTranslation = '[i18n] load processes translation '

}

export class TranslationUpdateDone implements Action {
    readonly type = TranslateActionsTypes.TranslationUpdateDone;
}

export class LoadProcessesTranslation implements Action {
    readonly type = TranslateActionsTypes.LoadProcessesTranslation;
}


export type TranslateActions =  TranslationUpdateDone | LoadProcessesTranslation ;
