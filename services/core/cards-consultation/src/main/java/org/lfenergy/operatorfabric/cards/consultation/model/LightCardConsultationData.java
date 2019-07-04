/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.springframework.data.mongodb.core.index.Indexed;

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
 * @author David Binder
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
    @Indexed
    private Instant startDate;
    @Indexed
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Instant endDate;
    private SeverityEnum severity;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String media;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Singular
    private List<String> tags;
    private I18n title;
    private I18n summary;
    private String mainRecipient;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Singular("timeSpan")
    private Set<TimeSpanConsultationData> timeSpansSet;

    @JsonProperty("timeSpans")
    @Override
    public List<TimeSpan> getTimeSpans() {
        if(this.timeSpansSet!=null)
            return new ArrayList<>(this.timeSpansSet);
        return null;
    }

    @Override
    public void setTimeSpans(List<? extends TimeSpan> timeSpans) {
        if(timeSpans != null)
            this.timeSpansSet = new HashSet(timeSpans);

    }

    public static LightCardConsultationData copy(Card other) {
        LightCardConsultationDataBuilder builder = builder()
                .uid(other.getUid())
                .id(other.getId())
                .processId(other.getProcessId())
                .lttd(other.getLttd())
                .startDate(other.getStartDate())
                .publishDate(other.getPublishDate())
                .endDate(other.getEndDate())
                .severity(other.getSeverity())
                .media(other.getMedia())
                .title(I18nConsultationData.copy(other.getTitle()))
                .summary(I18nConsultationData.copy(other.getSummary()))
                ;
        if(other.getTags()!=null && ! other.getTags().isEmpty())
            builder.tags(other.getTags());
        if(other.getTimeSpans()!=null && !other.getTimeSpans().isEmpty())
            builder.timeSpansSet(new HashSet(other.getTimeSpans()));
        return builder.build();

    }
}
