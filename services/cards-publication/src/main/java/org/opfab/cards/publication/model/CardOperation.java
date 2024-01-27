/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Validated
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record CardOperation(CardOperationTypeEnum type,
                            String cardId,
                            String cardUid,
                            LightCard card,
                            List<String> entitiesAcks) {
}
