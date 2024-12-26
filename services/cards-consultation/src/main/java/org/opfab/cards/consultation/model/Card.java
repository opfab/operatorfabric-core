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
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.validation.annotation.Validated;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "cards")
@Validated
public class Card {

    private String uid;
    @Id
    private String id;
    private String parentCardId;
    private String initialParentCardUid;

    private String publisher;
    private String processVersion;
    private String process;
    private String processInstanceId;
    private String state;
    private I18n title;
    private I18n summary;

    private String titleTranslated;
    private String summaryTranslated;

    private Instant publishDate;

    private Instant lastUpdate;

    private Instant lttd;
    private Instant startDate;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Instant endDate;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Instant expirationDate;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String media;

    private SeverityEnum severity;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Singular
    private List<String> tags;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Object data;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Singular
    private List<String> userRecipients;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Singular
    private List<String> groupRecipients;

    @Singular
    private List<String> entityRecipients;

    @Singular("entityRecipientForInformation")
    private List<String> entityRecipientsForInformation;

    @Singular("entityAllowedToRespond")
    private List<String> entitiesAllowedToRespond;

    @Singular("entityRequiredToRespond")
    private List<String> entitiesRequiredToRespond;

    @Singular("entityAllowedToEdit")
    private List<String> entitiesAllowedToEdit;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Singular
    private List<String> externalRecipients;

    @Singular
    private List<TimeSpan> timeSpans;

    @JsonIgnore
    private List<String> usersAcks;

    private List<String> entitiesAcks;

    @JsonIgnore
    private List<String> usersReads;

    @Transient
    private Boolean hasBeenAcknowledged;

    @Transient
    private Boolean hasBeenRead;

    private PublisherTypeEnum publisherType;
    private String representative;
    private PublisherTypeEnum representativeType;
    private String wktGeometry;
    private String wktProjection;
    private Integer secondsBeforeTimeSpanForReminder;

    private String processStateKey;

    @JsonProperty("rRule") // if we don't use this annotation, the field will be serialized as "rrule"
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private RRule rRule;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<CardActionEnum> actions;

}
