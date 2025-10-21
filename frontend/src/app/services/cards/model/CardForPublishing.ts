/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {PublisherType} from 'app/model/PublisherType';
import {CardAction} from 'app/model/CardAction';
import {Severity} from 'app/model/Severity';
import {I18n} from 'app/model/I18n';
import {RRule} from 'app/model/RRule';
import {TimeSpan} from 'app/model/TimeSpan';

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
        readonly publisherType?: PublisherType | string,
        readonly representative?: string,
        readonly representativeType?: PublisherType | string,
        readonly tags?: string[],
        readonly wktGeometry?: string,
        readonly wktProjection?: string,
        readonly secondsBeforeTimeSpanForReminder?: number,
        readonly timeSpans?: TimeSpan[],
        readonly rRule?: RRule,
        public actions?: CardAction[]
    ) {}
}
