/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;
import org.springframework.data.annotation.Transient;
import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LightCard {

    private String uid;
    private String id;
    private String publisher;
    private String processVersion;
    private String process;
    private String processInstanceId;
    private String state;
    private Instant lttd;
    private Instant publishDate;
    private Instant startDate;
    private Instant endDate;
    private Instant expirationDate;
    private SeverityEnum severity;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> tags;
    private I18n title;
    private I18n summary;
    private String titleTranslated;
    private String summaryTranslated;
    @JsonIgnore
    private List<String> usersAcks;
    @Transient
    private Boolean hasBeenAcknowledged;
    private List<String> entitiesAcks;
    private List<String> entityRecipients;
    private List<String> entityRecipientsForInformation;
    private List<String> userRecipients;
    private List<String> groupRecipients;
    private List<String> usersReads;
    @Transient
    private Boolean hasBeenRead;
    private String parentCardId;
    private String initialParentCardUid;
    private List<String> entitiesAllowedToRespond;
    private List<String> entitiesRequiredToRespond;
    private List<String> entitiesAllowedToEdit;
    private PublisherTypeEnum publisherType;
    private String representative;
    private PublisherTypeEnum representativeType;
    private String wktGeometry;
    private String wktProjection;
    private Integer secondsBeforeTimeSpanForReminder;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @JsonProperty("rRule") // if we don't use this annotation, the field will be serialized as "rrule"
    private RRule rRule;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<CardActionEnum> actions;
    private List<TimeSpan> timeSpans;

    public static LightCard copy(Card other) {
        LightCardBuilder builder = builder()
                .uid(other.getUid())
                .id(other.getId())
                .parentCardId(other.getParentCardId())
                .initialParentCardUid(other.getInitialParentCardUid())
                .publisher(other.getPublisher())
                .process(other.getProcess())
                .processVersion(other.getProcessVersion())
                .state(other.getState())
                .processInstanceId(other.getProcessInstanceId())
                .lttd(other.getLttd())
                .startDate(other.getStartDate())
                .publishDate(other.getPublishDate())
                .endDate(other.getEndDate())
                .expirationDate(other.getExpirationDate())
                .severity(other.getSeverity())
                .tags(other.getTags())
                .title(other.getTitle())
                .summary(other.getSummary())
                .titleTranslated(other.getTitleTranslated())
                .summaryTranslated(other.getSummaryTranslated())
                .hasBeenAcknowledged(other.getHasBeenAcknowledged())
                .entitiesAcks(other.getEntitiesAcks())
                .entityRecipients(other.getEntityRecipients())
                .entityRecipientsForInformation(other.getEntityRecipientsForInformation())
                .userRecipients(other.getUserRecipients())
                .groupRecipients(other.getGroupRecipients())
                .hasBeenRead(other.getHasBeenRead())
                .entitiesAllowedToRespond(other.getEntitiesAllowedToRespond())
                .entitiesRequiredToRespond(other.getEntitiesRequiredToRespond())
                .publisherType(other.getPublisherType())
                .representative(other.getRepresentative())
                .representativeType(other.getRepresentativeType())
                .wktGeometry(other.getWktGeometry())
                .wktProjection(other.getWktProjection())
                .secondsBeforeTimeSpanForReminder(other.getSecondsBeforeTimeSpanForReminder())
                .rRule(other.getRRule())
                .actions(other.getActions())
                .timeSpans(other.getTimeSpans());

        return builder.build();

    }
}
