/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Action} from '@ngrx/store';
import { Message } from '@ofModel/message.model';

export enum AlertActionTypes {
    AlertMessage = 'Alert message'
}

export class AlertMessage implements Action {
    readonly type = AlertActionTypes.AlertMessage;

    constructor(public payload: { alertMessage: Message }) {
    }
}

export type AlertActions = AlertMessage;
