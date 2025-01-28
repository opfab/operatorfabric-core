/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {User} from '@ofServices/users/model/User';
import {RightEnum} from '@ofServices/perimeters/model/Perimeter';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';

export class UserWithPerimeters {
    public constructor(
        readonly userData: User,
        readonly computedPerimeters?: Array<ComputedPerimeter>,
        readonly permissions?: Array<PermissionEnum>,
        readonly processesStatesNotNotified?: Map<string, Array<string>>,
        readonly processesStatesNotifiedByEmail?: Map<string, Array<string>>,
        readonly sendCardsByEmail?: boolean,
        readonly emailToPlainText?: boolean,
        readonly disableCardContentInEmails?: boolean,
        readonly sendDailyEmail?: boolean,
        readonly sendWeeklyEmail?: boolean,
        readonly email?: string
    ) {}
}

export class ComputedPerimeter {
    public constructor(
        readonly process: string,
        readonly state: string,
        readonly rights: RightEnum,
        readonly filteringNotificationAllowed?: boolean
    ) {}
}

export function userRight(rights: RightEnum) {
    let result: number;
    switch (rights) {
        case RightEnum.ReceiveAndWrite:
            result = 0;
            break;
        case RightEnum.Receive:
            result = 1;
            break;
    }
    return result;
}
