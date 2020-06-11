/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.consultation.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.springframework.data.annotation.Transient;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Singular;

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
    private String publisherVersion;
    private String process;
    private String processId;
    private String state;
    private Instant lttd;
    private Instant publishDate;
    private Instant startDate;
    private Instant endDate;
    private SeverityEnum severity;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Singular
    private List<String> tags;
    private I18n title;
    private I18n summary;
    
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    @Singular("timeSpan")
    private Set<TimeSpan> timeSpansSet;
    
    @JsonIgnore
    private List<String> usersAcks;
    @Transient
    private Boolean hasBeenAcknowledged;

    /**
     * return timespans, may return null
     * @return
     */
    @JsonProperty("timeSpans")
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Override
    public List<TimeSpan> getTimeSpans() {
        if(this.timeSpansSet!=null)
            return new ArrayList<>(this.timeSpansSet);
        return null;
    }

    @Override
    public void setTimeSpans(List<? extends TimeSpan> timeSpans) {
        if(timeSpans != null)
            this.timeSpansSet = new HashSet<>(timeSpans);

    }

    public static LightCardConsultationData copy(Card other) {
        LightCardConsultationDataBuilder builder = builder()
                .uid(other.getUid())
                .id(other.getId())
                .process(other.getProcess())
                .state(other.getState())
                .processId(other.getProcessId())
                .lttd(other.getLttd())
                .startDate(other.getStartDate())
                .publishDate(other.getPublishDate())
                .endDate(other.getEndDate())
                .severity(other.getSeverity())
                .title(I18nConsultationData.copy(other.getTitle()))
                .summary(I18nConsultationData.copy(other.getSummary()))
                .hasBeenAcknowledged(false);
        if(other.getTags()!=null && ! other.getTags().isEmpty())
            builder.tags(other.getTags());
        if(other.getTimeSpans()!=null && !other.getTimeSpans().isEmpty())
            builder.timeSpansSet(new HashSet<>(other.getTimeSpans()));
        return builder.build();

    }
}
