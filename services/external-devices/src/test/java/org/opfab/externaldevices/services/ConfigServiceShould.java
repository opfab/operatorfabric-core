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
import org.opfab.externaldevices.drivers.UnknownExternalDeviceException;
import org.opfab.externaldevices.model.DeviceConfiguration;
import org.opfab.externaldevices.model.DeviceConfigurationData;
import org.opfab.externaldevices.model.ResolvedConfiguration;
import org.opfab.externaldevices.model.SignalMapping;
import org.opfab.externaldevices.model.SignalMappingData;
import org.opfab.externaldevices.model.UserConfiguration;
import org.opfab.externaldevices.model.UserConfigurationData;
import org.opfab.externaldevices.repositories.DeviceConfigurationRepository;
import org.opfab.externaldevices.repositories.SignalMappingRepository;
import org.opfab.externaldevices.repositories.UserConfigurationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Arrays;
import java.util.Collections;
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
    private static final int INITIAL_NUMBER_OF_USER_CONFIGS = 5;

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

        DeviceConfigurationData deviceConfiguration5 = DeviceConfigurationData.builder()
                .id("ESS5")
                .host("host5")
                .port(1234)
                .signalMappingId("signalMapping4")
                .isEnabled(true)
                .build();
        configService.insertDeviceConfiguration(deviceConfiguration5);

        Optional<DeviceConfigurationData> retrievedConfiguration = deviceConfigurationRepository.findById("ESS5");

        Assertions.assertThat(retrievedConfiguration).isPresent();
        Assertions.assertThat(retrievedConfiguration.get()).usingRecursiveComparison().isEqualTo(deviceConfiguration5);

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
    void retrieveExistingDeviceConfiguration() throws ExternalDeviceConfigurationException, UnknownExternalDeviceException {

        DeviceConfiguration retrievedConfiguration = configService.retrieveDeviceConfiguration("ESS1");
        Assertions.assertThat(retrievedConfiguration)
            .isNotNull()
            .usingRecursiveComparison().isEqualTo(deviceConfiguration1);

    }

    @Test
    void deleteExistingDeviceConfiguration() throws ExternalDeviceConfigurationException, UnknownExternalDeviceException {

        configService.deleteDeviceConfiguration("ESS1");

        // Check that the deleted device is gone from the repository
        Assertions.assertThat(deviceConfigurationRepository.findAll()).hasSize(INITIAL_NUMBER_OF_DEVICE_CONFIGS-1);
        Optional<DeviceConfigurationData> retrievedConfiguration = deviceConfigurationRepository.findById("ESS1");
        Assertions.assertThat(retrievedConfiguration).isEmpty();

        // Check that it is no longer listed as device in any user configuration
        Assertions.assertThat(userConfigurationRepository.findByExternalDeviceIds("ESS1")).isEmpty();

    }

    @Test
    void throwExceptionIfDeviceConfigurationToDeleteDoesNotExist() {

        assertThrows(UnknownExternalDeviceException.class,
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
        UserConfigurationData userConfiguration6 = UserConfigurationData.builder()
                .userLogin("user6")
                .externalDeviceIds(Collections.singletonList("ESS6"))
                .build();

        configService.saveUserConfiguration(userConfiguration6);


        Assertions.assertThat(userConfigurationRepository.findAll()).hasSize(INITIAL_NUMBER_OF_USER_CONFIGS+1);
        Optional<UserConfigurationData> retrievedConfiguration = userConfigurationRepository.findById("user6");
        Assertions.assertThat(retrievedConfiguration).isPresent();
        Assertions.assertThat(retrievedConfiguration.get()).usingRecursiveComparison().isEqualTo(userConfiguration6);

    }

    @Test
    void updateUserConfiguration() {

        UserConfigurationData userConfiguration_1_update = UserConfigurationData.builder()
                .userLogin("user1")
                .externalDeviceIds(Collections.singletonList("someOtherDevice"))
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
            .containsExactlyInAnyOrder(userConfiguration1,userConfiguration2,userConfiguration3,userConfiguration4, userConfiguration5);
    }

    @Test
    void deleteExistingUserConfiguration() throws ExternalDeviceConfigurationException {

        configService.deleteUserConfiguration("user1", Optional.empty());

        // Check that the deleted device is gone from the repository
        Assertions.assertThat(userConfigurationRepository.findAll()).hasSize(INITIAL_NUMBER_OF_USER_CONFIGS-1);
        Optional<UserConfigurationData> retrievedConfiguration = userConfigurationRepository.findById("user1");
        Assertions.assertThat(retrievedConfiguration).isEmpty();

    }

    @Test
    void throwExceptionIfUserConfigurationToDeleteDoesNotExist() {

        assertThrows(ExternalDeviceConfigurationException.class,
                () -> configService.deleteUserConfiguration("user_configuration_that_doesnt_exist", Optional.empty()));

        // Check that nothing was deleted
        Assertions.assertThat(userConfigurationRepository.findAll()).hasSize(INITIAL_NUMBER_OF_USER_CONFIGS);

    }

    @ParameterizedTest
    @MethodSource("getResolvedConfigurationOKParams")
    void getResolvedConfigurationSuccessfully(String userLogin, String opFabSignalKey, List<ResolvedConfiguration> expected) throws ExternalDeviceConfigurationException, UnknownExternalDeviceException {
        Assertions.assertThat(configService.getResolvedConfigurationList(opFabSignalKey, userLogin)).isEqualTo(expected);
    }

    @ParameterizedTest
    @MethodSource("getResolvedConfigurationErrorParams")
    void throwErrorIfConfigurationCantBeResolved(String userLogin, String opFabSignalKey) {
        assertThrows(ExternalDeviceConfigurationException.class,
                () -> configService.getResolvedConfigurationList(opFabSignalKey, userLogin));
    }

    @Test
    void throwUnknownDeviceExceptionOnResolveIfDeviceIsUnknown() {
        assertThrows(UnknownExternalDeviceException.class,
                () -> configService.getResolvedConfigurationList("ACTION", "user4"));
    }

    @ParameterizedTest
    @MethodSource("retrieveConfigurationErrorParams")
    void throwExceptionWhenAttemptingToRetrieveUserConfiguration(String userLogin) {
        assertThrows(ExternalDeviceConfigurationException.class,
                () -> configService.retrieveUserConfiguration(userLogin));
    }

    @Test
    void shouldThrowUnknownDeviceExceptionIfDeviceIsUnknown() {
        assertThrows(UnknownExternalDeviceException.class,
                () -> configService.retrieveDeviceConfiguration("item_that_doesnt_exist"));
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
            .externalDeviceIds(Collections.singletonList("ESS1"))
            .build();

    private static final UserConfigurationData userConfiguration2 = UserConfigurationData.builder()
            .userLogin("user2")
            .externalDeviceIds(Collections.singletonList("ESS2"))
            .build();

    private static final UserConfigurationData userConfiguration3 = UserConfigurationData.builder()
            .userLogin("user3")
            .externalDeviceIds(Arrays.asList("ESS3"))
            .build();

    private static final UserConfigurationData userConfiguration4 = UserConfigurationData.builder()
            .userLogin("user4")
            .externalDeviceIds(Collections.singletonList("device_that_doesnt_exist"))
            .build();

    private static final UserConfigurationData userConfiguration5 = UserConfigurationData.builder()
            .userLogin("user5")
            .externalDeviceIds(Arrays.asList("ESS1", "ESS2"))
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
        userConfigurationRepository.insert(userConfiguration5);

    }

    private static Stream<Arguments> getResolvedConfigurationOKParams() {
        return Stream.of(
                Arguments.of("user1", "ACTION", Collections.singletonList(new ResolvedConfiguration(deviceConfiguration1,2))),
                Arguments.of("user1", "INFORMATION", Collections.singletonList(new ResolvedConfiguration(deviceConfiguration1,4))),
                Arguments.of("user2", "ALARM", Collections.singletonList(new ResolvedConfiguration(deviceConfiguration2,5))),
                Arguments.of("user5", "ACTION",Arrays.asList(new ResolvedConfiguration(deviceConfiguration1, 2), new ResolvedConfiguration(deviceConfiguration2, 6)))
        );
    }

    private static Stream<Arguments> getResolvedConfigurationErrorParams() {
        return Stream.of(
                Arguments.of("user_with_no_config", "ACTION"),
                Arguments.of("user3", "ALARM"), //Configured signal mapping for device doesn't exist
                Arguments.of("user2", "INFORMATION") //This signal is not mapped in this user's configuration
        );
    }

    private static Stream<Arguments> retrieveConfigurationErrorParams() {
        return Stream.of(
                Arguments.of(""),
                null
        );
    }

}


