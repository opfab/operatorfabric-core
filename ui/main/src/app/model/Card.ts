/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {PublisherType} from './PublisherType';
import {CardAction} from './CardAction';
import {Severity} from './Severity';
import {I18n} from 'app/model/I18n';
import {RRule} from 'app/model/RRule';
import {TimeSpan} from 'app/model/TimeSpan';

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
        readonly publisherType?: PublisherType | string,
        readonly representative?: string,
        readonly representativeType?: PublisherType | string,
        readonly tags?: string[],
        readonly wktGeometry?: string,
        readonly wktProjection?: string,
        public secondsBeforeTimeSpanForReminder?: number,
        public timeSpans?: TimeSpan[],
        readonly entitiesAcks?: string[],
        readonly deletionDate?: number,
        public rRule?: RRule,
        public actions?: CardAction[]
    ) {}
}
