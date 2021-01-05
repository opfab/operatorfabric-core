/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.consultation.model;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.*;
import org.lfenergy.operatorfabric.cards.model.CardOperationTypeEnum;

import java.time.Instant;

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
public class CardOperationConsultationData implements CardOperation {

    private Long number;
    private Instant publishDate;
    private CardOperationTypeEnum type;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private String cardId;
    

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private LightCard card;
}
