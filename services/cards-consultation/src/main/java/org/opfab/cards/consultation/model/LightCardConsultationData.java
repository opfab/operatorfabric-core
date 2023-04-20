/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
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
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.opfab.cards.model.SeverityEnum;
import org.springframework.data.annotation.Transient;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>Light Card Model, documented at {@link LightCard}</p>
 * <p>
 * {@inheritDoc}
 *
 *
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LightCardConsultationData implements LightCard {

    private String uid;
    private String id;
    private String publisher;
    private String processVersion;
    private String process;
    private String processInstanceId;
    private String state;
    private Instant lttd;
    private Instant publishDate;
    private Instant startDate;
    private Instant endDate;
    private Instant expirationDate;
    private SeverityEnum severity;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Singular
    private List<String> tags;

    private I18n title;
    private I18n summary;

    private String titleTranslated;
    private String summaryTranslated;
    
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    @Singular("timeSpan")
    private Set<TimeSpan> timeSpansSet;
    
    @JsonIgnore
    private List<String> usersAcks;

    @Transient
    private Boolean hasBeenAcknowledged;

    private List<String> entitiesAcks;
    private List<String> entityRecipients;
    private List<String> entityRecipientsForInformation;
    private List<String> userRecipients;
    private List<String> groupRecipients;

    @Transient
    private Boolean hasBeenRead;

    private String parentCardId;

    private String initialParentCardUid;

    private List<String> entitiesAllowedToRespond;
    private List<String> entitiesRequiredToRespond;
    private List<String> entitiesAllowedToEdit;
    private PublisherTypeEnum publisherType;

    private String representative;
    private PublisherTypeEnum representativeType;

    private String wktGeometry;
    private String wktProjection;

    private Integer  secondsBeforeTimeSpanForReminder;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private RRule rRule;

    /**
     * @return timespans, may return null
     */
    @JsonProperty("timeSpans")
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Override
    public List<TimeSpan> getTimeSpans() {
        if (this.timeSpansSet != null)
            return new ArrayList<>(this.timeSpansSet);
        return null;
    }

    @Override
    public void setTimeSpans(List<TimeSpan> timeSpans) {
        if (timeSpans != null)
            this.timeSpansSet = new HashSet<>(timeSpans);

    }

    public static LightCardConsultationData copy(Card other) {
        LightCardConsultationDataBuilder builder = builder()
                .uid(other.getUid())
                .id(other.getId())
                .parentCardId(other.getParentCardId())
                .initialParentCardUid(other.getInitialParentCardUid())
                .publisher(other.getPublisher())
                .process(other.getProcess())
                .processVersion(other.getProcessVersion())
                .state(other.getState())
                .processInstanceId(other.getProcessInstanceId())
                .lttd(other.getLttd())
                .startDate(other.getStartDate())
                .publishDate(other.getPublishDate())
                .endDate(other.getEndDate())
                .expirationDate(other.getExpirationDate())
                .severity(other.getSeverity())
                .title(I18nConsultationData.copy(other.getTitle()))
                .summary(I18nConsultationData.copy(other.getSummary()))
                .titleTranslated(other.getTitleTranslated())
                .summaryTranslated(other.getSummaryTranslated())
                .hasBeenAcknowledged(other.getHasBeenAcknowledged())
                .hasBeenRead(other.getHasBeenRead())
                .publisherType(other.getPublisherType())
                .representative(other.getRepresentative())
                .representativeType(other.getRepresentativeType())
                .wktGeometry(other.getWktGeometry())
                .wktProjection(other.getWktProjection())
                .secondsBeforeTimeSpanForReminder(other.getSecondsBeforeTimeSpanForReminder())
                .rRule(other.getRRule());

        if (other.getTags() != null && ! other.getTags().isEmpty())
            builder.tags(other.getTags());
        if (other.getTimeSpans() != null && !other.getTimeSpans().isEmpty())
            builder.timeSpansSet(new HashSet<>(other.getTimeSpans()));
        if (other.getEntitiesAllowedToRespond() != null && ! other.getEntitiesAllowedToRespond().isEmpty())
            builder.entitiesAllowedToRespond(other.getEntitiesAllowedToRespond());
        if (other.getEntitiesRequiredToRespond() != null && ! other.getEntitiesRequiredToRespond().isEmpty())
            builder.entitiesRequiredToRespond(other.getEntitiesRequiredToRespond());

        if (other.getEntitiesAcks() != null && ! other.getEntitiesAcks().isEmpty())
            builder.entitiesAcks(other.getEntitiesAcks());
        if (other.getEntityRecipients() != null && ! other.getEntityRecipients().isEmpty())
            builder.entityRecipients(other.getEntityRecipients());
        if (other.getEntityRecipientsForInformation() != null && !other.getEntityRecipientsForInformation().isEmpty())
            builder.entityRecipientsForInformation(other.getEntityRecipientsForInformation());
        if (other.getGroupRecipients() != null && !other.getGroupRecipients().isEmpty())
            builder.groupRecipients(other.getGroupRecipients());
        if (other.getUserRecipients() != null && !other.getUserRecipients().isEmpty()) {
            builder.userRecipients(other.getUserRecipients());            
        }

        return builder.build();

    }
}
