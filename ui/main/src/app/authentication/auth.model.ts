
/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Guid} from "guid-typescript";


export class AuthenticatedUser {
    public clientId: Guid;
    public login: string;
    public token: string;
    public expirationDate: Date;
}

export enum AuthenticationMode {
    NONE = 'none',
    PASSWORD = 'password',
    CODE = 'code',
    IMPLICIT = 'implicit'
}