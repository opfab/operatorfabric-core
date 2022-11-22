/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
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
import lombok.*;
import org.opfab.cards.model.SeverityEnum;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.*;

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>Card Model, documented at {@link Card}</p>
 * <p>
 * {@inheritDoc}
 *
 *
 */
@Data
@Document(collection = "cards")
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class CardPublicationData implements Card {

    @Builder.Default
    private String uid = UUID.randomUUID().toString();
    @Id
    private String id;

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
    @Singular
    private List<String> externalRecipients;
    @JsonIgnore
    private List<String> usersAcks;
    @JsonIgnore
    private List<String> entitiesAcks;
    @JsonIgnore
    private List<String> usersReads;

    @Transient
    private Boolean hasBeenAcknowledged;
    @Transient
    private Boolean hasBeenRead;
    @Indexed
    private String processStateKey;
    @Builder.Default
    private PublisherTypeEnum publisherType = PublisherTypeEnum.EXTERNAL;

    private String  representative;
    private PublisherTypeEnum representativeType;

    private String wktGeometry;
    private String wktProjection;

    private Integer  secondsBeforeTimeSpanForReminder;

    private Boolean toNotify;

    @Indexed
    private Instant lastAckDate;

    public void prepare(Instant publishDate) {
        this.publishDate = publishDate;
        this.id = process + "." + processInstanceId;
        if (null == this.uid)
        	this.uid = UUID.randomUUID().toString();
        this.processStateKey = process + "." + state;
        this.entitiesAcks = Collections.emptyList();
    }

    public LightCardPublicationData toLightCard() {
        LightCardPublicationData.LightCardPublicationDataBuilder result = LightCardPublicationData.builder()
                .id(this.getId())
                .uid(this.getUid())
                .parentCardId(this.getParentCardId())
                .initialParentCardUid(this.getInitialParentCardUid())
                .keepChildCards(this.getKeepChildCards())
                .publisher(this.getPublisher())
                .processVersion(this.getProcessVersion())
                .process(this.getProcess())
                .processInstanceId(this.getProcessInstanceId())
                .state(this.getState())
                .lttd(this.getLttd())
                .startDate(this.getStartDate())
                .endDate(this.getEndDate())
                .expirationDate(this.getExpirationDate())
                .publishDate(this.getPublishDate())
                .severity(this.getSeverity())
                .tags(this.getTags())
                .entitiesAllowedToRespond(this.getEntitiesAllowedToRespond())
                .entitiesRequiredToRespond(this.getEntitiesRequiredToRespond())
                .title(((I18nPublicationData) this.getTitle()).copy())
                .summary(((I18nPublicationData) this.getSummary()).copy())
                .titleTranslated(this.getTitleTranslated())
                .summaryTranslated(this.getSummaryTranslated())
                .publisherType(this.getPublisherType())
                .representative(this.getRepresentative())
                .representativeType(this.getRepresentativeType())
                .wktGeometry(this.wktGeometry)
                .wktProjection(this.wktProjection)
                .secondsBeforeTimeSpanForReminder(this.secondsBeforeTimeSpanForReminder)
                .entityRecipients(this.getEntityRecipients());

        if(this.getTimeSpans()!=null)
            result.timeSpansSet(new HashSet<>(this.getTimeSpans()));
        return result.build();
    }


    public Boolean getKeepChildCards() {
        return keepChildCards;
    }

    public void setKeepChildCards(Boolean keepChildCards) {
        this.keepChildCards = keepChildCards != null ? keepChildCards : false;
    }
}
