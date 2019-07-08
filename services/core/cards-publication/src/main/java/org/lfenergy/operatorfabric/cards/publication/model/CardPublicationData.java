/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.publication.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.NotNull;
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
 * @author David Binder
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
    @NotNull
    private String publisher;
    @NotNull
    private String publisherVersion;
    private String process;
    @NotNull
    private String processId;
    private String state;
    @NotNull
    private I18n title;
    @NotNull
    private I18n summary;
    @CreatedDate
    private Instant publishDate;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Instant deletionDate;
    private Instant lttd;
    @NotNull
    @Indexed
    private Instant startDate;
    @Indexed
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Instant endDate;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String media;
    @NotNull
    private SeverityEnum severity;
    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> tags;
    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<? extends TimeSpan> timeSpans;
    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<? extends Detail> details;
    @NotNull
    private Recipient recipient;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Object data;
    @Indexed
    private int shardKey;
    private String mainRecipient;
    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> userRecipients;
    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> groupRecipients;
    @Singular
    @JsonIgnore
    private List<String> orphanedUsers;

    public void prepare(Instant publishDate) {
        this.publishDate = publishDate;
        this.id = publisher + "_" + processId;
        this.setShardKey(Math.toIntExact(this.getStartDate().toEpochMilli() % 24 * 1000));
        if(this.getTimeSpans()!=null)
            for(TimeSpan ts:this.getTimeSpans())
                ((TimeSpanPublicationData)ts).init();
    }

    public LightCardPublicationData toLightCard() {
        LightCardPublicationData.LightCardPublicationDataBuilder result = LightCardPublicationData.builder()
                .id(this.getId())
                .uid(this.getUid())
                .publisher(this.getPublisher())
                .publisherVersion(this.getPublisherVersion())
                .process(this.getProcess())
                .processId(this.getProcessId())
                .state(this.getState())
                .lttd(this.getLttd())
                .startDate(this.getStartDate())
                .endDate(this.getEndDate())
                .publishDate(this.getPublishDate())
                .severity(this.getSeverity())
                .media(this.getMedia())
                .tags(this.getTags())
                .mainRecipient(this.getMainRecipient())
                .title(((I18nPublicationData) this.getTitle()).copy())
                .summary(((I18nPublicationData) this.getSummary()).copy());;
        if(this.getTimeSpans()!=null)
            result.timeSpansSet(new HashSet(this.getTimeSpans()));
        return result.build();
    }
}
