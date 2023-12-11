/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.configuration.externaldevices;

import lombok.Data;
import org.opfab.externaldevices.model.DeviceConfiguration;
import org.opfab.externaldevices.model.SignalMapping;
import org.opfab.externaldevices.model.UserConfiguration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Configuration of available external devices
 * The properties are prefixed by "operatorfabric.externaldevices.default"
 *
 *
 */
@ConfigurationProperties("operatorfabric.externaldevices.default")
@Component
@Data
public class ExternalDevicesProperties {

    private List<DeviceConfiguration> deviceConfigurations = new ArrayList<>();

    private List<SignalMapping> signalMappings = new ArrayList<>();

    private List<UserConfiguration> userConfigurations = new ArrayList<>();

}
