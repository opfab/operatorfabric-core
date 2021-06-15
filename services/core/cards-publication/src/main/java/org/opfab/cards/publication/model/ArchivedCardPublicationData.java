/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.publication.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;
import org.opfab.cards.model.SeverityEnum;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * <p>Archived Card Model, documented at {@link Card}</p>
 *
 * {@inheritDoc}
 *
 *
 */
@Data
@NoArgsConstructor
@Document(collection = "archivedCards")
public class ArchivedCardPublicationData implements Card {

    private String uid;
    @Id
    private String id;
    private String parentCardId;
    private String initialParentCardUid;
    private Boolean keepChildCards = false;
    private String publisher;
    private String processVersion;

    @Indexed
    private String process;
    
    private String processInstanceId;
    
    @Indexed
    private String state;
    private I18n title;
    private I18n summary;

    @CreatedDate
    @Indexed
    private Instant publishDate;
    private Instant lttd;

    
    @Indexed
    private Instant startDate;
    @Indexed
    private Instant endDate;
    private SeverityEnum severity;
    @Indexed
    private List<String> tags;
    private Object data;

    @Indexed
    private List<String> userRecipients;
    
    @Indexed
    private List<String> groupRecipients;
    
    @Transient
    private List<TimeSpan> timeSpans;
    
    @Indexed
    private List<String> entityRecipients;
    
    private List<String> externalRecipients;
    
    @Singular("entityAllowedToRespond")
    private List<String> entitiesAllowedToRespond;
    
    @Singular("entitiyRequiredToRespond")
    private List<String> entitiesRequiredToRespond;


    @Transient
    private Boolean hasBeenAcknowledged;
    @Transient
    private Boolean hasBeenRead;
    @Indexed
    private String processStateKey;

    private PublisherTypeEnum publisherType;

    private String  representative;
    private PublisherTypeEnum representativeType;

    private Integer  secondsBeforeTimeSpanForReminder;

    public ArchivedCardPublicationData(CardPublicationData card){
        this.id = card.getUid();
        this.parentCardId = card.getParentCardId();
        this.initialParentCardUid = card.getInitialParentCardUid();
        this.keepChildCards = card.getKeepChildCards();
        this.publisher = card.getPublisher();
        this.processVersion = card.getProcessVersion();
        this.publishDate = card.getPublishDate();
        this.process = card.getProcess();
        this.processInstanceId = card.getProcessInstanceId();
        this.state = card.getState();
        this.startDate = card.getStartDate();
        this.endDate = card.getEndDate();
        this.lttd = card.getLttd();
        this.title = card.getTitle();
        this.summary = card.getSummary();
        this.tags = card.getTags() == null ? null : new ArrayList<>(card.getTags());
        this.severity = card.getSeverity();
        this.data = card.getData();
        this.userRecipients = card.getUserRecipients() == null ? null : new ArrayList<>(card.getUserRecipients());
        this.groupRecipients = card.getGroupRecipients() == null ? null : new ArrayList<>(card.getGroupRecipients());
        this.entityRecipients = card.getEntityRecipients() == null ? null : new ArrayList<>(card.getEntityRecipients());
        this.externalRecipients = card.getExternalRecipients() == null ? null : new ArrayList<>(card.getExternalRecipients());
        this.entitiesAllowedToRespond = card.getEntitiesAllowedToRespond() == null ? null : new ArrayList<>(card.getEntitiesAllowedToRespond());
        this.entitiesRequiredToRespond = card.getEntitiesRequiredToRespond() == null ? null : new ArrayList<>(card.getEntitiesRequiredToRespond());
        this.processStateKey = process + "." + state;
        this.publisherType = card.getPublisherType();
        this.representative = card.getRepresentative();
        this.representativeType = card.getRepresentativeType();
        this.secondsBeforeTimeSpanForReminder = card.getSecondsBeforeTimeSpanForReminder();
    }

}
