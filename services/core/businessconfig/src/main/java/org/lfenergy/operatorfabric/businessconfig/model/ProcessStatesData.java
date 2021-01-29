/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.lfenergy.operatorfabric.businessconfig.model;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessStatesData implements ProcessStates {
    private ResponseData responseData;
    private AcknowledgmentAllowedEnum acknowledgmentAllowed;
    private String color;
    private String name;
    private String description;
    private Boolean showDetailCardHeader;
    private UserCard userCard;
    private String templateName;
    @Singular
    private List<String> styles;

    @Override
    public Response getResponse() {
        return responseData;
    }

    @Override
    public void setResponse(Response responseData) {
        this.responseData = (ResponseData) responseData;
    }

    @Override
    public AcknowledgmentAllowedEnum getAcknowledgmentAllowed() { return this.acknowledgmentAllowed; }

    @Override
    public void setAcknowledgmentAllowed(AcknowledgmentAllowedEnum acknowledgmentAllowed) { this.acknowledgmentAllowed = acknowledgmentAllowed; }
}
