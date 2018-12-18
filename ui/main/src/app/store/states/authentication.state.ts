/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Guid} from "guid-typescript";

export interface AuthState {
    identifier: string;
    clientId: Guid;
    token: string;
    expirationDate: Date;
    denialReason: string;
}

export const authInitialState: AuthState = {
    identifier: null,
    clientId: null,
    token: null,
    expirationDate: new Date(0),
    denialReason: null
};