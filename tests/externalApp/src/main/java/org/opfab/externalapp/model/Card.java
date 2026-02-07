/* Copyright (c) 2018-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externalapp.model;

import java.time.Instant;
import java.util.*;

import tools.jackson.databind.annotation.JsonDeserialize;
import tools.jackson.databind.annotation.JsonSerialize;

import org.opfab.externalapp.config.InstantDeserializer;
import org.opfab.externalapp.config.InstantSerializer;

@SuppressWarnings("java:S1104") // it is just a data object , we choose to have all fields public for simplicity
public class Card {

    public String uid = UUID.randomUUID().toString();
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

    public String titleTranslated;

    public String summaryTranslated;

    @JsonDeserialize(using = InstantDeserializer.class)
    @JsonSerialize(using = InstantSerializer.class)
    public Instant publishDate;

    @JsonDeserialize(using = InstantDeserializer.class)
    @JsonSerialize(using = InstantSerializer.class)
    public Instant lastUpdate;

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

    public SeverityEnum severity;

    public List<String> tags;

    public List<TimeSpan> timeSpans;

    public Object data;

    public List<String> userRecipients;

    public List<String> groupRecipients;

    public List<String> entitiesAllowedToRespond;

    public List<String> entitiesRequiredToRespond;

    public List<String> entitiesAllowedToEdit;

    public List<String> entityRecipients;

    public List<String> entityRecipientsForInformation;

    public List<String> externalRecipients;

    public List<String> usersAcks;

    public List<String> entitiesAcks;

    public List<String> usersReads;

    public String processStateKey;

    public PublisherTypeEnum publisherType = PublisherTypeEnum.EXTERNAL;

    public String representative;
    public PublisherTypeEnum representativeType;

    public String wktGeometry;
    public String wktProjection;

    public Integer secondsBeforeTimeSpanForReminder;

    public RRule rRule;

    public List<CardActionEnum> actions;

}
