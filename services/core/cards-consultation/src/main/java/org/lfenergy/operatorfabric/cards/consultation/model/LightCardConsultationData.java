/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.springframework.data.mongodb.core.index.Indexed;

import java.util.List;

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
    private Long lttd;
    @Indexed
    private Long startDate;
    @Indexed
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Long endDate;
    private SeverityEnum severity;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String media;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Singular
    private List<String> tags;
    private I18n title;
    private I18n summary;
    private String mainRecipient;

    public static LightCardConsultationData copy(Card other) {
        LightCardConsultationDataBuilder builder = builder()
                .uid(other.getUid())
                .id(other.getId())
                .processId(other.getProcessId())
                .lttd(other.getLttd())
                .startDate(other.getStartDate())
                .endDate(other.getEndDate())
                .severity(other.getSeverity())
                .media(other.getMedia())
                .title(I18nConsultationData.copy(other.getTitle()))
                .summary(I18nConsultationData.copy(other.getSummary()))
                ;
        if(other.getTags()!=null && ! other.getTags().isEmpty())
            builder.tags(other.getTags());
        return builder.build();

    }
}
