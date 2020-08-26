/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


export class User {

    public constructor(
        readonly login: string,
        readonly firstName: string,
        readonly lastName: string,
        readonly groups?: Array<string>,
        readonly entities?: Array<string>
    ) {
    }

}

export class Entity {

    constructor(
        readonly id: string,
        readonly name: string,
        readonly description: string
    ) {
    }
}
