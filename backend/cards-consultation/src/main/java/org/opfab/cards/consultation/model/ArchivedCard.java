/* Copyright (c) 2018-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import tools.jackson.databind.annotation.JsonDeserialize;
import tools.jackson.databind.annotation.JsonSerialize;

import org.opfab.json.InstantDeserializer;
import org.opfab.json.InstantSerializer;
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
    @JsonDeserialize(using = InstantDeserializer.class)
    @JsonSerialize(using = InstantSerializer.class)
    public Instant publishDate;

    @JsonDeserialize(using = InstantDeserializer.class)
    @JsonSerialize(using = InstantSerializer.class)
    public Instant lttd;

    @JsonDeserialize(using = InstantDeserializer.class)
    @JsonSerialize(using = InstantSerializer.class)
    public Instant startDate;

    @JsonDeserialize(using = InstantDeserializer.class)
    @JsonSerialize(using = InstantSerializer.class)
    public Instant endDate;

    @JsonDeserialize(using = InstantDeserializer.class)
    @JsonSerialize(using = InstantSerializer.class)
    public Instant expirationDate;

    public String media;

    public SeverityEnum severity;

    public List<String> tags;

    public Object data;

    public List<String> userRecipients;

    public List<String> groupRecipients;

    public List<String> entityRecipients;

    public List<String> entityRecipientsForInformation;

    public List<String> entitiesAllowedToRespond;

    public List<String> entitiesRequiredToRespond;

    public List<String> entitiesAllowedToEdit;

    public List<String> externalRecipients;

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
    public RRule rRule;

    public List<CardActionEnum> actions;
}
