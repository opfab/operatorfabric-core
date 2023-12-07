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

@Document(collection = "deviceConfigurations")
public class DeviceConfiguration{

    @Id
    @NotNull
    public String id;

    @NotNull
    public String host;

    @NotNull
    public Integer port;

    @SuppressWarnings("java:S1104") // This is just a data object
    public String signalMappingId;

    @SuppressWarnings("java:S1104") // This is just a data object
    public Boolean isEnabled = true;

     // set methods needed for spring binding in DataInitComponent

    public void setId(String id){
        this.id = id;
    }

    public void setHost(String host){
        this.host = host;
    }

    public void setPort(Integer port){
        this.port = port;
    }

    public void setSignalMappingId(String signalMappingId){
        this.signalMappingId = signalMappingId;
    }

    public void setIsEnabled(Boolean isEnabled){
        this.isEnabled = isEnabled;
    }

    public String toString(){
        return "DeviceConfiguration{" +
                "id='" + id + '\'' +
                ", host='" + host + '\'' +
                ", port='" + port + '\'' +
                ", signalMappingId='" + signalMappingId + '\'' +
                ", isEnabled='" + isEnabled + '\'' +
                '}';
    }

}
