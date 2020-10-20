/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
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
        readonly recipient?: Recipient,
        readonly parentCardUid?: string,
        readonly publisherType?: PublisherType | string,
        readonly timeSpans?: TimeSpan[]
    ) {
    }
}

export enum TitlePosition {
    UP, DOWN, NONE

}


export class Recipient {
    constructor(
        readonly type?: RecipientEnum,
        readonly recipients?: Recipient[],
        readonly identity?: string
    ) {}
}

export enum RecipientEnum {
    DEADEND, GROUP, UNION, USER
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
        readonly end?: number
    ) { }
}

export function fromCardToLightCard(card: Card): LightCard {
    return new LightCard(card.uid, card.id, card.publisher, card.processVersion, card.publishDate, card.startDate
        , card.endDate, card.severity, card.hasBeenAcknowledged, card.hasBeenRead, card.processInstanceId
        , card.lttd, card.title, card.summary, null, [], card.process, card.state, card.parentCardUid);
}
