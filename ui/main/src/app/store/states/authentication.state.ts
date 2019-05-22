/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
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
}

export const authInitialState: AuthState = {
    code: null,
    identifier: null,
    clientId: null,
    token: null,
    expirationDate: new Date(0),
    message: null
};