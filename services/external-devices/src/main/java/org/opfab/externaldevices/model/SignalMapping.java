/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.model;

import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotNull;

import java.util.Map;

@Document(collection = "signalMapping")
public class SignalMapping {

    @NotNull
    public String id;

    @NotNull
    public Map<String, Integer> supportedSignals;

    // set methods needed for spring binding in DataInitComponent
    
    public void setId(String id) {
        this.id = id;
    }

    public void setSupportedSignals(Map<String, Integer> supportedSignals) {
        this.supportedSignals = supportedSignals;
    }

}
