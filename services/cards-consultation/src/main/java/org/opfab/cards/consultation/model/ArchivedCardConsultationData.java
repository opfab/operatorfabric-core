/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.consultation.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.opfab.cards.model.SeverityEnum;
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
 *
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

    private String titleTranslated;
    private String summaryTranslated;
    
    @CreatedDate
    private Instant publishDate;
    private Instant lttd;

    private Instant startDate;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Instant endDate;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String media;
    private SeverityEnum severity;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Singular
    private List<String> tags;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Object data;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Singular
    private List<String> userRecipients;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Singular
    private List<String> groupRecipients;
    @Singular
    private List<String> entityRecipients;
    @Singular("entityAllowedToRespond")
    private List<String> entitiesAllowedToRespond;
    @Singular("entityRequiredToRespond")
    private List<String> entitiesRequiredToRespond;
    @Singular("entitiesAllowedToEdit")
    private List<String> entitiesAllowedToEdit;
    @Singular
    private List<String> externalRecipients;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<TimeSpan> timeSpans;
    
    @JsonIgnore
    @Transient
    private Boolean hasBeenAcknowledged;
    @JsonIgnore
    @Transient
    private Boolean hasBeenRead;
    private PublisherTypeEnum publisherType;
    private String  representative;
    private PublisherTypeEnum representativeType;
    private Integer  secondsBeforeTimeSpanForReminder;

    private String processStateKey;

    private Boolean toNotify;
}
