/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.opfab.utilities.ObjectUtils;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.validation.annotation.Validated;

import java.time.Instant;
import java.util.*;

@Document(collection = "cards")
@Validated
@SuppressWarnings("java:S1104") // it is just a data object , we choose to have all fields public for simplicity
public class Card {

    public String uid = UUID.randomUUID().toString();
    @Id
    public String id;

    @Indexed
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

    @CreatedDate
    @Indexed
    public Instant publishDate;

    @CreatedDate
    @Indexed
    public Instant lastUpdate;

    public Instant lttd;

    @Indexed
    public Instant startDate;

    @Indexed
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public Instant endDate;

    @Indexed
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public Instant expirationDate;

    public SeverityEnum severity;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    public List<String> tags;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    public List<TimeSpan> timeSpans;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public Object data;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Indexed
    public List<String> userRecipients;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Indexed
    public List<String> groupRecipients;

    public List<String> entitiesAllowedToRespond;

    public List<String> entitiesRequiredToRespond;

    public List<String> entitiesAllowedToEdit;

    @Indexed
    public List<String> entityRecipients;

    public List<String> entityRecipientsForInformation;

    public List<String> externalRecipients;

    @JsonIgnore
    public List<String> usersAcks;

    @JsonIgnore
    public List<String> entitiesAcks;

    @JsonIgnore
    public List<String> usersReads;

    @Indexed
    public String processStateKey;

    public PublisherTypeEnum publisherType = PublisherTypeEnum.EXTERNAL;

    public String representative;
    public PublisherTypeEnum representativeType;

    public String wktGeometry;
    public String wktProjection;

    public Integer secondsBeforeTimeSpanForReminder;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @JsonProperty("rRule")
    public RRule rRule;

    public List<CardActionEnum> actions;

    public void prepare(Instant publishDate) {
        this.publishDate = publishDate;
        this.id = process + "." + processInstanceId;
        this.uid = UUID.randomUUID().toString();
        this.processStateKey = process + "." + state;
        this.entitiesAcks = Collections.emptyList();
    }

    public Card patch(Card other) {
        Card result = new Card();

        result.uid = this.uid;
        result.id = this.id;
        result.parentCardId = this.parentCardId;
        result.initialParentCardUid = this.initialParentCardUid;

        result.publisher = ObjectUtils.getNotNullOrDefault(other.publisher, this.publisher);

        result.processVersion = ObjectUtils.getNotNullOrDefault(other.processVersion,
                this.processVersion);

        result.process = this.process;
        result.processInstanceId = this.processInstanceId;

        result.state = ObjectUtils.getNotNullOrDefault(other.state,
                this.state);
        result.title = ObjectUtils.getNotNullOrDefault(other.title,
                this.title);
        result.summary = ObjectUtils.getNotNullOrDefault(other.summary,
                this.summary);

        result.titleTranslated = ObjectUtils.getNotNullOrDefault(other.titleTranslated,
                this.titleTranslated);
        result.summaryTranslated = ObjectUtils.getNotNullOrDefault(other.summaryTranslated,
                this.summaryTranslated);
        result.publishDate = this.publishDate;
        result.lastUpdate = this.lastUpdate;

        result.lttd = ObjectUtils.getNotNullOrDefault(other.lttd,
                this.lttd);
        result.startDate = ObjectUtils.getNotNullOrDefault(other.startDate, this.startDate);

        result.endDate = ObjectUtils.getNotNullOrDefault(other.endDate, this.endDate);
        result.expirationDate = ObjectUtils.getNotNullOrDefault(other.expirationDate,
                this.expirationDate);
        result.severity = ObjectUtils.getNotNullOrDefault(other.severity, this.severity);
        result.tags = ObjectUtils.getNotNullOrDefault(other.tags,
                this.tags, ArrayList::new);
        result.timeSpans = ObjectUtils.getNotNullOrDefault(other.timeSpans,
                this.timeSpans, ArrayList::new);

        result.data = ObjectUtils.getNotNullOrDefault(other.data, this.data);

        result.userRecipients = ObjectUtils.getNotNullOrDefault(other.userRecipients,
                this.userRecipients, ArrayList::new);

        result.groupRecipients = ObjectUtils.getNotNullOrDefault(other.groupRecipients,
                this.groupRecipients, ArrayList::new);

        result.entitiesAllowedToRespond = ObjectUtils.getNotNullOrDefault(other.entitiesAllowedToRespond,
                this.entitiesAllowedToRespond, ArrayList::new);

        result.entitiesRequiredToRespond = ObjectUtils.getNotNullOrDefault(other.entitiesRequiredToRespond,
                this.entitiesRequiredToRespond, ArrayList::new);

        result.entitiesAllowedToEdit = ObjectUtils.getNotNullOrDefault(other.entitiesAllowedToEdit,
                this.entitiesAllowedToEdit, ArrayList::new);

        result.entityRecipients = ObjectUtils.getNotNullOrDefault(other.entityRecipients,
                this.entityRecipients, ArrayList::new);

        result.entityRecipientsForInformation = ObjectUtils.getNotNullOrDefault(other.entityRecipientsForInformation,
                this.entityRecipientsForInformation, ArrayList::new);

        result.externalRecipients = ObjectUtils.getNotNullOrDefault(other.externalRecipients,
                this.externalRecipients, ArrayList::new);

        result.usersAcks = this.usersAcks;
        result.entitiesAcks = this.entitiesAcks;
        result.usersReads = this.usersReads;
        result.processStateKey = result.process + "." + result.state;

        result.publisherType = ObjectUtils.getNotNullOrDefault(other.publisherType, this.publisherType);
        result.representative = ObjectUtils.getNotNullOrDefault(other.representative, this.representative);
        result.representativeType = ObjectUtils.getNotNullOrDefault(other.representativeType,
                this.representativeType);
        result.wktGeometry = ObjectUtils.getNotNullOrDefault(other.wktGeometry, this.wktGeometry);
        result.wktProjection = ObjectUtils.getNotNullOrDefault(other.wktProjection, this.wktProjection);
        result.secondsBeforeTimeSpanForReminder = ObjectUtils.getNotNullOrDefault(
                other.secondsBeforeTimeSpanForReminder,
                this.secondsBeforeTimeSpanForReminder);
        result.rRule = ObjectUtils.getNotNullOrDefault(other.rRule, this.rRule);
        result.actions = ObjectUtils.getNotNullOrDefault(other.actions, this.actions);

        return result;
    }

}
