/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
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
                                card.getUid(),
                                card.getParentCardId(),
                                card.getInitialParentCardUid(),
                                card.getPublisher(),
                                card.getProcessVersion(),
                                card.getPublishDate(),
                                card.getProcess(),
                                card.getProcessInstanceId(),
                                card.getState(),
                                card.getStartDate(),
                                card.getEndDate(),
                                card.getExpirationDate(),
                                card.getLttd(),
                                card.getTitle(),
                                card.getSummary(),
                                card.getTitleTranslated(),
                                card.getSummaryTranslated(),
                                card.getTags(),
                                card.getSeverity(),
                                card.getData(),
                                card.getUserRecipients(),
                                card.getGroupRecipients(),
                                card.getEntityRecipients(),
                                card.getEntityRecipientsForInformation(),
                                card.getExternalRecipients(),
                                card.getEntitiesAllowedToRespond(),
                                card.getEntitiesRequiredToRespond(),
                                card.getEntitiesAllowedToEdit(),
                                card.getProcessStateKey(),
                                card.getPublisherType(),
                                card.getRepresentative(),
                                card.getRepresentativeType(),
                                card.getWktGeometry(),
                                card.getWktProjection(),
                                card.getSecondsBeforeTimeSpanForReminder(),
                                card.getRRule(),
                                card.getActions(),
                                card.getTimeSpans(),
                                null);

        }

}
