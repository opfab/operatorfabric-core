/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.businessconfig.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import org.springframework.validation.annotation.Validated;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Validated
public class UserCard {
    private String template;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Boolean severityVisible;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Boolean startDateVisible;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Boolean endDateVisible;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Builder.Default
    private Boolean expirationDateVisible = false;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Builder.Default
    private Boolean lttdVisible = false;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Boolean recipientVisible;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Boolean recipientForInformationVisible;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<EntitiesTree> publisherList;

}
