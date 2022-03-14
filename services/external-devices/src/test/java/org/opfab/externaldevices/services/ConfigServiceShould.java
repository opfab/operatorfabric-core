/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
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
import org.opfab.externaldevices.model.*;
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
class ConfigServiceShould {

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
    void insertDeviceConfigurationSuccessfullyIfUnique() {

        DeviceConfigurationData deviceConfiguration4 = DeviceConfigurationData.builder()
                .id("ESS4")
                .host("host4")
                .port(1234)
                .signalMappingId("signalMapping4")
                .build();
        configService.insertDeviceConfiguration(deviceConfiguration4);

        Optional<DeviceConfigurationData> retrievedConfiguration = deviceConfigurationRepository.findById("ESS4");

        Assertions.assertThat(retrievedConfiguration).isPresent();
        Assertions.assertThat(retrievedConfiguration.get()).usingRecursiveComparison().isEqualTo(deviceConfiguration4);

    }

    @Test
    void abortAndThrowExceptionWhenInsertingDuplicateDeviceConfiguration() {

        DeviceConfigurationData deviceConfiguration_1_duplicate = DeviceConfigurationData.builder()
                .id("ESS1")
                .host("host1_dup")
                .port(2345)
                .signalMappingId("signalMapping1_dup")
                .build();

        assertThrows(DuplicateKeyException.class,
                () -> configService.insertDeviceConfiguration(deviceConfiguration_1_duplicate));

        // Check that nothing was inserted and that the existing item was not updated.
        Assertions.assertThat(deviceConfigurationRepository.findAll()).hasSize(INITIAL_NUMBER_OF_DEVICE_CONFIGS);
        Optional<DeviceConfigurationData> retrievedConfiguration = deviceConfigurationRepository.findById("ESS1");

        Assertions.assertThat(retrievedConfiguration).isPresent();
        Assertions.assertThat(retrievedConfiguration.get()).usingRecursiveComparison().isEqualTo(deviceConfiguration1);

    }

    @Test
    void getDeviceConfigurations() {
        List<DeviceConfiguration> deviceConfigurationList = configService.getDeviceConfigurations();
        Assertions.assertThat(deviceConfigurationList)
            .hasSize(INITIAL_NUMBER_OF_DEVICE_CONFIGS)
            .containsExactlyInAnyOrder(deviceConfiguration1,deviceConfiguration2,deviceConfiguration3);
    }

    @Test
    void retrieveExistingDeviceConfiguration() throws ExternalDeviceConfigurationException {

        DeviceConfiguration retrievedConfiguration = configService.retrieveDeviceConfiguration("ESS1");
        Assertions.assertThat(retrievedConfiguration)
            .isNotNull()
            .usingRecursiveComparison().isEqualTo(deviceConfiguration1);

    }

    @Test
    void deleteExistingDeviceConfiguration() throws ExternalDeviceConfigurationException {

        configService.deleteDeviceConfiguration("ESS1");

        // Check that the deleted device is gone from the repository
        Assertions.assertThat(deviceConfigurationRepository.findAll()).hasSize(INITIAL_NUMBER_OF_DEVICE_CONFIGS-1);
        Optional<DeviceConfigurationData> retrievedConfiguration = deviceConfigurationRepository.findById("ESS1");
        Assertions.assertThat(retrievedConfiguration).isEmpty();

        // Check that it is no longer listed as device in any user configuration
        Assertions.assertThat(userConfigurationRepository.findByExternalDeviceId("ESS1")).isEmpty();

    }

    @Test
    void throwExceptionIfDeviceConfigurationToDeleteDoesNotExist() {

        assertThrows(ExternalDeviceConfigurationException.class,
                () -> configService.deleteDeviceConfiguration("device_configuration_that_doesnt_exist"));

        // Check that nothing was deleted
        Assertions.assertThat(deviceConfigurationRepository.findAll()).hasSize(INITIAL_NUMBER_OF_DEVICE_CONFIGS);

    }

    @Test
    void insertSignalMappingSuccessfullyIfUnique() {

        SignalMappingData signalMapping3 = SignalMappingData.builder()
                .id("signalMapping3")
                .supportedSignal("ALARM",1)
                .supportedSignal("ACTION",2)
                .supportedSignal("COMPLIANT",3)
                .supportedSignal("INFORMATION",4)
                .build();

        configService.insertSignalMapping(signalMapping3);

        Assertions.assertThat(signalMappingRepository.findAll()).hasSize(INITIAL_NUMBER_OF_SIGNAL_MAPPINGS+1);
        Optional<SignalMappingData> retrievedConfiguration = signalMappingRepository.findById("signalMapping3");
        Assertions.assertThat(retrievedConfiguration).isPresent();
        Assertions.assertThat(retrievedConfiguration.get()).usingRecursiveComparison().isEqualTo(signalMapping3);

    }

    @Test
    void abortAndThrowExceptionWhenInsertingDuplicateSignalMapping() {

        SignalMappingData signalMapping_1_duplicate = SignalMappingData.builder()
                .id("signalMapping1")
                .supportedSignal("ALARM",7)
                .supportedSignal("ACTION",8)
                .supportedSignal("COMPLIANT",9)
                .supportedSignal("INFORMATION",0)
                .build();

        assertThrows(DuplicateKeyException.class,
                () -> configService.insertSignalMapping(signalMapping_1_duplicate));

        // Check that nothing was inserted and that the existing item was not updated.
        Assertions.assertThat(signalMappingRepository.findAll()).hasSize(INITIAL_NUMBER_OF_SIGNAL_MAPPINGS);
        Optional<SignalMappingData> retrievedConfiguration = signalMappingRepository.findById("signalMapping1");

        Assertions.assertThat(retrievedConfiguration).isPresent();
        Assertions.assertThat(retrievedConfiguration.get()).usingRecursiveComparison().isEqualTo(signalMapping1);
    }

    @Test
    void getSignalMappings() {
        List<SignalMapping> signalMappingsList = configService.getSignalMappings();
        Assertions.assertThat(signalMappingsList)
            .hasSize(INITIAL_NUMBER_OF_SIGNAL_MAPPINGS)
            .containsExactlyInAnyOrder(signalMapping1,signalMapping2);
    }

    @Test
    void retrieveExistingUserConfiguration() throws ExternalDeviceConfigurationException {

        UserConfiguration retrievedConfiguration = configService.retrieveUserConfiguration("user1");
        Assertions.assertThat(retrievedConfiguration)
            .isNotNull()
            .usingRecursiveComparison().isEqualTo(userConfiguration1);

    }

    @Test
    void deleteExistingSignalMapping() throws ExternalDeviceConfigurationException {

        configService.deleteSignalMapping("signalMapping1");

        // Check that the deleted signal mapping is gone from the repository
        Assertions.assertThat(signalMappingRepository.findAll()).hasSize(INITIAL_NUMBER_OF_SIGNAL_MAPPINGS-1);
        Optional<SignalMappingData> retrievedConfiguration = signalMappingRepository.findById("signalMapping1");
        Assertions.assertThat(retrievedConfiguration).isEmpty();

        // Check that it is no longer listed as signal mapping in any device configuration
        Assertions.assertThat(deviceConfigurationRepository.findBySignalMappingId("signalMapping1")).isEmpty();

    }

    @Test
    void throwExceptionIfSignalMappingToDeleteDoesNotExist() {

        assertThrows(ExternalDeviceConfigurationException.class,
                () -> configService.deleteSignalMapping("signal_mapping_that_doesnt_exist"));

        // Check that nothing was deleted
        Assertions.assertThat(signalMappingRepository.findAll()).hasSize(INITIAL_NUMBER_OF_SIGNAL_MAPPINGS);

    }

    @Test
    void insertUserConfigurationSuccessfullyIfUnique() {

        UserConfigurationData userConfiguration5 = UserConfigurationData.builder()
                .userLogin("user5")
                .externalDeviceId("ESS5")
                .build();

        configService.saveUserConfiguration(userConfiguration5);


        Assertions.assertThat(userConfigurationRepository.findAll()).hasSize(INITIAL_NUMBER_OF_USER_CONFIGS+1);
        Optional<UserConfigurationData> retrievedConfiguration = userConfigurationRepository.findById("user5");
        Assertions.assertThat(retrievedConfiguration).isPresent();
        Assertions.assertThat(retrievedConfiguration.get()).usingRecursiveComparison().isEqualTo(userConfiguration5);

    }

    @Test
    void updateUserConfiguration() {

        UserConfigurationData userConfiguration_1_update = UserConfigurationData.builder()
                .userLogin("user1")
                .externalDeviceId("someOtherDevice")
                .build();

        configService.saveUserConfiguration(userConfiguration_1_update);

        // Check that the existing item was updated.
        Assertions.assertThat(userConfigurationRepository.findAll()).hasSize(INITIAL_NUMBER_OF_USER_CONFIGS);
        Optional<UserConfigurationData> retrievedConfiguration = userConfigurationRepository.findById("user1");

        Assertions.assertThat(retrievedConfiguration).isPresent();
        Assertions.assertThat(retrievedConfiguration.get()).usingRecursiveComparison().isEqualTo(userConfiguration_1_update);
    }

    @Test
    void getUserConfigurations() {
        List<UserConfiguration> userConfigurationList = configService.getUserConfigurations();
        Assertions.assertThat(userConfigurationList)
            .hasSize(INITIAL_NUMBER_OF_USER_CONFIGS)
            .containsExactlyInAnyOrder(userConfiguration1,userConfiguration2,userConfiguration3,userConfiguration4);
    }

    @Test
    void deleteExistingUserConfiguration() throws ExternalDeviceConfigurationException {

        configService.deleteUserConfiguration("user1");

        // Check that the deleted device is gone from the repository
        Assertions.assertThat(userConfigurationRepository.findAll()).hasSize(INITIAL_NUMBER_OF_USER_CONFIGS-1);
        Optional<UserConfigurationData> retrievedConfiguration = userConfigurationRepository.findById("user1");
        Assertions.assertThat(retrievedConfiguration).isEmpty();

    }

    @Test
    void throwExceptionIfUserConfigurationToDeleteDoesNotExist() {

        assertThrows(ExternalDeviceConfigurationException.class,
                () -> configService.deleteUserConfiguration("user_configuration_that_doesnt_exist"));

        // Check that nothing was deleted
        Assertions.assertThat(userConfigurationRepository.findAll()).hasSize(INITIAL_NUMBER_OF_USER_CONFIGS);

    }

    @ParameterizedTest
    @MethodSource("getResolvedConfigurationOKParams")
    void getResolvedConfigurationSuccessfully(String userLogin, String opFabSignalKey, ResolvedConfiguration expected) throws ExternalDeviceConfigurationException {
        Assertions.assertThat(configService.getResolvedConfiguration(opFabSignalKey, userLogin)).isEqualTo(expected);
    }

    @ParameterizedTest
    @MethodSource("getResolvedConfigurationErrorParams")
    void throwErrorIfConfigurationCantBeResolved(String userLogin, String opFabSignalKey) {
        assertThrows(ExternalDeviceConfigurationException.class,
                () -> configService.getResolvedConfiguration(opFabSignalKey, userLogin));
    }

    @ParameterizedTest
    @MethodSource("retrieveConfigurationErrorParams")
    void throwExceptionWhenAttemptingToRetrieveUserConfiguration(String userLogin) {
        assertThrows(ExternalDeviceConfigurationException.class,
                () -> configService.retrieveUserConfiguration(userLogin));
    }

    @ParameterizedTest
    @MethodSource("retrieveConfigurationErrorParams")
    void throwExceptionWhenAttemptingToRetrieveDeviceConfiguration(String deviceId) {
        assertThrows(ExternalDeviceConfigurationException.class,
                () -> configService.retrieveDeviceConfiguration(deviceId));
    }

    @ParameterizedTest
    @MethodSource("retrieveConfigurationErrorParams")
    void throwExceptionWhenAttemptingToRetrieveSignalMapping(String signalMappingId) {
        assertThrows(ExternalDeviceConfigurationException.class,
                () -> configService.retrieveSignalMapping(signalMappingId));
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

    private static Stream<Arguments> retrieveConfigurationErrorParams() {
        return Stream.of(
                Arguments.of("item_that_doesnt_exist"),
                Arguments.of(""),
                null
        );
    }

}


