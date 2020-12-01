/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
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
    private Boolean acknowledgementAllowed;
    private String color;
    private String name;
    private UserCard userCard;
    private I18n detailTitle;
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
    public Boolean getAcknowledgmentAllowed() { return this.acknowledgementAllowed; }

    @Override
    public void setAcknowledgmentAllowed(Boolean acknowledgmentAllowed) { this.acknowledgementAllowed = acknowledgmentAllowed; }
}
