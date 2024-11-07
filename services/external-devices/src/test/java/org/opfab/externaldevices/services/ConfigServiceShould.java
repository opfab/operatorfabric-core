/* Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.opfab.externaldevices.drivers.ExternalDeviceConfigurationException;
import org.opfab.externaldevices.drivers.UnknownExternalDeviceException;
import org.opfab.externaldevices.mocks.DeviceConfigurationRepositoryMock;
import org.opfab.externaldevices.mocks.SettingsRepositoryMock;
import org.opfab.externaldevices.mocks.SignalMappingRepositoryMock;
import org.opfab.externaldevices.mocks.UserConfigurationRepositoryMock;
import org.opfab.externaldevices.model.DeviceConfiguration;
import org.opfab.externaldevices.model.ResolvedConfiguration;
import org.opfab.externaldevices.model.SignalMapping;
import org.opfab.externaldevices.model.UserConfiguration;
import org.opfab.externaldevices.repositories.DeviceConfigurationRepository;
import org.opfab.externaldevices.repositories.SettingsRepository;
import org.opfab.externaldevices.repositories.SignalMappingRepository;
import org.opfab.externaldevices.repositories.UserConfigurationRepository;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertThrows;

class ConfigServiceShould {

    private static final int INITIAL_NUMBER_OF_SIGNAL_MAPPINGS = 2;
    private static final int INITIAL_NUMBER_OF_DEVICE_CONFIGS = 3;
    private static final int INITIAL_NUMBER_OF_USER_CONFIGS = 5;

    private ConfigService configService;
    private SignalMappingRepository signalMappingRepository;
    private DeviceConfigurationRepository deviceConfigurationRepository;
    private UserConfigurationRepository userConfigurationRepository;
    private SettingsRepository settingsRepository;

    private SignalMapping signalMapping1;
    private SignalMapping signalMapping2;

    private UserConfiguration userConfiguration1;
    private UserConfiguration userConfiguration2;
    private UserConfiguration userConfiguration3;
    private UserConfiguration userConfiguration4;
    private UserConfiguration userConfiguration5;

    private static DeviceConfiguration deviceConfiguration1;
    private static DeviceConfiguration deviceConfiguration2;
    private static DeviceConfiguration deviceConfiguration3;

    @BeforeEach
    public void init() {

        signalMappingRepository = new SignalMappingRepositoryMock();
        deviceConfigurationRepository = new DeviceConfigurationRepositoryMock();
        userConfigurationRepository = new UserConfigurationRepositoryMock();
        settingsRepository = new SettingsRepositoryMock();

        configService = new ConfigService(userConfigurationRepository, deviceConfigurationRepository,
                signalMappingRepository, settingsRepository);

        signalMapping1 = new SignalMapping();
        signalMapping1.id = "signalMapping1";
        signalMapping1.supportedSignals = new HashMap<String, Integer>();
        signalMapping1.supportedSignals.put("ALARM", 1);
        signalMapping1.supportedSignals.put("ACTION", 2);
        signalMapping1.supportedSignals.put("COMPLIANT", 3);
        signalMapping1.supportedSignals.put("INFORMATION", 4);

        signalMapping2 = new SignalMapping();
        signalMapping2.id = "signalMapping2";
        signalMapping2.supportedSignals = new HashMap<String, Integer>();
        signalMapping2.supportedSignals.put("ALARM", 5);
        signalMapping2.supportedSignals.put("ACTION", 6);
        signalMapping2.supportedSignals.put("COMPLIANT", 7);
        // This mapping doesn't support INFORMATION signals.

        userConfiguration1 = new UserConfiguration();
        userConfiguration1.userLogin = "user1";
        userConfiguration1.externalDeviceIds = Collections.singletonList("ESS1");

        userConfiguration2 = new UserConfiguration();
        userConfiguration2.userLogin = "user2";
        userConfiguration2.externalDeviceIds = Collections.singletonList("ESS2");

        userConfiguration3 = new UserConfiguration();
        userConfiguration3.userLogin = "user3";
        userConfiguration3.externalDeviceIds = Collections.singletonList("ESS3");

        userConfiguration4 = new UserConfiguration();
        userConfiguration4.userLogin = "user4";
        userConfiguration4.externalDeviceIds = Collections.singletonList("device_that_doesnt_exist");

        userConfiguration5 = new UserConfiguration();
        userConfiguration5.userLogin = "user5";
        userConfiguration5.externalDeviceIds = Arrays.asList("ESS1", "ESS2");

        deviceConfiguration1 = new DeviceConfiguration();
        deviceConfiguration1.id = "ESS1";
        deviceConfiguration1.host = "host1";
        deviceConfiguration1.port = 1234;
        deviceConfiguration1.signalMappingId = "signalMapping1";

        deviceConfiguration2 = new DeviceConfiguration();
        deviceConfiguration2.id = "ESS2";
        deviceConfiguration2.host = "host2";
        deviceConfiguration2.port = 5678;
        deviceConfiguration2.signalMappingId = "signalMapping2";

        deviceConfiguration3 = new DeviceConfiguration();
        deviceConfiguration3.id = "ESS3";
        deviceConfiguration3.host = "host1";
        deviceConfiguration3.port = 5678;
        deviceConfiguration3.signalMappingId = "signalMapping_that_doesnt_exist";

        initSignalMappingRepositoryData();
        initDeviceConfigurationRepositoryData();
        initUserConfigurationRepositoryData();

    }

    @Test
    void saveDeviceConfigurationSuccessfullyIfUnique() {

        DeviceConfiguration deviceConfiguration5 = new DeviceConfiguration();
        deviceConfiguration5.id = "ESS5";
        deviceConfiguration5.host = "host5";
        deviceConfiguration5.port = 1234;
        deviceConfiguration5.signalMappingId = "signalMapping4";
        deviceConfiguration5.isEnabled = true;

        configService.saveDeviceConfiguration(deviceConfiguration5);

        Optional<DeviceConfiguration> retrievedConfiguration = deviceConfigurationRepository.findById("ESS5");

        Assertions.assertThat(retrievedConfiguration).isPresent();
        Assertions.assertThat(retrievedConfiguration.get()).usingRecursiveComparison().isEqualTo(deviceConfiguration5);

    }

    @Test
    void getDeviceConfigurations() {
        List<DeviceConfiguration> deviceConfigurationList = configService.getDeviceConfigurations();
        Assertions.assertThat(deviceConfigurationList).hasSize(INITIAL_NUMBER_OF_DEVICE_CONFIGS);
        Assertions.assertThat(deviceConfigurationList.get(2).id).isEqualTo("ESS1");
        Assertions.assertThat(deviceConfigurationList.get(2).host).isEqualTo("host1");
        Assertions.assertThat(deviceConfigurationList.get(2).port).isEqualTo(1234);
        Assertions.assertThat(deviceConfigurationList.get(2).signalMappingId).isEqualTo("signalMapping1");
    }

    @Test
    void retrieveExistingDeviceConfiguration()
            throws ExternalDeviceConfigurationException, UnknownExternalDeviceException {

        DeviceConfiguration retrievedConfiguration = configService.retrieveDeviceConfiguration("ESS1");
        Assertions.assertThat(retrievedConfiguration)
                .isNotNull()
                .usingRecursiveComparison().isEqualTo(deviceConfiguration1);

    }

    @Test
    void deleteExistingDeviceConfiguration()
            throws ExternalDeviceConfigurationException, UnknownExternalDeviceException {

        configService.deleteDeviceConfiguration("ESS1");

        // Check that the deleted device is gone from the repository
        Assertions.assertThat(deviceConfigurationRepository.findAll()).hasSize(INITIAL_NUMBER_OF_DEVICE_CONFIGS - 1);
        Optional<DeviceConfiguration> retrievedConfiguration = deviceConfigurationRepository.findById("ESS1");
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

        SignalMapping signalMapping3 = new SignalMapping();
        signalMapping3.id = "signalMapping3";
        signalMapping3.supportedSignals = new HashMap<String, Integer>();
        signalMapping3.supportedSignals.put("ALARM", 1);
        signalMapping3.supportedSignals.put("ACTION", 2);
        signalMapping3.supportedSignals.put("COMPLIANT", 3);
        signalMapping3.supportedSignals.put("INFORMATION", 4);

        configService.insertSignalMapping(signalMapping3);

        Assertions.assertThat(signalMappingRepository.findAll()).hasSize(INITIAL_NUMBER_OF_SIGNAL_MAPPINGS + 1);
        Optional<SignalMapping> retrievedConfiguration = signalMappingRepository.findById("signalMapping3");
        Assertions.assertThat(retrievedConfiguration).isPresent();
        Assertions.assertThat(retrievedConfiguration.get()).usingRecursiveComparison().isEqualTo(signalMapping3);

    }

    @Test
    void getSignalMappings() {
        List<SignalMapping> signalMappingsList = configService.getSignalMappings();
        Assertions.assertThat(signalMappingsList).hasSize(INITIAL_NUMBER_OF_SIGNAL_MAPPINGS);

        SignalMapping signalMapping1Result = signalMappingsList.get(0);
        SignalMapping signalMapping2Result = signalMappingsList.get(1);

        Assertions.assertThat(signalMapping1Result)
                .extracting("id", "supportedSignals")
                .containsExactly("signalMapping2", Map.of(
                        "ALARM", 5,
                        "ACTION", 6,
                        "COMPLIANT", 7));

        Assertions.assertThat(signalMapping2Result)
                .extracting("id", "supportedSignals")
                .containsExactly("signalMapping1", Map.of(
                        "ALARM", 1,
                        "ACTION", 2,
                        "COMPLIANT", 3,
                        "INFORMATION", 4));

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
        Assertions.assertThat(signalMappingRepository.findAll()).hasSize(INITIAL_NUMBER_OF_SIGNAL_MAPPINGS - 1);
        Optional<SignalMapping> retrievedConfiguration = signalMappingRepository.findById("signalMapping1");
        Assertions.assertThat(retrievedConfiguration).isEmpty();

        // Check that it is no longer listed as signal mapping in any device
        // configuration
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
        UserConfiguration userConfiguration6 = new UserConfiguration();
        userConfiguration6.userLogin = "user6";
        userConfiguration6.externalDeviceIds = Collections.singletonList("ESS6");

        configService.saveUserConfiguration(userConfiguration6);

        Assertions.assertThat(userConfigurationRepository.findAll()).hasSize(INITIAL_NUMBER_OF_USER_CONFIGS + 1);
        Optional<UserConfiguration> retrievedConfiguration = userConfigurationRepository.findById("user6");
        Assertions.assertThat(retrievedConfiguration).isPresent();
        Assertions.assertThat(retrievedConfiguration.get()).usingRecursiveComparison().isEqualTo(userConfiguration6);

    }

    @Test
    void updateUserConfiguration() {

        UserConfiguration userConfiguration1Update = new UserConfiguration();
        userConfiguration1Update.userLogin = "user1";
        userConfiguration1Update.externalDeviceIds = Collections.singletonList("someOtherDevice");

        configService.saveUserConfiguration(userConfiguration1Update);

        // Check that the existing item was updated.
        Assertions.assertThat(userConfigurationRepository.findAll()).hasSize(INITIAL_NUMBER_OF_USER_CONFIGS);
        Optional<UserConfiguration> retrievedConfiguration = userConfigurationRepository.findById("user1");

        Assertions.assertThat(retrievedConfiguration).isPresent();
        Assertions.assertThat(retrievedConfiguration.get()).usingRecursiveComparison()
                .isEqualTo(userConfiguration1Update);
    }

    @Test
    void getUserConfigurations() {
        List<UserConfiguration> userConfigurationList = configService.getUserConfigurations();
        Assertions.assertThat(userConfigurationList).hasSize(INITIAL_NUMBER_OF_USER_CONFIGS);
        Assertions.assertThat(userConfigurationList.get(4).userLogin).isEqualTo("user1");
        Assertions.assertThat(userConfigurationList.get(4).externalDeviceIds).containsExactlyInAnyOrder("ESS1");
        Assertions.assertThat(userConfigurationList.get(0).userLogin).isEqualTo("user5");
        Assertions.assertThat(userConfigurationList.get(0).externalDeviceIds).containsExactlyInAnyOrder("ESS1", "ESS2");
    }

    @Test
    void deleteExistingUserConfiguration() throws ExternalDeviceConfigurationException {

        configService.deleteUserConfiguration("user1", Optional.empty());

        // Check that the deleted device is gone from the repository
        Assertions.assertThat(userConfigurationRepository.findAll()).hasSize(INITIAL_NUMBER_OF_USER_CONFIGS - 1);
        Optional<UserConfiguration> retrievedConfiguration = userConfigurationRepository.findById("user1");
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
    void getResolvedConfigurationSuccessfully(String userLogin, String opFabSignalKey,
            List<ResolvedConfiguration> expected)
            throws ExternalDeviceConfigurationException, UnknownExternalDeviceException {
        List<ResolvedConfiguration> resolvedConfigurationListResult = configService
                .getResolvedConfigurationList(opFabSignalKey, userLogin);

        for (int i = 0; i < resolvedConfigurationListResult.size(); i++) {
            ResolvedConfiguration resolvedConfigurationResult = resolvedConfigurationListResult.get(i);
            ResolvedConfiguration expectedResolvedConfiguration = expected.get(i);
            Assertions.assertThat(resolvedConfigurationResult.getDeviceConfiguration().id)
                    .isEqualTo(expectedResolvedConfiguration.getDeviceConfiguration().id);
            Assertions.assertThat(resolvedConfigurationResult.getDeviceConfiguration().port)
                    .isEqualTo(expectedResolvedConfiguration.getDeviceConfiguration().port);
            Assertions.assertThat(resolvedConfigurationResult.getDeviceConfiguration().host)
                    .isEqualTo(expectedResolvedConfiguration.getDeviceConfiguration().host);
            Assertions.assertThat(resolvedConfigurationResult.getDeviceConfiguration().signalMappingId)
                    .isEqualTo(expectedResolvedConfiguration.getDeviceConfiguration().signalMappingId);
            Assertions.assertThat(resolvedConfigurationResult.getDeviceConfiguration().isEnabled)
                    .isEqualTo(expectedResolvedConfiguration.getDeviceConfiguration().isEnabled);
        }
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
    public void clean() {
        signalMappingRepository.deleteAll();
        deviceConfigurationRepository.deleteAll();
        userConfigurationRepository.deleteAll();
    }

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
                Arguments.of("user1", "ACTION",
                        Collections.singletonList(new ResolvedConfiguration(deviceConfiguration1, 2))),
                Arguments.of("user1", "INFORMATION",
                        Collections.singletonList(new ResolvedConfiguration(deviceConfiguration1, 4))),
                Arguments.of("user2", "ALARM",
                        Collections.singletonList(new ResolvedConfiguration(deviceConfiguration2, 5))),
                Arguments.of("user5", "ACTION", Arrays.asList(new ResolvedConfiguration(deviceConfiguration1, 2),
                        new ResolvedConfiguration(deviceConfiguration2, 6))));
    }

    private static Stream<Arguments> getResolvedConfigurationErrorParams() {
        return Stream.of(
                Arguments.of("user_with_no_config", "ACTION"),
                Arguments.of("user3", "ALARM"), // Configured signal mapping for device doesn't exist
                Arguments.of("user2", "INFORMATION") // This signal is not mapped in this user's configuration
        );
    }

    private static Stream<Arguments> retrieveConfigurationErrorParams() {
        return Stream.of(
                Arguments.of(""),
                null);
    }

}
