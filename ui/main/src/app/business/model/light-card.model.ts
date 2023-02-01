/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {I18n} from '@ofModel/i18n.model';
import {RRule, TimeSpan} from './card.model';

export class LightCard {
    constructor(
        readonly uid: string,
        readonly id: string,
        readonly publisher: string,
        readonly processVersion: string,
        readonly publishDate: number,
        readonly startDate: number,
        readonly endDate: number,
        readonly expirationDate: number,
        readonly severity: Severity,
        readonly hasBeenAcknowledged: boolean = false,
        readonly hasBeenRead: boolean = false,
        public hasChildCardFromCurrentUserEntity: boolean = false,
        readonly processInstanceId?: string,
        readonly lttd?: number,
        readonly title?: I18n,
        readonly summary?: I18n,
        readonly titleTranslated?: string,
        readonly summaryTranslated?: string,
        readonly tags?: string[],
        readonly timeSpans?: TimeSpan[],
        readonly rRule?: RRule,
        readonly process?: string,
        readonly state?: string,
        readonly parentCardId?: string,
        readonly initialParentCardUid?: string,
        readonly keepChildCards?: boolean,
        readonly representative?: string,
        readonly representativeType?: PublisherType | string,
        readonly wktGeometry?: string,
        readonly wktProjection?: string,
        readonly entitiesAcks?: string[],
        readonly entityRecipients?: string[],
        readonly entitiesAllowedToRespond?: string[],
        readonly entitiesRequiredToRespond?: string[],
        readonly entitiesAllowedToEdit?: string[],
        readonly publisherType?: PublisherType | string,
        readonly secondsBeforeTimeSpanForReminder?: number
    ) {}
}

export enum Severity {
    ALARM = 'ALARM',
    ACTION = 'ACTION',
    COMPLIANT = 'COMPLIANT',
    INFORMATION = 'INFORMATION'
}

export enum Sound {
    INFORMATION,
    COMPLIANT
}

export enum PublisherType {
    EXTERNAL,
    ENTITY
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
