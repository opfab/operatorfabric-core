/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
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
import java.util.function.Function;

import  org.opfab.utilities.ObjectUtils;

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
    @Indexed
    private String titleTranslated;
    @Indexed
    private String summaryTranslated;

    @CreatedDate
    @Indexed
    private Instant publishDate;
    private Instant lttd;

    @Indexed
    private Instant startDate;
    @Indexed
    private Instant endDate;
    @Indexed
    private Instant expirationDate;
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

    @Singular("entityRequiredToRespond")
    private List<String> entitiesRequiredToRespond;

    @Singular("entityAllowedToEdit")
    private List<String> entitiesAllowedToEdit;

    @Transient
    private Boolean hasBeenAcknowledged;
    @Transient
    private Boolean hasBeenRead;
    @Indexed
    private String processStateKey;

    private PublisherTypeEnum publisherType;

    private String representative;
    private PublisherTypeEnum representativeType;

    private String wktGeometry;

    private String wktProjection;

    private Integer secondsBeforeTimeSpanForReminder;

    private Boolean toNotify;

    @Indexed
    private Instant deletionDate;

    private List<String> entitiesAcks;

    public Instant getDeletionDate() {
        return this.deletionDate;
    }

    public void setDeletionDate(Instant deletionDate) {
        this.deletionDate = deletionDate;
    }

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
        this.expirationDate = card.getExpirationDate();
        this.lttd = card.getLttd();
        this.title = card.getTitle();
        this.summary = card.getSummary();
        this.titleTranslated = card.getTitleTranslated();
        this.summaryTranslated = card.getSummaryTranslated();
        this.tags = card.getTags() == null ? null : new ArrayList<>(card.getTags());
        this.severity = card.getSeverity();
        this.data = card.getData();

        this.userRecipients = ObjectUtils.getNotNullOrDefault(card.getUserRecipients(), null, ArrayList::new);
        this.groupRecipients = ObjectUtils.getNotNullOrDefault(card.getGroupRecipients(), null, ArrayList::new);
        this.entityRecipients = ObjectUtils.getNotNullOrDefault(card.getEntityRecipients(), null, ArrayList::new);
        this.externalRecipients = ObjectUtils.getNotNullOrDefault(card.getExternalRecipients(), null, ArrayList::new);
        this.entitiesAllowedToRespond = ObjectUtils.getNotNullOrDefault(card.getEntitiesAllowedToRespond(), null, ArrayList::new);
        this.entitiesRequiredToRespond = ObjectUtils.getNotNullOrDefault(card.getEntitiesRequiredToRespond(), null, ArrayList::new);
        this.entitiesAllowedToEdit = ObjectUtils.getNotNullOrDefault(card.getEntitiesAllowedToEdit(), null, ArrayList::new);

        this.processStateKey = process + "." + state;
        this.publisherType = card.getPublisherType();
        this.representative = card.getRepresentative();
        this.representativeType = card.getRepresentativeType();
        this.wktGeometry = card.getWktGeometry();
        this.wktProjection = card.getWktProjection();
        this.secondsBeforeTimeSpanForReminder = card.getSecondsBeforeTimeSpanForReminder();
        this.toNotify = card.getToNotify();
    }

}
