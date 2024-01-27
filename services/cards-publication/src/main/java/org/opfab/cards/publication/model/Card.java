/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.publication.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Min;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.validation.annotation.Validated;

import java.time.Instant;
import java.util.*;


@Data
@Document(collection = "cards")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Validated
public class Card  {

    @Builder.Default
    private String uid = UUID.randomUUID().toString();
    @Id
    private String id;

    @Indexed
    private String parentCardId;

    private String initialParentCardUid;

    @Builder.Default
    private Boolean keepChildCards = false;

    private String publisher;
    
    private String processVersion;
    
    private String process;
    
    private String processInstanceId;
    
    private String state;
    
    private I18n title;
    
    private I18n summary;

    private String titleTranslated;

    private String summaryTranslated;

    @CreatedDate
    @Indexed
    private Instant publishDate;

    private Instant lttd;
    
    @Indexed
    private Instant startDate;

    @Indexed
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Instant endDate;

    @Indexed
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Instant expirationDate;
    
    private SeverityEnum severity;

    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> tags;

    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<TimeSpan> timeSpans;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Object data;

    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Indexed
    private List<String> userRecipients;

    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Indexed
    private List<String> groupRecipients;

    @Singular("entityAllowedToRespond")
    private List<String> entitiesAllowedToRespond;

    @Singular("entityRequiredToRespond")
    private List<String> entitiesRequiredToRespond;

    @Singular("entityAllowedToEdit")
    private List<String> entitiesAllowedToEdit;

    @Singular
    @Indexed
    private List<String> entityRecipients;

    @Singular("entityRecipientForInformation")
    @Indexed
    private List<String> entityRecipientsForInformation;

    @Singular
    private List<String> externalRecipients;

    @JsonIgnore
    private List<String> usersAcks;

    @JsonIgnore
    private List<String> entitiesAcks;

    @JsonIgnore
    private List<String> usersReads;

    @Indexed
    private String processStateKey;

    @Builder.Default
    private PublisherTypeEnum publisherType = PublisherTypeEnum.EXTERNAL;

    private String  representative;
    private PublisherTypeEnum representativeType;

    private String wktGeometry;
    private String wktProjection;

    @Min(0)
    private Integer  secondsBeforeTimeSpanForReminder;

    private Boolean toNotify;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @JsonProperty("rRule")  
    private RRule rRule;

    @Indexed
    private Instant lastAckDate;

    private List<CardActionEnum> actions;

    public void prepare(Instant publishDate) {
        this.publishDate = publishDate;
        this.id = process + "." + processInstanceId;
        this.uid = UUID.randomUUID().toString();
        this.processStateKey = process + "." + state;
        this.entitiesAcks = Collections.emptyList();
    }


    public Boolean getKeepChildCards() {
        return keepChildCards;
    }

    public void setKeepChildCards(Boolean keepChildCards) {
        this.keepChildCards = (keepChildCards != null) && keepChildCards;
    }
}
