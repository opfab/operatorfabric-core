/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {LightCard, PublisherType, Severity} from '@ofModel/light-card.model';
import {I18n} from '@ofModel/i18n.model';

export class Card {
    /* istanbul ignore next */
    constructor(
        readonly uid: string,
        readonly id: string,
        readonly publisher: string,
        readonly processVersion: string,
        readonly publishDate: number,
        readonly startDate: number,
        readonly endDate: number,
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
        readonly externalRecipients?: string[],
        readonly entitiesAllowedToRespond?: string[],
        readonly entitiesRequiredToRespond?: string[],
        readonly parentCardId?: string,
        readonly initialParentCardUid?: string,
        readonly keepChildCards?: boolean,
        readonly publisherType?: PublisherType | string,
        readonly representative?: string,
        readonly representativeType?: PublisherType | string,
        public secondsBeforeTimeSpanForReminder?: number,
        public timeSpans?: TimeSpan[]
    ) {
    }
}

export class CardForPublishing {
    constructor(
        readonly publisher: string,
        readonly processVersion: string,
        readonly startDate: number,
        readonly endDate: number,
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
        readonly externalRecipients?: string[],
        readonly entitiesAllowedToRespond?: string[],
        readonly entitiesRequiredToRespond?: string[],
        readonly parentCardId?: string,
        readonly initialParentCardUid?: string,
        readonly keepChildCards?: boolean,
        readonly publisherType?: PublisherType | string,
        readonly representative?: string,
        readonly representativeType?: PublisherType | string,
        readonly secondsBeforeTimeSpanForReminder?: number,
        readonly timeSpans?: TimeSpan[]
    ) {
    }
}

export class CardData {
    constructor(
        readonly card: Card,
        readonly childCards: Card[]
    ) {}
}

export class TimeSpan {
    constructor(
        readonly start: number,
        readonly end?: number,
        readonly recurrence?: Recurrence
    ) { }
}

export class Recurrence {
    constructor(
        public hoursAndMinutes: HourAndMinutes,
        public daysOfWeek?: number[],
        public timeZone?: string,
        public durationInMinutes?: number
    ) {}

}

export class HourAndMinutes {
    constructor(
        public hours: number,
        public minutes: number
    ) {}

}


export function fromCardToLightCard(card: Card): LightCard {
    return new LightCard(card.uid, card.id, card.publisher, card.processVersion, card.publishDate, card.startDate
        , card.endDate, card.severity, card.hasBeenAcknowledged, card.hasBeenRead, card.hasChildCardFromCurrentUserEntity, card.processInstanceId
        , card.lttd, card.title, card.summary, card.titleTranslated, card.summaryTranslated, null, [], card.process, card.state, card.parentCardId,
        card.initialParentCardUid, card.keepChildCards,card.representative, card.representativeType);
}

export function fromCardToCardForPublishing(card: Card): CardForPublishing {
    return new CardForPublishing(
        card.publisher,
        card.processVersion,
        card.startDate,
        card.endDate,
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
        card.externalRecipients,
        card.entitiesAllowedToRespond,
        card.entitiesRequiredToRespond,
        card.parentCardId,
        card.initialParentCardUid,
        card.keepChildCards,
        card.publisherType,
        card.representative,
        card.representativeType,
        card.secondsBeforeTimeSpanForReminder,
        card.timeSpans
    );
}
