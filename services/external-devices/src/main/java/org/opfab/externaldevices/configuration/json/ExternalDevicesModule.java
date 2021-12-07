/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.configuration.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.opfab.externaldevices.model.*;

/**
 * Jackson (JSON) Business Module configuration
 *
 */
public class ExternalDevicesModule extends SimpleModule {

    public ExternalDevicesModule() {

        addAbstractTypeMapping(DeviceConfiguration.class, DeviceConfigurationData.class);
        addAbstractTypeMapping(Device.class, DeviceData.class);
        addAbstractTypeMapping(Notification.class, NotificationData.class);
        addAbstractTypeMapping(SignalMapping.class, SignalMappingData.class);
        addAbstractTypeMapping(UserConfiguration.class, UserConfigurationData.class);

    }
}
