/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.validation.annotation.Validated;

import java.time.Instant;
import java.util.List;

@Document(collection = "archivedCards")
@Validated
public record ArchivedCard(
        @Id String id,
        @Indexed String parentCardId,
        String initialParentCardUid,
        String publisher,
        String processVersion,
        @Indexed Instant publishDate,
        @Indexed String process,
        @Indexed String processInstanceId,
        @Indexed String state,
        @Indexed Instant startDate,
        @Indexed Instant endDate,
        @Indexed Instant expirationDate,
        Instant lttd,
        I18n title,
        I18n summary,
        @Indexed String titleTranslated,
        @Indexed String summaryTranslated,
        @Indexed List<String> tags,
        SeverityEnum severity,
        Object data,
        @Indexed List<String> userRecipients,
        @Indexed List<String> groupRecipients,
        @Indexed List<String> entityRecipients,
        @Indexed List<String> entityRecipientsForInformation,
        List<String> externalRecipients,
        List<String> entitiesAllowedToRespond,
        List<String> entitiesRequiredToRespond,
        List<String> entitiesAllowedToEdit,
        @Indexed String processStateKey,
        PublisherTypeEnum publisherType,
        String representative,
        PublisherTypeEnum representativeType,
        String wktGeometry,
        String wktProjection,
        Integer secondsBeforeTimeSpanForReminder,
        RRule rRule,
        List<CardActionEnum> actions,
        List<TimeSpan> timeSpans,
        @Indexed Instant deletionDate) {

    public ArchivedCard(Card card) {
        this(
                card.uid,
                card.parentCardId,
                card.initialParentCardUid,
                card.publisher,
                card.processVersion,
                card.publishDate,
                card.process,
                card.processInstanceId,
                card.state,
                card.startDate,
                card.endDate,
                card.expirationDate,
                card.lttd,
                card.title,
                card.summary,
                card.titleTranslated,
                card.summaryTranslated,
                card.tags,
                card.severity,
                card.data,
                card.userRecipients,
                card.groupRecipients,
                card.entityRecipients,
                card.entityRecipientsForInformation,
                card.externalRecipients,
                card.entitiesAllowedToRespond,
                card.entitiesRequiredToRespond,
                card.entitiesAllowedToEdit,
                card.processStateKey,
                card.publisherType,
                card.representative,
                card.representativeType,
                card.wktGeometry,
                card.wktProjection,
                card.secondsBeforeTimeSpanForReminder,
                card.rRule,
                card.actions,
                card.timeSpans,
                null);

    }

}
