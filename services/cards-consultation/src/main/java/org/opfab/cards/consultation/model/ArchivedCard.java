/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Builder
@Document(collection = "archivedCards")
public record ArchivedCard(
        String uid,
        @Id String id,
        String parentCardId,
        String initialParentCardUid,
        String publisher,
        String processVersion,
        String process,
        String processInstanceId,
        String state,
        I18n title,
        I18n summary,
        @Indexed String titleTranslated,
        @Indexed String summaryTranslated,
        @CreatedDate Instant publishDate,
        Instant lttd,
        Instant startDate,
        @JsonInclude(JsonInclude.Include.NON_NULL) Instant endDate,
        @JsonInclude(JsonInclude.Include.NON_NULL) Instant expirationDate,
        @JsonInclude(JsonInclude.Include.NON_NULL) String media,
        SeverityEnum severity,
        @JsonInclude(JsonInclude.Include.NON_EMPTY) @Singular List<String> tags,
        @JsonInclude(JsonInclude.Include.NON_NULL) Object data,
        @JsonInclude(JsonInclude.Include.NON_EMPTY) @Singular List<String> userRecipients,
        @JsonInclude(JsonInclude.Include.NON_EMPTY) @Singular List<String> groupRecipients,
        @Singular List<String> entityRecipients,
        @Singular("entityRecipientForInformation") List<String> entityRecipientsForInformation,
        @Singular("entityAllowedToRespond") List<String> entitiesAllowedToRespond,
        @Singular("entityRequiredToRespond") List<String> entitiesRequiredToRespond,
        @Singular("entityAllowedToEdit") List<String> entitiesAllowedToEdit,
        @Singular List<String> externalRecipients,
        @JsonInclude(JsonInclude.Include.NON_EMPTY) List<TimeSpan> timeSpans,
        PublisherTypeEnum publisherType,
        String representative,
        PublisherTypeEnum representativeType,
        String wktGeometry,
        String wktProjection,
        Integer secondsBeforeTimeSpanForReminder,
        String processStateKey,
        @Indexed Instant deletionDate,
        @JsonProperty("rRule") // if we don't use this annotation, the field will be serialized as "rrule"
        @JsonInclude(JsonInclude.Include.NON_EMPTY) RRule rRule,

        List<CardActionEnum> actions) {

}
