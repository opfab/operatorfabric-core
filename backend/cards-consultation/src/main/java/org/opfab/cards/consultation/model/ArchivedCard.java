/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "archivedCards")
@SuppressWarnings("java:S1104") // it is just a data object , we choose to have all fields public for simplicity
public class ArchivedCard {
    public String uid;

    @Id
    public String id;

    public String parentCardId;
    public String initialParentCardUid;
    public String publisher;
    public String processVersion;
    public String process;
    public String processInstanceId;
    public String state;
    public I18n title;
    public I18n summary;

    @Indexed
    public String titleTranslated;

    @Indexed
    public String summaryTranslated;

    @CreatedDate
    public Instant publishDate;

    public Instant lttd;
    public Instant startDate;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public Instant endDate;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public Instant expirationDate;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public String media;

    public SeverityEnum severity;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    public List<String> tags;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public Object data;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    public List<String> userRecipients;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    public List<String> groupRecipients;

    public List<String> entityRecipients;

    public List<String> entityRecipientsForInformation;

    public List<String> entitiesAllowedToRespond;

    public List<String> entitiesRequiredToRespond;

    public List<String> entitiesAllowedToEdit;

    public List<String> externalRecipients;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    public List<TimeSpan> timeSpans;

    public PublisherTypeEnum publisherType;
    public String representative;
    public PublisherTypeEnum representativeType;
    public String wktGeometry;
    public String wktProjection;
    public Integer secondsBeforeTimeSpanForReminder;
    public String processStateKey;

    @Indexed
    public Instant deletionDate;

    @JsonProperty("rRule")
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    public RRule rRule;

    public List<CardActionEnum> actions;
}
