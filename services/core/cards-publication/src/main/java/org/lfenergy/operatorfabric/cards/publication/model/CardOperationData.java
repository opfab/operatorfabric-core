/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.publication.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.Accessors;
import org.lfenergy.operatorfabric.cards.model.CardOperationTypeEnum;

import java.time.Instant;
import java.util.List;

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>Card Operation Model, documented at {@link CardOperation}</p>
 *
 * {@inheritDoc}
 *
 *
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardOperationData implements CardOperation {

    private Long number;
    private Instant publishDate;
    private CardOperationTypeEnum type;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private String cardId;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private LightCard card;
    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> groupRecipientsIds;
    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> entityRecipientsIds;

    // This attribute is needed to know if we must send a delete card or no (see OC-297 and OC-1052),
    // in case of a card is sent to a group the user doesn't belong to
    @Singular
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> userRecipientsIds;

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
