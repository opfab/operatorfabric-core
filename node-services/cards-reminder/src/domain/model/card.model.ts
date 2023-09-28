/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Day, Frequency, PublisherType, Severity} from './light-card.model';
import {I18n} from './i18n.model';

export class Card {
    constructor(
        readonly uid: string,
        readonly id: string,
        readonly publisher: string,
        readonly processVersion: string,
        readonly publishDate: number,
        public startDate: number,
        readonly endDate: number,
        readonly expirationDate: number,
        readonly severity: Severity,
        public hasBeenAcknowledged: boolean = false,
        readonly hasBeenRead: boolean = false,
        readonly hasChildCardFromCurrentUserEntity: boolean = false,
        readonly process?: string,
        readonly processInstanceId?: string,
        readonly state?: string,
        readonly lttd?: number,
        readonly title?: I18n,
        readonly summary?: I18n,
        readonly titleTranslated?: string,
        readonly summaryTranslated?: string,
        readonly data?: any,
        readonly userRecipients?: string[],
        readonly groupRecipients?: string[],
        readonly entityRecipients?: string[],
        readonly entityRecipientsForInformation?: string[],
        readonly externalRecipients?: string[],
        readonly entitiesAllowedToRespond?: string[],
        readonly entitiesRequiredToRespond?: string[],
        readonly entitiesAllowedToEdit?: string[],
        readonly parentCardId?: string,
        readonly initialParentCardUid?: string,
        readonly keepChildCards?: boolean,
        readonly publisherType?: PublisherType | string,
        readonly representative?: string,
        readonly representativeType?: PublisherType | string,
        readonly wktGeometry?: string,
        readonly wktProjection?: string,
        public secondsBeforeTimeSpanForReminder?: number,
        public timeSpans?: TimeSpan[],
        readonly entitiesAcks?: string[],
        readonly deletionDate?: number,
        public rRule?: RRule,
        readonly _id?: string,

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
        public durationInMinutes?: number,
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
        public tzid?: string,
        public durationInMinutes?: number
    ) {}
}

