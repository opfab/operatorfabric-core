/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.publication.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.lfenergy.operatorfabric.cards.model.*;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.NotNull;
import java.util.*;

@Data
@Document(collection = "cards")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CardPublicationData implements Card {

    @Builder.Default private String uid = UUID.randomUUID().toString();
    private String id;
    @NotNull
    private String publisher;
    @NotNull
    private String publisherVersion;
    @NotNull
    private String processId;
    @NotNull
    private I18n title;
    @NotNull
    private I18n summary;
    private Long publishDate;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Long deletionDate;
    private Long lttd;
    @NotNull
    @Indexed
    private Long startDate;
    @Indexed
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Long endDate;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String media;
    @NotNull
    private SeverityEnum severity;
    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> tags = new ArrayList<>();
    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private Map<String,? extends Action> actions = new HashMap<>();
    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<? extends Detail> details = new ArrayList<>();
    @NotNull
    private Recipient recipient;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Object data;
    @Indexed
    private int shardKey;
    private String mainRecipient;
    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> userRecipients = new ArrayList<>();
    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> groupRecipients = new ArrayList<>();
    @Singular @Transient @JsonIgnore
    private List<String> orphanedUsers = new ArrayList<>();

    public void prepare(Long publishDate){
        this.publishDate = publishDate;
        this.id = publisher+"_"+processId;
        this.setShardKey(Math.toIntExact(this.getStartDate()%24*1000));
    }

    public LightCardPublicationData toLightCard(){
        return LightCardPublicationData.builder()
           .id(this.getId())
           .uid(this.getUid())
           .processId(this.getProcessId())
           .lttd(this.getLttd())
           .startDate(this.getStartDate())
           .endDate(this.getEndDate())
           .severity(this.getSeverity())
           .media(this.getMedia())
           .tags(this.getTags())
           .mainRecipient(this.getMainRecipient())
           .title(((I18nPublicationData)this.getTitle()).copy())
           .summary(((I18nPublicationData)this.getSummary()).copy())
           .build();
    }
}
