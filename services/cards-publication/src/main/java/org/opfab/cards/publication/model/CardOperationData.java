/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.Accessors;
import org.opfab.cards.model.CardOperationTypeEnum;
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardOperationData implements CardOperation {

    private CardOperationTypeEnum type;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private String cardId;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private String cardUid;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private LightCard card;

    @Singular("entityAck")
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> entitiesAcks;

    /**
     * Class used to encapsulate builder in order to bypass javadoc inability to handle annotation processor generated classes
     */
    @AllArgsConstructor
    public static class BuilderEncapsulator{
        @Accessors(fluent = true) @Getter
        private CardOperationData.CardOperationDataBuilder builder;
    }

    /**
     * Used to bypass javadoc inability to handle annotation processor generated classes
     * @return an encapsulated builder
     */
    public static BuilderEncapsulator encapsulatedBuilder(){
        return new BuilderEncapsulator(builder());
    }
}
