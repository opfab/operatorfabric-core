/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.lfenergy.operatorfabric.thirds.model;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessStatesData implements ProcessStates {
    @Singular("detailsData")
    private List<? extends Detail> detailsData;
    private ResponseData responseData;
    private Boolean acknowledgementAllowed;
    private String color;
    private String name;

    @Override
    public void setDetails(List<? extends Detail> details) {
        this.detailsData = new ArrayList<>((List < DetailData >) details);
    }

    @Override
    public List<? extends Detail> getDetails(){
        return detailsData;
    }

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
