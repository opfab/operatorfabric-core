/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.publication.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.NotNull;
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
    @NotNull
    private String publisher;
    private String publisherVersion;
    private String process;
    @NotNull
    private String processId;
    private String state;
    private I18n title;
    private I18n summary;
    @CreatedDate
    private Instant publishDate;
    @Transient
    private Instant deletionDate;
    private Instant lttd;
    @NotNull
    @Indexed
    private Instant startDate;
    @Indexed
    private Instant endDate;
    private SeverityEnum severity;
    private List<String> tags;
    private List<? extends Detail> details;
    private Recipient recipient;
    private Object data;
    @Indexed
    private int shardKey;
    private List<String> userRecipients;
    private List<String> groupRecipients;
    @Transient
    private List<? extends TimeSpan> timeSpans;
    @Indexed
    private List<String> entityRecipients;

    public ArchivedCardPublicationData(CardPublicationData card){
        this.id = card.getUid();
        this.publisher = card.getPublisher();
        this.publisherVersion = card.getPublisherVersion();
        this.publishDate = card.getPublishDate();
        this.process = card.getProcess();
        this.processId = card.getProcessId();
        this.state = card.getState();
        this.startDate = card.getStartDate();
        this.shardKey = card.getShardKey();
        this.endDate = card.getEndDate();
        this.lttd = card.getLttd();
        this.title = card.getTitle();
        this.summary = card.getSummary();
        this.details = card.getDetails() == null ? null : new ArrayList<>(card.getDetails());
        this.tags = card.getTags() == null ? null : new ArrayList<>(card.getTags());
        this.recipient = card.getRecipient();
        this.severity = card.getSeverity();
        this.data = card.getData();
        this.userRecipients = card.getUserRecipients() == null ? null : new ArrayList<>(card.getUserRecipients());
        this.groupRecipients = card.getGroupRecipients() == null ? null : new ArrayList<>(card.getGroupRecipients());
        this.entityRecipients = card.getEntityRecipients() == null ? null : new ArrayList<>(card.getEntityRecipients());
    }

}
