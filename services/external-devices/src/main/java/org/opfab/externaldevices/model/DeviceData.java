/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeviceData implements Device {

    @Id
    private String id;
    private String host;
    private Integer port;
    private String signalMappingId;

    @Builder.Default
    private Boolean isConnected = false;

    public DeviceData(DeviceConfiguration deviceConfiguration) {
        this();
        this.id = deviceConfiguration.getId();
        this.host = deviceConfiguration.getHost();
        this.port = deviceConfiguration.getPort();
        this.signalMappingId = deviceConfiguration.getSignalMappingId();
    }

    @Override
    public String toString() {
        return "DeviceData{" +
                "id='" + id + '\'' +
                ", host='" + host + '\'' +
                ", port=" + port +
                ", signalMappingId='" + signalMappingId + '\'' +
                ", isConnected=" + isConnected +
                '}';
    }
}
