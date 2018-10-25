/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.consultation.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.lfenergy.operatorfabric.cards.model.CardOperation;
import org.lfenergy.operatorfabric.cards.model.CardOperationTypeEnum;
import org.lfenergy.operatorfabric.cards.model.LightCard;

import java.util.List;

/**
 * <p></p>
 * Created on 07/08/18
 *
 * @author davibind
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardOperationData implements CardOperation {

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
