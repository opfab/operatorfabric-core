/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {User} from '@ofModel/user.model';
import {RightsEnum} from '@ofModel/perimeter.model';
import {PermissionEnum} from '@ofModel/permission.model';

export class UserWithPerimeters {
    public constructor(
        readonly userData: User,
        readonly computedPerimeters?: Array<ComputedPerimeter>,
        readonly permissions?: Array<PermissionEnum>,
        readonly processesStatesNotNotified?: Map<string, Array<string>>,
        readonly processesStatesNotifiedByEmail?: Map<string, Array<string>>,
        readonly sendCardsByEmail?: boolean,
        readonly emailToPlainText?: boolean,
        readonly sendDailyEmail?: boolean,
        readonly email?: string
    ) {}
}

export class ComputedPerimeter {
    public constructor(
        readonly process: string,
        readonly state: string,
        readonly rights: RightsEnum,
        readonly filteringNotificationAllowed: boolean
    ) {}
}

export function userRight(rights: RightsEnum) {
    let result;
    switch (rights) {
        case RightsEnum.ReceiveAndWrite:
            result = 0;
            break;
        case RightsEnum.Receive:
            result = 1;
            break;
    }
    return result;
}
