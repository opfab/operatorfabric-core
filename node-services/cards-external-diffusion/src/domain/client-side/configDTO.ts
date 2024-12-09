/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export default class ConfigDTO {
    public mailFrom: string;
    public subjectPrefix: string;
    public bodyPrefix: string;
    public bodyPostfix: string;
    public publisherEntityPrefix: string;
    public dailyEmailTitle: string;
    public weeklyEmailTitle: string;
    public dayOfWeekToSendWeeklyRecapEmail: 0;
    public hourToSendRecapEmail: 0;
    public minuteToSendRecapEmail: 0;
    public opfabUrlInMailContent: string;
    public windowInSecondsForCardSearch = 0;
    public checkPeriodInSeconds = 0;
    public activateCardsDiffusionRateLimiter: boolean;
    public sendRateLimit = 100;
    public sendRateLimitPeriodInSec = 3600;
    public defaultTimeZone: string;
}
