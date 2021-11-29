/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.configuration.externaldevices;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration of available external devices
 * The properties are prefixed by "operatorfabric.externaldevices.watchdog"
 *
 *
 */
@ConfigurationProperties("operatorfabric.externaldevices.watchdog")
@Component
@Data
public class ExternalDevicesWatchdogProperties {

    private Boolean enabled = false;
    private String cron = "*/5 * * * * *";
    private int signalId = 0;

}
