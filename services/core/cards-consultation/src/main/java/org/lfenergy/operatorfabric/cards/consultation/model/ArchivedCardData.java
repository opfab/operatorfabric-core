/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.consultation.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.lfenergy.operatorfabric.cards.model.*;
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
public class ArchivedCardData implements Card {

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
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Long deletionDate;
    private Long lttd;
    @Indexed
    private Long startDate;
    @Indexed
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Long endDate;
    @JsonIgnore
    private String media;
    private SeverityEnum severity;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> tags;
    @Transient
    @JsonIgnore
    private Map<String,? extends Action> actions;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<? extends Detail> details;
    @JsonIgnore
    private Recipient recipient;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Object data;
    @Indexed
    private int shardKey;
    private String mainRecipient;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> userRecipients;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> groupRecipients;

    public ArchivedCardData(CardData card){
        this.setId(card.getUid());
        this.setPublisher(card.getPublisher());
        this.setPublisherVersion(card.getPublisherVersion());
        this.setPublishDate(card.getPublishDate());
        this.setProcessId(card.getProcessId());
        this.setStartDate(card.getStartDate());
        this.setShardKey(card.getShardKey());
        this.setEndDate(card.getEndDate());
        this.setLttd(card.getLttd());
        this.setTitle(card.getTitle());
        this.setSummary(card.getSummary());
        this.setDetails(new ArrayList<>(card.getDetails()));
        this.setTags(new ArrayList<>(card.getTags()));
        this.setRecipient(card.getRecipient());
        this.setSeverity(card.getSeverity());
        this.setData(card.getData());
        this.setMainRecipient(card.getMainRecipient());
        this.setUserRecipients(new ArrayList<>(card.getUserRecipients()));
        this.setGroupRecipients(new ArrayList<>(card.getGroupRecipients()));
        this.setMedia(card.getMedia());
    }

}
