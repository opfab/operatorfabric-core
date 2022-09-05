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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opfab.externaldevices.configuration.externaldevices.ExternalDevicesWatchdogProperties;
import org.opfab.externaldevices.drivers.*;
import org.opfab.externaldevices.model.Device;
import org.opfab.externaldevices.model.DeviceConfigurationData;
import org.opfab.externaldevices.model.ResolvedConfiguration;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;


@ExtendWith(MockitoExtension.class)
class DevicesServiceShould {

    DevicesService devicesService;

    @Mock
    private ConfigService configService;

    @Mock
    private ExternalDeviceDriverFactory externalDeviceDriverFactory;

    @Mock
    private ExternalDevicesWatchdogProperties externalDevicesWatchdogProperties;

    private DeviceConfigurationData deviceConfigurationData;
    private DeviceConfigurationData deviceConfigurationData2;
    private final ExternalDeviceDriver externalDeviceDriver = mock(ExternalDeviceDriver.class);
    private final ExternalDeviceDriver externalDeviceDriver2 = mock(ExternalDeviceDriver.class);;

    private static final String TEST_DEVICE_ID = "testDeviceId";
    private static final String TEST_DEVICE_ID_2 = "testDeviceId2";
    public static final String FAKE_HOST = "123.45.67.1";

    @BeforeEach
    public void setUp() {
        devicesService = new DevicesService(configService, externalDeviceDriverFactory,
                externalDevicesWatchdogProperties);
        deviceConfigurationData = buildDeviceConfiguration(1234, TEST_DEVICE_ID, true);
        deviceConfigurationData2 = buildDeviceConfiguration(5678, TEST_DEVICE_ID_2, true);
    }

    @Test
    void shouldGetOneDeviceFromPool()
            throws ExternalDeviceDriverException, ExternalDeviceConfigurationException, UnknownHostException,
            ExternalDeviceAvailableException, UnknownExternalDeviceException {

        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);
        when(externalDeviceDriverFactory.create(FAKE_HOST, 1234)).thenReturn(externalDeviceDriver);
        when(externalDeviceDriver.getResolvedHost()).thenReturn(InetAddress.getByName(FAKE_HOST));
        when(externalDeviceDriver.getPort()).thenReturn(1234);
        when(externalDeviceDriver.isConnected()).thenReturn(true);

        // To add the device to the driver pool
        devicesService.connectDevice(TEST_DEVICE_ID);

        Optional<Device> result = devicesService.getDevice(TEST_DEVICE_ID);
        Assertions.assertThat(result).isPresent();
        Device device = result.get();
        Assertions.assertThat(device.getId()).isEqualTo(TEST_DEVICE_ID);
        Assertions.assertThat(device.getResolvedAddress()).isEqualTo("/" + FAKE_HOST);
        Assertions.assertThat(device.getPort()).isEqualTo(1234);
        Assertions.assertThat(device.getIsConnected()).isTrue();

    }

    @Test
    void shouldReturnEmptyIfDeviceDoesntExists() {
        Optional<Device> result = devicesService.getDevice("deviceThatIsNotInPool");
        Assertions.assertThat(result).isEmpty();

    }

    @Test
    void shouldGetAllDevicesFromPool()
            throws ExternalDeviceDriverException, ExternalDeviceConfigurationException, UnknownHostException,
            ExternalDeviceAvailableException, UnknownExternalDeviceException {

        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);
        when(externalDeviceDriverFactory.create(FAKE_HOST, 1234)).thenReturn(externalDeviceDriver);
        when(externalDeviceDriver.getResolvedHost()).thenReturn(InetAddress.getByName(FAKE_HOST));
        when(externalDeviceDriver.getPort()).thenReturn(1234);
        when(externalDeviceDriver.isConnected()).thenReturn(true);

        // To add the device to the driver pool
        devicesService.connectDevice(TEST_DEVICE_ID);

        List<Device> deviceList = devicesService.getDevices();
        Assertions.assertThat(deviceList).isNotNull().hasSize(1);
        Device device = deviceList.get(0);
        Assertions.assertThat(device.getId()).isEqualTo(TEST_DEVICE_ID);
        Assertions.assertThat(device.getResolvedAddress()).isEqualTo("/" + FAKE_HOST);
        Assertions.assertThat(device.getPort()).isEqualTo(1234);
        Assertions.assertThat(device.getIsConnected()).isTrue();

    }

    @Test
    void shouldReturnEmptyDevicesListWhenNoDevicesInPool() {
        List<Device> deviceList = devicesService.getDevices();
        Assertions.assertThat(deviceList).isNotNull().isEmpty();

    }
    
    @Test
    void shouldEnableAndDisableDevice()
            throws ExternalDeviceConfigurationException, UnknownExternalDeviceException, ExternalDeviceDriverException {
        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);
        when(externalDeviceDriverFactory.create(FAKE_HOST, 1234)).thenReturn(externalDeviceDriver);

        assertTrue(deviceConfigurationData.getIsEnabled());
        devicesService.disableDevice(TEST_DEVICE_ID);
        assertFalse(deviceConfigurationData.getIsEnabled());

        devicesService.enableDevice(TEST_DEVICE_ID);
        assertTrue(deviceConfigurationData.getIsEnabled());
    }

    @Test
    void shouldConnectWhenEnableDevice()
            throws ExternalDeviceConfigurationException, UnknownExternalDeviceException, ExternalDeviceDriverException {
        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);
        when(externalDeviceDriverFactory.create(FAKE_HOST, 1234)).thenReturn(externalDeviceDriver);

        devicesService.enableDevice(TEST_DEVICE_ID);
        assertTrue(deviceConfigurationData.getIsEnabled());
        verify(externalDeviceDriver, times(1)).connect();
    }

    @Test
    void shouldDisconnectWhenDisableDevice()
            throws ExternalDeviceConfigurationException, UnknownExternalDeviceException, ExternalDeviceDriverException {
        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);
        when(externalDeviceDriverFactory.create(FAKE_HOST, 1234)).thenReturn(externalDeviceDriver);

        devicesService.enableDevice(TEST_DEVICE_ID);
        devicesService.disableDevice(TEST_DEVICE_ID);
        verify(externalDeviceDriver, times(1)).disconnect();
    }

    @Test
    void shouldConnectAndDisconnectDevice()
            throws ExternalDeviceConfigurationException, ExternalDeviceDriverException,
            ExternalDeviceAvailableException, UnknownExternalDeviceException, UnknownHostException {
        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);
        when(externalDeviceDriverFactory.create(FAKE_HOST, 1234)).thenReturn(externalDeviceDriver);

        devicesService.connectDevice(TEST_DEVICE_ID);
        verify(externalDeviceDriver, times(1)).connect();

        devicesService.disconnectDevice(TEST_DEVICE_ID);
        verify(externalDeviceDriver, times(1)).disconnect();

        // In the case of a disconnect, there is no need to check configuration again
        verify(configService, times(1)).retrieveDeviceConfiguration(TEST_DEVICE_ID);

    }

    @Test
    void shouldNotBeAbleToConnectDisabledDevice()
            throws ExternalDeviceConfigurationException, ExternalDeviceDriverException, UnknownExternalDeviceException {
        deviceConfigurationData = buildDeviceConfiguration(1234, TEST_DEVICE_ID, false);
        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);

        try {
            // Disconnects one external device
            devicesService.connectDevice(TEST_DEVICE_ID);
            fail("Should not be able to connect disabled external device");
        } catch (ExternalDeviceAvailableException e) {
            // OK
        }

    }

    @Test
    void shouldSendOneSignalsWhenUserHasOneDevicesConfigured()
            throws ExternalDeviceException, ExternalDeviceConfigurationException, ExternalDeviceDriverException,
            ExternalDeviceAvailableException, UnknownHostException, UnknownExternalDeviceException {

        ResolvedConfiguration resolvedConfiguration1 = new ResolvedConfiguration(deviceConfigurationData, 3);
        when(configService.getResolvedConfigurationList("ALARM", "testUser"))
                .thenReturn(Arrays.asList(resolvedConfiguration1));

        when(externalDeviceDriverFactory.create(FAKE_HOST, 1234)).thenReturn(externalDeviceDriver);

        devicesService.sendSignalToAllDevicesOfUser("ALARM", "testUser");

        verify(configService, times(1)).getResolvedConfigurationList("ALARM", "testUser");
        verify(externalDeviceDriver, times(1)).connect();
        verify(externalDeviceDriver, times(1)).send(3);
    }

    @Test
    void shouldSendTwoSignalsWhenUserHasTwoDevicesConfigured()
            throws ExternalDeviceException, ExternalDeviceConfigurationException, ExternalDeviceDriverException,
            ExternalDeviceAvailableException, UnknownHostException, UnknownExternalDeviceException {

        ResolvedConfiguration resolvedConfiguration1 = new ResolvedConfiguration(deviceConfigurationData, 3);
        ResolvedConfiguration resolvedConfiguration2 = new ResolvedConfiguration(deviceConfigurationData2, 4);
        when(configService.getResolvedConfigurationList("ALARM", "testUser"))
                .thenReturn(Arrays.asList(resolvedConfiguration1, resolvedConfiguration2));

        when(externalDeviceDriverFactory.create(FAKE_HOST, 1234)).thenReturn(externalDeviceDriver);
        when(externalDeviceDriverFactory.create(FAKE_HOST, 5678)).thenReturn(externalDeviceDriver2);

        devicesService.sendSignalToAllDevicesOfUser("ALARM", "testUser");

        verify(configService, times(1)).getResolvedConfigurationList("ALARM", "testUser");
        verify(externalDeviceDriver, times(1)).connect();
        verify(externalDeviceDriver2, times(1)).connect();
        verify(externalDeviceDriver, times(1)).send(3);
        verify(externalDeviceDriver2, times(1)).send(4);
    }

    @Test
    void shouldNotReconnectDevicesBeforeSendingSignalIfAlreadyConnected()
            throws ExternalDeviceException, ExternalDeviceConfigurationException, ExternalDeviceDriverException,
            ExternalDeviceAvailableException, UnknownHostException, UnknownExternalDeviceException {

        ResolvedConfiguration resolvedConfiguration1 = new ResolvedConfiguration(deviceConfigurationData, 3);
        ResolvedConfiguration resolvedConfiguration2 = new ResolvedConfiguration(deviceConfigurationData2, 4);
        when(configService.getResolvedConfigurationList("ALARM", "testUser"))
                .thenReturn(Arrays.asList(resolvedConfiguration1, resolvedConfiguration2));

        when(externalDeviceDriverFactory.create(FAKE_HOST, 1234)).thenReturn(externalDeviceDriver);
        when(externalDeviceDriverFactory.create(FAKE_HOST, 5678)).thenReturn(externalDeviceDriver2);

        when(externalDeviceDriver.isConnected()).thenReturn(true);
        when(externalDeviceDriver2.isConnected()).thenReturn(true);

        devicesService.sendSignalToAllDevicesOfUser("ALARM", "testUser");

        verify(configService, times(1)).getResolvedConfigurationList("ALARM", "testUser");
        verify(externalDeviceDriver, times(0)).connect();
        verify(externalDeviceDriver2, times(0)).connect();
        verify(externalDeviceDriver, times(1)).send(3);
        verify(externalDeviceDriver2, times(1)).send(4);

    }

    @Test
    void shouldNotSendSignalIfDeviceIsDisabled()
            throws ExternalDeviceException, ExternalDeviceConfigurationException, ExternalDeviceDriverException,
            ExternalDeviceAvailableException, UnknownHostException, UnknownExternalDeviceException {

        deviceConfigurationData = buildDeviceConfiguration(1234, TEST_DEVICE_ID, false);
        ResolvedConfiguration resolvedConfiguration1 = new ResolvedConfiguration(deviceConfigurationData, 3);
        when(configService.getResolvedConfigurationList("ALARM", "testUser"))
                .thenReturn(Arrays.asList(resolvedConfiguration1));

        try {
            devicesService.sendSignalToAllDevicesOfUser("ALARM", "testUser");
            fail("Should not be able to connect disabled external device");
        } catch (ExternalDeviceException e) {
            // OK
        }
        verify(configService, times(1)).getResolvedConfigurationList("ALARM", "testUser");
        verify(externalDeviceDriver, times(0)).send(3);
    }

    @Test
    void shouldSendOneSignalWhenUserHasTwoDevicesConfiguredButOneDisable()
            throws ExternalDeviceException, ExternalDeviceConfigurationException, ExternalDeviceDriverException,
            ExternalDeviceAvailableException, UnknownHostException, UnknownExternalDeviceException {

        deviceConfigurationData = buildDeviceConfiguration(1234, TEST_DEVICE_ID, false);
        ResolvedConfiguration resolvedConfiguration1 = new ResolvedConfiguration(deviceConfigurationData, 3);
        ResolvedConfiguration resolvedConfiguration2 = new ResolvedConfiguration(deviceConfigurationData2, 4);
        when(configService.getResolvedConfigurationList("ALARM", "testUser"))
                .thenReturn(Arrays.asList(resolvedConfiguration1, resolvedConfiguration2));
        when(externalDeviceDriverFactory.create(FAKE_HOST, 5678)).thenReturn(externalDeviceDriver2);

        try {
            devicesService.sendSignalToAllDevicesOfUser("ALARM", "testUser");
            fail("Should not be able to connect disabled external device");
        } catch (ExternalDeviceException e) {
            // OK
        }

        verify(configService, times(1)).getResolvedConfigurationList("ALARM", "testUser");
        verify(externalDeviceDriver, times(0)).connect();
        verify(externalDeviceDriver2, times(1)).connect();
        verify(externalDeviceDriver, times(0)).send(3);
        verify(externalDeviceDriver2, times(1)).send(4);
    }

    @Test
    void shouldTryToSendTwoSignalsAndThrowExceptionWhenUserHasTwoDevicesConfiguredButOneIsNotResponding()
            throws ExternalDeviceException, ExternalDeviceConfigurationException, ExternalDeviceDriverException,
            ExternalDeviceAvailableException, UnknownHostException, UnknownExternalDeviceException {
        ResolvedConfiguration resolvedConfiguration1 = new ResolvedConfiguration(deviceConfigurationData, 3);
        ResolvedConfiguration resolvedConfiguration2 = new ResolvedConfiguration(deviceConfigurationData2, 4);
        when(configService.getResolvedConfigurationList("ALARM", "testUser"))
                .thenReturn(Arrays.asList(resolvedConfiguration1, resolvedConfiguration2));

        when(externalDeviceDriverFactory.create(FAKE_HOST, 1234)).thenReturn(externalDeviceDriver);
        when(externalDeviceDriverFactory.create(FAKE_HOST, 5678)).thenReturn(externalDeviceDriver2);
        doThrow(ExternalDeviceDriverException.class).when(externalDeviceDriver).send(3);

        try {
            devicesService.sendSignalToAllDevicesOfUser("ALARM", "testUser");
            fail("Should not be able to connect to external device");
        } catch (ExternalDeviceException e) {
            // OK
        }

        verify(configService, times(1)).getResolvedConfigurationList("ALARM", "testUser");
        verify(externalDeviceDriver, times(1)).connect();
        verify(externalDeviceDriver2, times(1)).connect();
        verify(externalDeviceDriver, times(1)).send(3);
        verify(externalDeviceDriver2, times(1)).send(4);
    }

    @Test
    void shouldSendWatchdogToDeviceWhenDeviceIsConnected()
            throws ExternalDeviceConfigurationException, ExternalDeviceDriverException,
            ExternalDeviceAvailableException, UnknownExternalDeviceException, UnknownHostException {

        final int CUSTOM_SIGNAL_ID = 4;

        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);
        when(externalDeviceDriverFactory.create(FAKE_HOST, 1234)).thenReturn(externalDeviceDriver);
        when(externalDevicesWatchdogProperties.getEnabled()).thenReturn(true);
        when(externalDevicesWatchdogProperties.getSignalId()).thenReturn(CUSTOM_SIGNAL_ID);

        devicesService.connectDevice(TEST_DEVICE_ID); // Necessary to add driver to pool

        when(externalDeviceDriver.isConnected()).thenReturn(true);
        devicesService.sendWatchdog();
        verify(externalDeviceDriver, times(1)).send(CUSTOM_SIGNAL_ID);

    }

    @Test
    void shouldNotSendWatchdogToDeviceWhenDeviceIsNotConnected()
            throws ExternalDeviceConfigurationException, ExternalDeviceDriverException,
            ExternalDeviceAvailableException, UnknownExternalDeviceException, UnknownHostException {

        final int CUSTOM_SIGNAL_ID = 4;

        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);
        when(externalDeviceDriverFactory.create(FAKE_HOST, 1234)).thenReturn(externalDeviceDriver);
        when(externalDevicesWatchdogProperties.getEnabled()).thenReturn(true);

        devicesService.connectDevice(TEST_DEVICE_ID); // Necessary to add driver to pool
        when(externalDeviceDriver.isConnected()).thenReturn(false);
        devicesService.sendWatchdog();
        verify(externalDeviceDriver, times(0)).send(CUSTOM_SIGNAL_ID);

    }

    @Test
    void shouldSendWatchdogToTwoDevicesWhenTwoDevicesWithDifferentIPPortAreConnected()
            throws ExternalDeviceConfigurationException, ExternalDeviceDriverException,
            ExternalDeviceAvailableException, UnknownExternalDeviceException, UnknownHostException {

        final int CUSTOM_SIGNAL_ID = 4;

        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);
        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID_2)).thenReturn(deviceConfigurationData2);
        when(externalDeviceDriverFactory.create(FAKE_HOST, 1234)).thenReturn(externalDeviceDriver);
        when(externalDeviceDriverFactory.create(FAKE_HOST, 5678)).thenReturn(externalDeviceDriver2);
        when(externalDevicesWatchdogProperties.getEnabled()).thenReturn(true);
        when(externalDevicesWatchdogProperties.getSignalId()).thenReturn(CUSTOM_SIGNAL_ID);
        when(externalDeviceDriver.isConnected()).thenReturn(true);
        when(externalDeviceDriver2.isConnected()).thenReturn(true);
        when(externalDeviceDriver.getPort()).thenReturn(1234);
        when(externalDeviceDriver2.getPort()).thenReturn(5678);

        devicesService.connectDevice(TEST_DEVICE_ID); // Necessary to add driver to pool
        devicesService.connectDevice(TEST_DEVICE_ID_2); // Necessary to add driver to pool

        devicesService.sendWatchdog();
        verify(externalDeviceDriver, times(1)).send(CUSTOM_SIGNAL_ID);
        verify(externalDeviceDriver2, times(1)).send(CUSTOM_SIGNAL_ID);
    }

    @Test
    void shouldSendWatchdogToOneDevicesWhenTwoDevicesWithSameIPPortAreConnected()
            throws ExternalDeviceConfigurationException, ExternalDeviceDriverException,
            ExternalDeviceAvailableException, UnknownExternalDeviceException, UnknownHostException {

        final int CUSTOM_SIGNAL_ID = 4;

        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);
        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID_2)).thenReturn(deviceConfigurationData2);
        when(externalDeviceDriverFactory.create(FAKE_HOST, 1234)).thenReturn(externalDeviceDriver);
        when(externalDeviceDriverFactory.create(FAKE_HOST, 5678)).thenReturn(externalDeviceDriver2);
        when(externalDevicesWatchdogProperties.getEnabled()).thenReturn(true);
        when(externalDevicesWatchdogProperties.getSignalId()).thenReturn(CUSTOM_SIGNAL_ID);
        when(externalDeviceDriver.isConnected()).thenReturn(true);
        when(externalDeviceDriver2.isConnected()).thenReturn(true);
        when(externalDeviceDriver.getPort()).thenReturn(1234);
        when(externalDeviceDriver2.getPort()).thenReturn(1234);

        devicesService.connectDevice(TEST_DEVICE_ID); // Necessary to add driver to pool
        devicesService.connectDevice(TEST_DEVICE_ID_2); // Necessary to add driver to pool

        devicesService.sendWatchdog();
        verify(externalDeviceDriver, times(1)).send(CUSTOM_SIGNAL_ID);
        verify(externalDeviceDriver2, times(0)).send(CUSTOM_SIGNAL_ID);
    }

    @Test
    void shouldSendWatchdogToOnlyOneDevicesWhenTwoDevicesAreConfiguredButOnlyOneConnected()
            throws ExternalDeviceConfigurationException, ExternalDeviceDriverException,
            ExternalDeviceAvailableException, UnknownExternalDeviceException, UnknownHostException {

        final int CUSTOM_SIGNAL_ID = 4;

        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);
        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID_2)).thenReturn(deviceConfigurationData2);
        when(externalDeviceDriverFactory.create(FAKE_HOST, 1234)).thenReturn(externalDeviceDriver);
        when(externalDeviceDriverFactory.create(FAKE_HOST, 5678)).thenReturn(externalDeviceDriver2);
        when(externalDevicesWatchdogProperties.getEnabled()).thenReturn(true);
        when(externalDevicesWatchdogProperties.getSignalId()).thenReturn(CUSTOM_SIGNAL_ID);
        when(externalDeviceDriver.isConnected()).thenReturn(true);
        when(externalDeviceDriver2.isConnected()).thenReturn(false);
        when(externalDeviceDriver.getPort()).thenReturn(1234);
        when(externalDeviceDriver2.getPort()).thenReturn(5678);

        devicesService.connectDevice(TEST_DEVICE_ID); // Necessary to add driver to pool
        devicesService.connectDevice(TEST_DEVICE_ID_2); // Necessary to add driver to pool

        devicesService.sendWatchdog();
        verify(externalDeviceDriver, times(1)).send(CUSTOM_SIGNAL_ID);
        verify(externalDeviceDriver2, times(0)).send(CUSTOM_SIGNAL_ID);
    }

    @Test
    void shouldReconnectDisconnectedDevices()
            throws ExternalDeviceConfigurationException, ExternalDeviceDriverException,
            ExternalDeviceAvailableException, UnknownExternalDeviceException, UnknownHostException {

        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);
        when(externalDeviceDriverFactory.create(FAKE_HOST, 1234)).thenReturn(externalDeviceDriver);
        when(externalDevicesWatchdogProperties.getEnabled()).thenReturn(true);

        devicesService.connectDevice(TEST_DEVICE_ID); // Necessary to add driver to pool
        devicesService.disconnectDevice(TEST_DEVICE_ID);
        clearInvocations(externalDeviceDriver);

        devicesService.reconnectDisconnectedDevices();
        verify(externalDeviceDriver, times(1)).connect();

    }

    @Test
    void shouldNotReconnectConnectedDevices()
            throws ExternalDeviceConfigurationException, ExternalDeviceDriverException,
            ExternalDeviceAvailableException, UnknownExternalDeviceException, UnknownHostException {

        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);
        when(externalDeviceDriverFactory.create(FAKE_HOST, 1234)).thenReturn(externalDeviceDriver);
        when(externalDevicesWatchdogProperties.getEnabled()).thenReturn(true);

        devicesService.connectDevice(TEST_DEVICE_ID);
        when(externalDeviceDriver.isConnected()).thenReturn(true);
        clearInvocations(externalDeviceDriver);

        devicesService.reconnectDisconnectedDevices();
        verify(externalDeviceDriver, times(0)).connect();

    }


    @Test
    void shouldRemoveDevice()
            throws ExternalDeviceConfigurationException, UnknownExternalDeviceException, ExternalDeviceDriverException {
        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);
        when(externalDeviceDriverFactory.create(FAKE_HOST, 1234)).thenReturn(externalDeviceDriver);

        devicesService.enableDevice(TEST_DEVICE_ID);
        assertTrue(deviceConfigurationData.getIsEnabled());
        devicesService.removeDevice(TEST_DEVICE_ID);
        Optional<Device> result = devicesService.getDevice(TEST_DEVICE_ID);
        Assertions.assertThat(result).isEmpty();
        verify(externalDeviceDriver, times(1)).disconnect();
    }

    private DeviceConfigurationData buildDeviceConfiguration(int port, String deviceId, boolean isEnabled) {
        return DeviceConfigurationData.builder()
                .id(deviceId)
                .host(FAKE_HOST)
                .port(port)
                .signalMappingId("testSignalMapping")
                .isEnabled(isEnabled)
                .build();
    }

}
