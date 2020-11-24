/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.publication.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;

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
@CompoundIndex(name = "process_state", def = "{'process' : 1, 'state' : 1}")
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

    @CreatedDate
    private Instant publishDate;
    private Instant lttd;
    
    @Indexed
    private Instant startDate;
    @Indexed
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Instant endDate;
    
    private SeverityEnum severity;
    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> tags;
    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<? extends TimeSpan> timeSpans;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private Recipient recipient;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Object data;
    @Indexed
    private int shardKey;
    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> userRecipients;
    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> groupRecipients;
    @Singular("entitiesAllowedToRespond")
    @Indexed
    private List<String> entitiesAllowedToRespond;
    @Singular
    @Indexed
    private List<String> entityRecipients;
    @Singular
    @Indexed
    private List<String> externalRecipients;
    @JsonIgnore
    private List<String> usersAcks;
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

    private Integer  secondsBeforeTimeSpanForReminder;

    public void prepare(Instant publishDate) {
        this.publishDate = publishDate;
        this.id = process + "." + processInstanceId;
        if (null == this.uid)
        	this.uid = UUID.randomUUID().toString();
        this.setShardKey(Math.toIntExact(this.getStartDate().toEpochMilli() % 24 * 1000));
        this.processStateKey = process + "." + state;
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
                .publishDate(this.getPublishDate())
                .severity(this.getSeverity())
                .tags(this.getTags())
                .entitiesAllowedToRespond(this.getEntitiesAllowedToRespond())
                .title(((I18nPublicationData) this.getTitle()).copy())
                .summary(((I18nPublicationData) this.getSummary()).copy())
                .publisherType(this.getPublisherType())
                .secondsBeforeTimeSpanForReminder(this.secondsBeforeTimeSpanForReminder);
                ;
        if(this.getTimeSpans()!=null)
            result.timeSpansSet(new HashSet<>(this.getTimeSpans()));
        return result.build();
    }
}
