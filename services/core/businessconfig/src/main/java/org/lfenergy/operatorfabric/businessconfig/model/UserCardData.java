/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.businessconfig.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;


/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>UserCard Model, documented at {@link UserCard}</p>
 *
 * {@inheritDoc}
 *
 *
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserCardData implements UserCard {
    private String template;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Boolean severityVisible;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Boolean startDateVisible;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Boolean endDateVisible;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Boolean lttdVisible;
}