/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Guid} from 'guid-typescript';
import {Message} from "@ofModel/message.model";

export interface AuthState {
    code: string;
    identifier: string;
    clientId: Guid;
    token: string;
    expirationDate: Date;
    message: Message;
    firstName: string;
    lastName: string;
    isImplicitlyAuthenticated: boolean;
}

export const authInitialState: AuthState = {
    code: null,
    identifier: null,
    clientId: null,
    token: null,
    expirationDate: new Date(0),
    message: null,
    firstName: null,
    lastName: null,
    isImplicitlyAuthenticated: false
};
