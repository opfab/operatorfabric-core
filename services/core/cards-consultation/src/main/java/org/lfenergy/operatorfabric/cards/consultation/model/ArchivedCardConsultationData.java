/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.consultation.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>Archived Card Model, documented at {@link Card}</p>
 *
 * {@inheritDoc}
 *
 * @author David Binder
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "archivedCards")
public class ArchivedCardConsultationData implements Card {

    private String uid;
    @Id
    private String id;
    private String publisher;
    private String publisherVersion;
    private String process;
    private String processId;
    private String state;
    private I18n title;
    private I18n summary;
    @CreatedDate
    private Instant publishDate;
    @Transient
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Instant deletionDate;
    private Instant lttd;
    @Indexed
    private Instant startDate;
    @Indexed
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Instant endDate;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String media;
    private SeverityEnum severity;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Singular
    private List<String> tags;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Singular
    private List<? extends Detail> details;
    @JsonIgnore
    private Recipient recipient;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Object data;
    @Indexed
    private int shardKey;
    private String mainRecipient;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Singular
    private List<String> userRecipients;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Singular
    private List<String> groupRecipients;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Singular
    private List<? extends TimeSpan> timeSpans;
}
