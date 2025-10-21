/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class RRule {
    constructor(
        public freq?: Frequency,
        public count?: number,
        public interval?: number,
        public wkst?: Day,
        public byweekday?: Day[],
        public bymonth?: number[],
        public byhour?: number[],
        public byminute?: number[],
        public bysetpos?: number[],
        public bymonthday?: number[],
        public tzid?: string,
        public durationInMinutes?: number
    ) {}
}

export enum Frequency {
    YEARLY = 'YEARLY',
    MONTHLY = 'MONTHLY',
    WEEKLY = 'WEEKLY',
    DAILY = 'DAILY',
    HOURLY = 'HOURLY',
    MINUTELY = 'MINUTELY',
    SECONDLY = 'SECONDLY'
}

export enum Day {
    MO = 'MO',
    TU = 'TU',
    WE = 'WE',
    TH = 'TH',
    FR = 'FR',
    SA = 'SA',
    SU = 'SU'
}
