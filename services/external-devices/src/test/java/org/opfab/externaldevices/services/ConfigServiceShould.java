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
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.opfab.externaldevices.application.UnitTestApplication;
import org.opfab.externaldevices.drivers.ExternalDeviceConfigurationException;
import org.opfab.externaldevices.model.DeviceConfigurationData;
import org.opfab.externaldevices.model.ResolvedConfiguration;
import org.opfab.externaldevices.model.SignalMappingData;
import org.opfab.externaldevices.model.UserConfigurationData;
import org.opfab.externaldevices.repositories.DeviceConfigurationRepository;
import org.opfab.externaldevices.repositories.SignalMappingRepository;
import org.opfab.externaldevices.repositories.UserConfigurationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UnitTestApplication.class)
@ActiveProfiles(profiles = {"default","test"})
@Tag("end-to-end")
@Tag("mongo")
public class ConfigServiceShould {

    private static final int INITIAL_NUMBER_OF_SIGNAL_MAPPINGS = 2;
    private static final int INITIAL_NUMBER_OF_DEVICE_CONFIGS = 3;
    private static final int INITIAL_NUMBER_OF_USER_CONFIGS = 4;

    @Autowired
    private ConfigService configService;

    @Autowired
    private SignalMappingRepository signalMappingRepository;

    @Autowired
    private DeviceConfigurationRepository deviceConfigurationRepository;

    @Autowired
    private UserConfigurationRepository userConfigurationRepository;

    @BeforeEach
    public void init() {

        initSignalMappingRepositoryData();
        initDeviceConfigurationRepositoryData();
        initUserConfigurationRepositoryData();

    }

    @Test
    public void insertDeviceConfigurationSuccessfullyIfUnique() {

        DeviceConfigurationData deviceConfiguration4 = DeviceConfigurationData.builder()
                .id("ESS4")
                .host("host4")
                .port(1234)
                .signalMappingId("signalMapping4")
                .build();
        configService.insertDeviceConfiguration(deviceConfiguration4);

        Optional<DeviceConfigurationData> retrievedConfiguration = deviceConfigurationRepository.findById("ESS4");

        Assertions.assertThat(retrievedConfiguration).isPresent();
        Assertions.assertThat(retrievedConfiguration.get()).isEqualTo(deviceConfiguration4).usingRecursiveComparison();

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
                () -> configService.insertDeviceConfiguration(deviceConfiguration_1_duplicate));

        // Check that nothing was inserted and that the existing item was not updated.
        Assertions.assertThat(deviceConfigurationRepository.findAll().size()).isEqualTo(INITIAL_NUMBER_OF_DEVICE_CONFIGS);
        Optional<DeviceConfigurationData> retrievedConfiguration = deviceConfigurationRepository.findById("ESS1");

        Assertions.assertThat(retrievedConfiguration).isPresent();
        Assertions.assertThat(retrievedConfiguration.get()).isEqualTo(deviceConfiguration1).usingRecursiveComparison();

    }

    @Test
    public void retrieveExistingDeviceConfiguration() {

        Optional<DeviceConfigurationData> retrievedConfiguration = configService.getDeviceConfiguration("ESS1");
        Assertions.assertThat(retrievedConfiguration).isPresent();
        Assertions.assertThat(retrievedConfiguration.get()).isEqualTo(deviceConfiguration1).usingRecursiveComparison();

    }

    @Test
    public void getDeviceConfigurations() {
        List<DeviceConfigurationData> deviceConfigurationDataList = configService.getDeviceConfigurations();
        Assertions.assertThat(deviceConfigurationDataList.size()).isEqualTo(INITIAL_NUMBER_OF_DEVICE_CONFIGS);
    }

    @Test
    public void insertSignalMappingIfUnique() {

        SignalMappingData signalMapping3 = SignalMappingData.builder()
                .id("signalMapping3")
                .supportedSignal("ALARM",1)
                .supportedSignal("ACTION",2)
                .supportedSignal("COMPLIANT",3)
                .supportedSignal("INFORMATION",4)
                .build();

        configService.insertSignalMapping(signalMapping3);

        Assertions.assertThat(signalMappingRepository.findAll().size()).isEqualTo(INITIAL_NUMBER_OF_SIGNAL_MAPPINGS+1);
        Optional<SignalMappingData> retrievedConfiguration = signalMappingRepository.findById("signalMapping3");
        Assertions.assertThat(retrievedConfiguration).isPresent();
        Assertions.assertThat(retrievedConfiguration.get()).isEqualTo(signalMapping3).usingRecursiveComparison();

    }

    @ParameterizedTest
    @MethodSource("getResolvedConfigurationOKParams")
    public void getResolvedConfigurationSuccessfully(String userLogin, String opFabSignalKey, ResolvedConfiguration expected) throws ExternalDeviceConfigurationException {
        Assertions.assertThat(configService.getResolvedConfiguration(opFabSignalKey, userLogin)).isEqualTo(expected);
    }

    @ParameterizedTest
    @MethodSource("getResolvedConfigurationErrorParams")
    public void throwErrorIfConfigurationCantBeResolved(String userLogin, String opFabSignalKey) {
        assertThrows(ExternalDeviceConfigurationException.class,
                () -> configService.getResolvedConfiguration(opFabSignalKey, userLogin));
    }

    @AfterEach
    public void clean(){
        signalMappingRepository.deleteAll();
        deviceConfigurationRepository.deleteAll();
        userConfigurationRepository.deleteAll();
    }

    private static final SignalMappingData signalMapping1 = SignalMappingData.builder()
            .id("signalMapping1")
            .supportedSignal("ALARM",1)
            .supportedSignal("ACTION",2)
            .supportedSignal("COMPLIANT",3)
            .supportedSignal("INFORMATION",4)
            .build();

    private static final SignalMappingData signalMapping2 = SignalMappingData.builder()
            .id("signalMapping2")
            .supportedSignal("ALARM",5)
            .supportedSignal("ACTION",6)
            .supportedSignal("COMPLIANT",7)
            // This mapping doesn't support INFORMATION signals.
            .build();

    private static final DeviceConfigurationData deviceConfiguration1 = DeviceConfigurationData.builder()
            .id("ESS1")
            .host("host1")
            .port(1234)
            .signalMappingId("signalMapping1")
            .build();

    private static final DeviceConfigurationData deviceConfiguration2 = DeviceConfigurationData.builder()
            .id("ESS2")
            .host("host2")
            .port(5678)
            .signalMappingId("signalMapping2")
            .build();

    private static final DeviceConfigurationData deviceConfiguration3 = DeviceConfigurationData.builder()
            .id("ESS3")
            .host("host1")
            .port(5678)
            .signalMappingId("signalMapping_that_doesnt_exist")
            .build();

    private static final UserConfigurationData userConfiguration1 = UserConfigurationData.builder()
            .userLogin("user1")
            .externalDeviceId("ESS1")
            .build();

    private static final UserConfigurationData userConfiguration2 = UserConfigurationData.builder()
            .userLogin("user2")
            .externalDeviceId("ESS2")
            .build();

    private static final UserConfigurationData userConfiguration3 = UserConfigurationData.builder()
            .userLogin("user3")
            .externalDeviceId("ESS3")
            .build();

    private static final UserConfigurationData userConfiguration4 = UserConfigurationData.builder()
            .userLogin("user4")
            .externalDeviceId("device_that_doesnt_exist")
            .build();

    private void initSignalMappingRepositoryData() {
        signalMappingRepository.insert(signalMapping1);
        signalMappingRepository.insert(signalMapping2);
    }

    private void initDeviceConfigurationRepositoryData() {

        deviceConfigurationRepository.insert(deviceConfiguration1);
        deviceConfigurationRepository.insert(deviceConfiguration2);
        deviceConfigurationRepository.insert(deviceConfiguration3);

    }

    private void initUserConfigurationRepositoryData() {

        userConfigurationRepository.insert(userConfiguration1);
        userConfigurationRepository.insert(userConfiguration2);
        userConfigurationRepository.insert(userConfiguration3);
        userConfigurationRepository.insert(userConfiguration4);

    }

    private static Stream<Arguments> getResolvedConfigurationOKParams() {
        return Stream.of(
                Arguments.of("user1", "ACTION", new ResolvedConfiguration(deviceConfiguration1,2)),
                Arguments.of("user1", "INFORMATION", new ResolvedConfiguration(deviceConfiguration1,4)),
                Arguments.of("user2", "ALARM", new ResolvedConfiguration(deviceConfiguration2,5))
        );
    }

    private static Stream<Arguments> getResolvedConfigurationErrorParams() {
        return Stream.of(
                Arguments.of("user_with_no_config", "ACTION"),
                Arguments.of("user4", "ACTION"), //Configured device for user doesn't exist
                Arguments.of("user3", "ALARM"), //Configured signal mapping for device doesn't exist
                Arguments.of("user2", "INFORMATION") //This signal is not mapped in this user's configuration
        );
    }

}


