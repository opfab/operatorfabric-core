/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CardForPublishing} from './model/CardForPublishing';
import {Card} from 'app/model/Card';

export function convertCardToCardForPublishing(card: Card): CardForPublishing {
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
        card.publisherType,
        card.representative,
        card.representativeType,
        card.tags,
        card.wktGeometry,
        card.wktProjection,
        card.secondsBeforeTimeSpanForReminder,
        card.timeSpans,
        card.rRule,
        card.actions
    );
}
