/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.publication.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.lfenergy.operatorfabric.cards.model.I18n;
import org.lfenergy.operatorfabric.cards.model.LightCard;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.springframework.data.mongodb.core.index.Indexed;

import java.util.ArrayList;
import java.util.List;

/**
 * <p></p>
 * Created on 18/09/18
 *
 * @author davibind
 */
@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class LightCardData implements LightCard {

    private String uid ;
    private String id ;
    private String processId;
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
    private List<String> tags = new ArrayList<>();
    private I18n title;
    private I18n summary;
    private String mainRecipient;
}
