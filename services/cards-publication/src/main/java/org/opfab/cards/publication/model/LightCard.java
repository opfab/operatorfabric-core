/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.List;

public record LightCard(
        String uid,
        String id,
        String publisher,
        String processVersion,
        String process,
        String processInstanceId,
        String state,
        Instant lttd,
        Instant publishDate,
        Instant startDate,
        Instant endDate,
        Instant expirationDate,
        SeverityEnum severity,
        @JsonInclude(JsonInclude.Include.NON_EMPTY) List<String> tags,
        I18n title,
        I18n summary,
        String titleTranslated,
        String summaryTranslated,
        List<TimeSpan> timeSpans,
        List<String> usersAcks,
        List<String> entitiesAcks,
        List<String> entityRecipients,
        List<String> groupRecipients,
        List<String> userRecipients,
        List<String> entityRecipientsForInformation,
        List<String> usersReads,
        String parentCardId,
        String initialParentCardUid,
        List<String> entitiesAllowedToRespond,
        List<String> entitiesRequiredToRespond,
        List<String> entitiesAllowedToEdit,
        PublisherTypeEnum publisherType,
        String representative,
        PublisherTypeEnum representativeType,
        String wktGeometry,
        String wktProjection,
        Integer secondsBeforeTimeSpanForReminder,
        @JsonInclude(JsonInclude.Include.NON_EMPTY) @JsonProperty("rRule") // if we don't use this annotation, the field
                                                                           // will be serialized as "rrule"
        RRule rRule,
        @JsonInclude(JsonInclude.Include.NON_EMPTY) List<CardActionEnum> actions,
        Object data) {

    public LightCard(Card card) {
        this(
                card.uid,
                card.id,
                card.publisher,
                card.processVersion,
                card.process,
                card.processInstanceId,
                card.state,
                card.lttd,
                card.publishDate,
                card.startDate,
                card.endDate,
                card.expirationDate,
                card.severity,
                card.tags,
                card.title,
                card.summary,
                card.titleTranslated,
                card.summaryTranslated,
                card.timeSpans,
                card.usersAcks,
                card.entitiesAcks,
                card.entityRecipients,
                card.groupRecipients,
                card.userRecipients,
                card.entityRecipientsForInformation,
                card.usersReads,
                card.parentCardId,
                card.initialParentCardUid,
                card.entitiesAllowedToRespond,
                card.entitiesRequiredToRespond,
                card.entitiesAllowedToEdit,
                card.publisherType,
                card.representative,
                card.representativeType,
                card.wktGeometry,
                card.wktProjection,
                card.secondsBeforeTimeSpanForReminder,
                card.rRule,
                card.actions,
                card.data);
    }

}
