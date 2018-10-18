/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.lfenergy.operatorfabric.utilities.SimulatedTime;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.NotNull;
import java.util.*;

@Data
@Document(collection = "cards")
@NoArgsConstructor
public class CardData implements Card {

    private String uid ;
    private String id;
    private String publisher;
    private String publisherVersion;
    private String processId;
    private I18n title;
    private I18n summary;
    private Long publishDate;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Long deletionDate;
    private Long lttd;
    @Indexed
    private Long startDate;
    @Indexed
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Long endDate;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String media;
    private SeverityEnum severity;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> tags = new ArrayList<>();
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private Map<String,? extends Action> actions = new HashMap<>();
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<? extends Detail> details = new ArrayList<>();
    private Recipient recipient;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Object data;
    @Indexed
    private int shardKey;
    private String mainRecipient;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> userRecipients = new ArrayList<>();
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> groupRecipients = new ArrayList<>();
    @Transient @JsonIgnore
    private List<String> orphanedUsers = new ArrayList<>();

    public void prepare(){
        this.publishDate = SimulatedTime.getInstance().computeNow().toEpochMilli();
        this.id = publisher+"_"+processId;
        this.setShardKey(Long.valueOf(this.getStartDate()%24*1000).intValue());
    }
}
