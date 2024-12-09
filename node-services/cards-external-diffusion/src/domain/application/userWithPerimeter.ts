/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class UserWithPerimeters {
    readonly sendDailyEmail?: true;
    readonly sendWeeklyEmail?: true;
    readonly email?: string;
    readonly timezoneForEmails?: string;
    readonly userData: UserData;
    readonly processesStatesNotNotified?: any;
    readonly processesStatesNotifiedByEmail?: any;
    readonly computedPerimeters: any[];
}

export class UserData {
    readonly login: string;
    readonly groups: string[];
    readonly entities: string[];
}
