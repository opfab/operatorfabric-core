/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotNull;

import java.util.List;

@Document(collection = "userConfigurations")
public class UserConfiguration{

    @NotNull
    @Id
    public String userLogin;

    @SuppressWarnings("java:S1104") // This is just a data object
    public List<String> externalDeviceIds;

    // set methods needed for spring binding in DataInitComponent

    public void setUserLogin(String userLogin) {
        this.userLogin = userLogin;
    }   

    public void setExternalDeviceIds(List<String> externalDeviceIds) {
        this.externalDeviceIds = externalDeviceIds;
    }

}
