/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.consultation.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.lfenergy.operatorfabric.cards.model.CardOperationTypeEnum;

import java.util.List;

/**
 * Please use builder to instantiate outside delinearization
 *
 * @Author David Binder
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardOperationConsultationData implements CardOperation {

    private Long number;
    private Long publicationDate;
    private CardOperationTypeEnum type;
    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> cardIds;
    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<? extends LightCard> cards;

}
