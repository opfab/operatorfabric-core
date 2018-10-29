/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@Document(collection = "archivedCards")
public class ArchivedCardPublicationData implements Card {

    @Id
    private String id;
    @NotNull
    private String publisher;
    private String publisherVersion;
    @NotNull
    private String processId;
    private I18n title;
    private I18n summary;
    @CreatedDate
    private Long publishDate;
    @Transient
    private Long deletionDate;
    private Long lttd;
    @NotNull
    @Indexed
    private Long startDate;
    @Indexed
    private Long endDate;
    private String media;
    private SeverityEnum severity;
    private List<String> tags;
    @Transient
    private Map<String,? extends Action> actions;
    private List<? extends Detail> details;
    private Recipient recipient;
    private Object data;
    @Indexed
    private int shardKey;
    private String mainRecipient;
    private List<String> userRecipients;
    private List<String> groupRecipients;

    public ArchivedCardPublicationData(CardPublicationData card){
        this.id = card.getUid();
        this.publisher = card.getPublisher();
        this.publisherVersion = card.getPublisherVersion();
        this.publishDate = card.getPublishDate();
        this.processId = card.getProcessId();
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
        this.mainRecipient = card.getMainRecipient();
        this.userRecipients = card.getUserRecipients() == null ? null : new ArrayList<>(card.getUserRecipients());
        this.groupRecipients = card.getGroupRecipients() == null ? null : new ArrayList<>(card.getGroupRecipients());
        this.media = card.getMedia();
    }

}
