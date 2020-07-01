/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

// tslint:disable-next-line: quotemark
import { User } from "@ofModel/user.model";


export class UserWithPerimeters {

    public constructor(
        readonly userData: User,
        readonly computedPerimeters?: Array<ComputedPerimeter>
    ) { }

}

export class ComputedPerimeter {
    public constructor(
        readonly process: string,
        readonly state: string,
        readonly rights: RightsEnum
    ) { }

}


export enum RightsEnum {
    Write = "Write", ReceiveAndWrite = "ReceiveAndWrite", Receive = "Receive"
}


export function userRight(rights: RightsEnum) {
    let result;
    switch (rights) {
        case RightsEnum.Write:
            result = 0;
            break;
        case RightsEnum.ReceiveAndWrite:
            result = 1;
            break;
        case RightsEnum.Receive:
            result = 2;
            break;
    }
    return result;
}
