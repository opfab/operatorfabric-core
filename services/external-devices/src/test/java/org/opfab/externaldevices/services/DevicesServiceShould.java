/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.services;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.externaldevices.application.UnitTestApplication;
import org.opfab.externaldevices.drivers.ExternalDeviceConfigurationException;
import org.opfab.externaldevices.drivers.ExternalDeviceDriverException;
import org.opfab.externaldevices.model.Device;
import org.opfab.externaldevices.model.DeviceConfigurationData;
import org.opfab.externaldevices.repositories.DeviceConfigurationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.net.UnknownHostException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UnitTestApplication.class)
@ActiveProfiles(profiles = {"default","test"})
@Tag("end-to-end")
@Tag("mongo")
public class DevicesServiceShould {

    private final int INITIAL_NUMBER_OF_DEVICE_CONFIGS = 4;

    @Autowired
    private DevicesService devicesService;

    @Autowired
    private DeviceConfigurationRepository deviceConfigurationRepository;

    @BeforeEach
    public void init() {

        deviceConfigurationRepository.insert(DeviceConfigurationData.builder()
                .id("ESS1")
                .host("host1")
                .port(1234)
                .signalMappingId("signalMapping1")
                .build());
        deviceConfigurationRepository.insert(DeviceConfigurationData.builder()
                .id("ESS2")
                .host("host2")
                .port(5678)
                .signalMappingId("signalMapping2")
                .build());
        deviceConfigurationRepository.insert(DeviceConfigurationData.builder()
                .id("ESS_unresolved_host")
                .host("host3")
                .port(234)
                .signalMappingId("signalMapping3")
                .build());
        deviceConfigurationRepository.insert(DeviceConfigurationData.builder()
                .id("ESS_wrong_port")
                .host("host2")
                .port(5678)
                .signalMappingId("signalMapping2")
                .build());

    }

    @Test
    public void getDevices() {

        List<Device> deviceList = devicesService.getDevices();
        Assertions.assertThat(deviceList.size()).isEqualTo(INITIAL_NUMBER_OF_DEVICE_CONFIGS);

    }

    @Test
    public void insertDeviceConfigurationSuccessfullyIfUnique() {

        DeviceConfigurationData deviceConfiguration_4 = DeviceConfigurationData.builder()
                .id("ESS4")
                .host("host4")
                .port(1234)
                .signalMappingId("signalMapping4")
                .build();
        devicesService.insertDeviceConfiguration(deviceConfiguration_4);

        Assertions.assertThat(deviceConfigurationRepository.findAll().size()).isEqualTo(INITIAL_NUMBER_OF_DEVICE_CONFIGS+1);

        Optional<DeviceConfigurationData> retrievedConfiguration = deviceConfigurationRepository.findById("ESS4");

        Assertions.assertThat(retrievedConfiguration.isPresent()).isTrue();
        Assertions.assertThat(retrievedConfiguration.get().getId()).isEqualTo("ESS4");
        Assertions.assertThat(retrievedConfiguration.get().getHost()).isEqualTo("host4");
        Assertions.assertThat(retrievedConfiguration.get().getPort()).isEqualTo(1234);
        Assertions.assertThat(retrievedConfiguration.get().getSignalMappingId()).isEqualTo("signalMapping4");
    }

    @Test
    public void abortAndThrowExceptionWhenInsertingDuplicateDeviceConfiguration() {

        DeviceConfigurationData deviceConfiguration_1_duplicate = DeviceConfigurationData.builder()
                .id("ESS1")
                .host("host1_dup")
                .port(2345)
                .signalMappingId("signalMapping1_dup")
                .build();

        assertThrows(DuplicateKeyException.class,
                () -> devicesService.insertDeviceConfiguration(deviceConfiguration_1_duplicate));

        // Check that nothing was inserted and that the existing item was not updated.

        Assertions.assertThat(deviceConfigurationRepository.findAll().size()).isEqualTo(INITIAL_NUMBER_OF_DEVICE_CONFIGS);

        Optional<DeviceConfigurationData> retrievedConfiguration = deviceConfigurationRepository.findById("ESS1");

        Assertions.assertThat(retrievedConfiguration.isPresent()).isTrue();
        Assertions.assertThat(retrievedConfiguration.get().getId()).isEqualTo("ESS1");
        Assertions.assertThat(retrievedConfiguration.get().getHost()).isEqualTo("host1");
        Assertions.assertThat(retrievedConfiguration.get().getPort()).isEqualTo(1234);
        Assertions.assertThat(retrievedConfiguration.get().getSignalMappingId()).isEqualTo("signalMapping1");

    }

    @Test
    public void connectAndDisconnectDeviceIfItIsReachable() {

        try {
            //Initially, device is disconnected
            Assertions.assertThat(devicesService.getDevice("ESS1").get().getIsConnected()).isEqualTo(false);

            devicesService.connectDevice("ESS1");
            Assertions.assertThat(devicesService.getDevice("ESS1").get().getIsConnected()).isEqualTo(true);
            devicesService.disconnectDevice("ESS1");
            Assertions.assertThat(devicesService.getDevice("ESS1").get().getIsConnected()).isEqualTo(false);

        } catch (ExternalDeviceDriverException | ExternalDeviceConfigurationException e) {
            Assertions.fail(e.getMessage());
        }
    }

    @Test
    public void throwErrorIfAttemptingToConnectToUnknownDevice() {
        assertThrows(ExternalDeviceConfigurationException.class,
                () -> devicesService.connectDevice("DeviceForWhichWeHaveNoConfig"));
    }

    @Test
    public void throwErrorIfAttemptingToConnectToDeviceWithUnknownHost() {
        Exception exception = assertThrows(ExternalDeviceDriverException.class,
                () -> devicesService.connectDevice("ESS_unresolved_host"));
        Assertions.assertThat(exception.getCause()).isInstanceOf(UnknownHostException.class);
    }

    @Test
    public void throwErrorIfAttemptingToConnectToUnreachableDevice() {
        Exception exception = assertThrows(ExternalDeviceDriverException.class,
                () -> devicesService.connectDevice("ESS_wrong_port"));
    }

    @AfterEach
    public void clean(){
        deviceConfigurationRepository.deleteAll();
    }

}
