/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class Card {
    constructor(
        public uid: string,
        public id: string,
        public startDate: number,
        public endDate?: number,
        public secondsBeforeTimeSpanForReminder?: number,
        public timeSpans?: TimeSpan[],
        public rRule?: RRule
    ) {}
}

export class TimeSpan {
    constructor(readonly start: number, readonly end?: number | null, readonly recurrence?: Recurrence) {}
}

export class Recurrence {
    constructor(
        public hoursAndMinutes: HourAndMinutes,
        public daysOfWeek?: number[],
        public timeZone?: string,
        public months?: number[]
    ) {}
}

export class HourAndMinutes {
    constructor(public hours: number, public minutes: number) {}
}

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
        public tzid?: string
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
