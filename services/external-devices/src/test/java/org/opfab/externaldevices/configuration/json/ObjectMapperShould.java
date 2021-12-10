/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.configuration.json;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.externaldevices.application.UnitTestApplication;
import org.opfab.externaldevices.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes={UnitTestApplication.class, JacksonConfig.class})
@ActiveProfiles(profiles = {"default","test"})
@Slf4j
public class ObjectMapperShould {

    @Autowired
    private ObjectMapper mapper;

    @Test
    void readDeviceConfiguration() throws IOException {
        String deviceConfigurationString = "{ \"id\": \"loudspeaker_1\", \"host\": \"some_host\", \"port\": 1234, \"signalMappingId\": \"some_mapping\" }";
        DeviceConfiguration deviceConfiguration = mapper.readValue(deviceConfigurationString, DeviceConfiguration.class);
        assertThat(deviceConfiguration).isNotNull();
        assertThat(deviceConfiguration).isInstanceOf(DeviceConfigurationData.class);
        assertThat(deviceConfiguration.getId()).isEqualTo("loudspeaker_1");
        assertThat(deviceConfiguration.getHost()).isEqualTo("some_host");
        assertThat(deviceConfiguration.getPort()).isEqualTo(1234);
        assertThat(deviceConfiguration.getSignalMappingId()).isEqualTo("some_mapping");
    }

    @Test
    void readUserConfiguration() throws IOException {
        String userConfigurationString = "{ \"userLogin\": \"jcleese\", \"externalDeviceId\": \"loudspeaker_1\" }";
        UserConfiguration userConfiguration = mapper.readValue(userConfigurationString, UserConfiguration.class);
        assertThat(userConfiguration).isNotNull();
        assertThat(userConfiguration).isInstanceOf(UserConfigurationData.class);
        assertThat(userConfiguration.getUserLogin()).isEqualTo("jcleese");
        assertThat(userConfiguration.getExternalDeviceId()).isEqualTo("loudspeaker_1");
    }

    @Test
    void readSignalMapping() throws IOException {
        String signalMappingString = "{ \"id\": \"some_mapping\", \"supportedSignals\": { \"ALARM\": 1, \"ACTION\": 2 } }";
        SignalMapping signalMapping = mapper.readValue(signalMappingString, SignalMapping.class);
        assertThat(signalMapping).isNotNull();
        assertThat(signalMapping).isInstanceOf(SignalMappingData.class);
        assertThat(signalMapping.getId()).isEqualTo("some_mapping");
        assertThat(signalMapping.getSupportedSignals()).containsEntry("ALARM",1);
        assertThat(signalMapping.getSupportedSignals()).containsEntry("ACTION",2);
    }

    @Test
    void readNotification() throws IOException {
        String notificationString = "{ \"signalId\": \"ALARM\" }";
        Notification notification = mapper.readValue(notificationString, Notification.class);
        assertThat(notification).isNotNull();
        assertThat(notification).isInstanceOf(NotificationData.class);
        assertThat(notification.getSignalId()).isEqualTo("ALARM");
    }
}
