/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Day, Frequency, LightCard, PublisherType, Severity} from '@ofModel/light-card.model';
import {I18n} from '@ofModel/i18n.model';

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
        readonly tags? : string[],
        readonly wktGeometry?: string,
        readonly wktProjection?: string,
        public secondsBeforeTimeSpanForReminder?: number,
        public timeSpans?: TimeSpan[],
        readonly entitiesAcks?: string[],
        readonly deletionDate?: number,
        public rRule?: RRule
    ) {}
}

export class CardForPublishing {
    constructor(
        readonly publisher: string,
        readonly processVersion: string,
        readonly startDate: number,
        readonly endDate: number,
        readonly expirationDate: number,
        readonly severity: Severity,
        readonly process?: string,
        readonly processInstanceId?: string,
        readonly state?: string,
        readonly lttd?: number,
        readonly title?: I18n,
        readonly summary?: I18n,
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
        readonly tags?: string[],
        readonly wktGeometry?: string,
        readonly wktProjection?: string,
        readonly secondsBeforeTimeSpanForReminder?: number,
        readonly timeSpans?: TimeSpan[],
        readonly rRule?: RRule
    ) {}
}

export class CardData {
    constructor(readonly card: Card, readonly childCards: Card[]) {}
}

export class CardCreationReportData {
    constructor(readonly uid: string, readonly id: string) {}
}

export class TimeSpan {
    constructor(readonly start: number, readonly end?: number, readonly recurrence?: Recurrence) {}
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

export function fromCardToLightCard(card: Card): LightCard {
    return new LightCard(
        card.uid,
        card.id,
        card.publisher,
        card.processVersion,
        card.publishDate,
        card.startDate,
        card.endDate,
        card.expirationDate,
        card.severity,
        card.hasBeenAcknowledged,
        card.hasBeenRead,
        card.hasChildCardFromCurrentUserEntity,
        card.processInstanceId,
        card.lttd,
        card.title,
        card.summary,
        card.titleTranslated,
        card.summaryTranslated,
        null,
        [],
        card.rRule,
        card.process,
        card.state,
        card.parentCardId,
        card.initialParentCardUid,
        card.keepChildCards,
        card.representative,
        card.representativeType,
        card.wktGeometry,
        card.wktProjection,
        card.entitiesAcks,
        card.entityRecipients,
        card.entityRecipientsForInformation,
        card.entitiesAllowedToRespond,
        card.entitiesRequiredToRespond,
        card.entitiesAllowedToEdit,
        card.publisherType
    );
}

export function fromCardToCardForPublishing(card: Card): CardForPublishing {
    return new CardForPublishing(
        card.publisher,
        card.processVersion,
        card.startDate,
        card.endDate,
        card.expirationDate,
        card.severity,
        card.process,
        card.processInstanceId,
        card.state,
        card.lttd,
        card.title,
        card.summary,
        card.data,
        card.userRecipients,
        card.groupRecipients,
        card.entityRecipients,
        card.entityRecipientsForInformation,
        card.externalRecipients,
        card.entitiesAllowedToRespond,
        card.entitiesRequiredToRespond,
        card.entitiesAllowedToEdit,
        card.parentCardId,
        card.initialParentCardUid,
        card.keepChildCards,
        card.publisherType,
        card.representative,
        card.representativeType,
        card.tags,
        card.wktGeometry,
        card.wktProjection,
        card.secondsBeforeTimeSpanForReminder,
        card.timeSpans,
        card.rRule
    );
}
