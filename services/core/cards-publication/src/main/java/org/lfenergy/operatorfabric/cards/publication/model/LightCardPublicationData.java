/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.publication.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;


import javax.validation.constraints.NotNull;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>Light Card Model, documented at {@link LightCard}</p>
 *
 * {@inheritDoc}
 *
 *
 */
@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class LightCardPublicationData implements LightCard {

    @NotNull
    private String uid ;
    @NotNull
    private String id ;
    private String publisher;
    private String publisherVersion;
    private String process;
    @NotNull
    private String processId;
    private String state;
    private Instant lttd;
    private Instant publishDate;
    @NotNull
    private Instant startDate;
    private Instant endDate;
    private SeverityEnum severity;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    //@Singular not used because lead to a NPE when built from Card
    private List<String> tags;
    private I18n title;
    private I18n summary;
    private String mainRecipient;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Singular("timeSpan")
    private Set<TimeSpanPublicationData> timeSpansSet;

    /**
     * return timespans, may be null
     * @return
     */
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

}
