/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.businessconfig.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

import org.springframework.validation.annotation.Validated;

@Validated
public record UserCard(
    String template,
    @JsonInclude(JsonInclude.Include.NON_NULL) Boolean severityVisible,
    @JsonInclude(JsonInclude.Include.NON_NULL) Boolean keepChildCardsVisible,
    @JsonInclude(JsonInclude.Include.NON_NULL) Boolean startDateVisible,
    @JsonInclude(JsonInclude.Include.NON_NULL) Boolean endDateVisible,
    @JsonInclude(JsonInclude.Include.NON_NULL) Boolean expirationDateVisible,
    @JsonInclude(JsonInclude.Include.NON_NULL) Boolean lttdVisible,
    @JsonInclude(JsonInclude.Include.NON_NULL) Boolean recipientVisible,
    @JsonInclude(JsonInclude.Include.NON_NULL) Boolean recipientForInformationVisible,
    @JsonInclude(JsonInclude.Include.NON_NULL) Boolean publisherVisible,
    List<EntitiesTree> publisherList
) {
    public UserCard {
        if (expirationDateVisible == null) {
            expirationDateVisible = false;
        }
        if (lttdVisible == null) {
            lttdVisible = false;
        }
    }
}

