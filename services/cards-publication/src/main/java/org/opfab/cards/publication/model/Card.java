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
import org.opfab.utilities.ObjectUtils;
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

    @CreatedDate
    @Indexed
    private Instant lastUpdate;

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

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @JsonProperty("rRule")  
    private RRule rRule;

    private List<CardActionEnum> actions;

    public void prepare(Instant publishDate) {
        this.publishDate = publishDate;
        this.id = process + "." + processInstanceId;
        this.uid = UUID.randomUUID().toString();
        this.processStateKey = process + "." + state;
        this.entitiesAcks = Collections.emptyList();
    }

    public Card patch(Card other) {
        Card result = new Card();

        result.uid = this.uid;
        result.id = this.id;
        result.parentCardId = this.parentCardId;
        result.initialParentCardUid = this.initialParentCardUid;

        result.publisher = ObjectUtils.getNotNullOrDefault(other.getPublisher(), this.getPublisher());

        result.processVersion = ObjectUtils.getNotNullOrDefault(other.getProcessVersion(),
                this.getProcessVersion());

        result.process = this.process;
        result.processInstanceId = this.processInstanceId;

        result.state = ObjectUtils.getNotNullOrDefault(other.getState(),
                this.getState());
        result.title = ObjectUtils.getNotNullOrDefault(other.getTitle(),
                this.getTitle());
        result.summary = ObjectUtils.getNotNullOrDefault(other.getSummary(),
                this.getSummary());

        result.titleTranslated = ObjectUtils.getNotNullOrDefault(other.getTitleTranslated(),
                this.getTitleTranslated());
        result.summaryTranslated = ObjectUtils.getNotNullOrDefault(other.getSummaryTranslated(),
                this.getSummaryTranslated());
        result.publishDate = this.getPublishDate();
        result.lastUpdate = this.getLastUpdate();

        result.lttd = ObjectUtils.getNotNullOrDefault(other.getLttd(),
                this.getLttd());
        result.startDate = ObjectUtils.getNotNullOrDefault(other.getStartDate(), this.getStartDate());

        result.endDate = ObjectUtils.getNotNullOrDefault(other.getEndDate(), this.getEndDate());
        result.expirationDate = ObjectUtils.getNotNullOrDefault(other.getExpirationDate(),
                this.getExpirationDate());
        result.severity = ObjectUtils.getNotNullOrDefault(other.getSeverity(), this.getSeverity());
        result.tags = ObjectUtils.getNotNullOrDefault(other.getTags(),
                this.getTags(), ArrayList::new);
        result.timeSpans = ObjectUtils.getNotNullOrDefault(other.getTimeSpans(),
                this.getTimeSpans(), ArrayList::new);

        result.data = ObjectUtils.getNotNullOrDefault(other.getData(), this.getData());

        result.userRecipients = ObjectUtils.getNotNullOrDefault(other.getUserRecipients(),
                this.getUserRecipients(), ArrayList::new);

        result.groupRecipients = ObjectUtils.getNotNullOrDefault(other.getGroupRecipients(),
                this.getGroupRecipients(), ArrayList::new);

        result.entitiesAllowedToRespond = ObjectUtils.getNotNullOrDefault(other.getEntitiesAllowedToRespond(),
                this.getEntitiesAllowedToRespond(), ArrayList::new);

        result.entitiesRequiredToRespond = ObjectUtils.getNotNullOrDefault(other.getEntitiesRequiredToRespond(),
                this.getEntitiesRequiredToRespond(), ArrayList::new);

        result.entitiesAllowedToEdit = ObjectUtils.getNotNullOrDefault(other.getEntitiesAllowedToEdit(),
                this.getEntitiesAllowedToEdit(), ArrayList::new);

        result.entityRecipients = ObjectUtils.getNotNullOrDefault(other.getEntityRecipients(),
                this.getEntityRecipients(), ArrayList::new);

        result.entityRecipientsForInformation = ObjectUtils.getNotNullOrDefault(other.getEntityRecipientsForInformation(),
                this.getEntityRecipientsForInformation(), ArrayList::new);

        result.externalRecipients = ObjectUtils.getNotNullOrDefault(other.getExternalRecipients(),
                this.getExternalRecipients(), ArrayList::new);

        result.usersAcks = this.getUsersAcks();
        result.entitiesAcks = this.getEntitiesAcks();
        result.usersReads = this.getUsersReads();
        result.processStateKey = result.process + "." + result.state;

        result.publisherType = ObjectUtils.getNotNullOrDefault(other.getPublisherType(), this.getPublisherType());
        result.representative = ObjectUtils.getNotNullOrDefault(other.getRepresentative(), this.getRepresentative());
        result.representativeType = ObjectUtils.getNotNullOrDefault(other.getRepresentativeType(),
                this.getRepresentativeType());
        result.wktGeometry = ObjectUtils.getNotNullOrDefault(other.getWktGeometry(), this.getWktGeometry());
        result.wktProjection = ObjectUtils.getNotNullOrDefault(other.getWktProjection(), this.getWktProjection());
        result.secondsBeforeTimeSpanForReminder =
                ObjectUtils.getNotNullOrDefault(other.getSecondsBeforeTimeSpanForReminder(),
                        this.getSecondsBeforeTimeSpanForReminder());
        result.rRule = ObjectUtils.getNotNullOrDefault(other.getRRule(), this.getRRule());
        result.actions = ObjectUtils.getNotNullOrDefault(other.getActions(), this.getActions());

        return result;
    }

    public void setLastUpdate(Instant lastUpdate){
        this.lastUpdate = lastUpdate;
    }
}
