/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.configuration.json;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.externaldevices.application.UnitTestApplication;
import org.opfab.externaldevices.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Map;
import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = { UnitTestApplication.class, JacksonConfig.class })
class ObjectMapperShould {

    @Autowired
    private ObjectMapper mapper;

    @Test
    void readDeviceConfiguration() throws IOException {
        String deviceConfigurationString = "{ \"id\": \"loudspeaker_1\", \"host\": \"some_host\", \"port\": 1234, \"signalMappingId\": \"some_mapping\" }";
        DeviceConfiguration deviceConfiguration = mapper.readValue(deviceConfigurationString,
                DeviceConfiguration.class);
        assertThat(deviceConfiguration).isNotNull().isInstanceOf(DeviceConfiguration.class);
        assertThat(deviceConfiguration.id).isEqualTo("loudspeaker_1");
        assertThat(deviceConfiguration.host).isEqualTo("some_host");
        assertThat(deviceConfiguration.port).isEqualTo(1234);
        assertThat(deviceConfiguration.signalMappingId).isEqualTo("some_mapping");
    }

    @Test
    void readUserConfiguration() throws IOException {
        String userConfigurationString = "{ \"userLogin\": \"jcleese\", \"externalDeviceIds\": [\"loudspeaker_1\", \"loudspeaker_2\"] }";
        UserConfiguration userConfiguration = mapper.readValue(userConfigurationString, UserConfiguration.class);
        assertThat(userConfiguration).isNotNull().isInstanceOf(UserConfiguration.class);
        assertThat(userConfiguration.userLogin).isEqualTo("jcleese");
        assertThat(userConfiguration.externalDeviceIds).hasSize(2);
        assertThat(userConfiguration.externalDeviceIds.get(0)).isEqualTo("loudspeaker_1");
        assertThat(userConfiguration.externalDeviceIds.get(1)).isEqualTo("loudspeaker_2");
    }

    @Test
    void readSignalMapping() throws IOException {
        String signalMappingString = "{ \"id\": \"some_mapping\", \"supportedSignals\": { \"ALARM\": 1, \"ACTION\": 2 } }";
        SignalMapping signalMapping = mapper.readValue(signalMappingString, SignalMapping.class);
        assertThat(signalMapping)
                .isNotNull()
                .isInstanceOf(SignalMapping.class)
                .extracting("id", "supportedSignals")
                .containsExactly("some_mapping", Map.of("ALARM", 1, "ACTION", 2));
    }

    @Test
    void readNotification() throws IOException {
        String notificationString = "{ \"opfabSignalId\": \"ALARM\" }";
        Notification notification = mapper.readValue(notificationString, Notification.class);
        assertThat(notification).isNotNull().isInstanceOf(Notification.class);
        assertThat(notification.opfabSignalId).isEqualTo("ALARM");
    }
}
