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
import org.opfab.externaldevices.drivers.ExternalDeviceAvailableException;
import org.opfab.externaldevices.drivers.ExternalDeviceConfigurationException;
import org.opfab.externaldevices.drivers.ExternalDeviceDriver;
import org.opfab.externaldevices.drivers.ExternalDeviceDriverException;
import org.opfab.externaldevices.drivers.ExternalDeviceDriverFactory;
import org.opfab.externaldevices.drivers.UnknownExternalDeviceException;
import org.opfab.externaldevices.model.Device;
import org.opfab.externaldevices.model.DeviceConfiguration;
import org.opfab.externaldevices.model.DeviceConfigurationData;
import org.opfab.externaldevices.model.ResolvedConfiguration;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.Mockito.anyInt;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DevicesServiceShould {

    // We use IP addresses for hosts rather than names for tests because otherwise we would need to mock the static
    // method InetAddress.getByName.
    // This also means that we can't test the part of the code that handles a change in the resolved ip after a driver
    // is created.

    DevicesService devicesService;

    @Mock
    private ConfigService configService;

    @Mock
    private ExternalDeviceDriverFactory externalDeviceDriverFactory;

    @Mock
    private ExternalDevicesWatchdogProperties externalDevicesWatchdogProperties;

    private DeviceConfigurationData deviceConfigurationData;
    private DeviceConfigurationData deviceConfigurationData2;
    private final ExternalDeviceDriver externalDeviceDriver = mock(ExternalDeviceDriver.class);;

    private static final String TEST_DEVICE_ID = "testDeviceId";
    private static final String TEST_DEVICE_ID_2 = "testDeviceId2";
    public static final String FAKE_HOST = "123.45.67.1";

    @BeforeEach
    public void setUp() {
        devicesService = new DevicesService(configService,externalDeviceDriverFactory,externalDevicesWatchdogProperties);
        deviceConfigurationData = buildDeviceConfiguration(1234, TEST_DEVICE_ID, true);
        deviceConfigurationData2 = buildDeviceConfiguration(5678, TEST_DEVICE_ID_2, true);
    }

    @Test
    void shouldEnableAndDisableDevice() throws ExternalDeviceConfigurationException, UnknownExternalDeviceException {
        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);

        assertTrue(deviceConfigurationData.getIsEnabled());
        devicesService.disableDevice(TEST_DEVICE_ID);
        assertFalse(deviceConfigurationData.getIsEnabled());

        devicesService.enableDevice(TEST_DEVICE_ID);
        assertTrue(deviceConfigurationData.getIsEnabled());
    }

    @Test
    void connectDeviceIfCorrectConfig() throws ExternalDeviceConfigurationException, UnknownHostException, ExternalDeviceDriverException, ExternalDeviceAvailableException, UnknownExternalDeviceException {

        sharedExternalDriverMockConfiguration();
        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);


        // Call the connectDevice method twice on the same device
        devicesService.connectDevice(TEST_DEVICE_ID);
        devicesService.connectDevice(TEST_DEVICE_ID);

        // The corresponding configuration should have been retrieved each time (to check for updates)
        verify(configService,times(2)).retrieveDeviceConfiguration(TEST_DEVICE_ID);

        // But the corresponding driver should only have been created once (because for the second call it's already in the driver pool)
        verify(externalDeviceDriverFactory,times(1)).create(FAKE_HOST,1234);

    }

    @Test
    void connectDeviceWhenConfigIsUpdated() throws ExternalDeviceConfigurationException, UnknownHostException, ExternalDeviceDriverException, ExternalDeviceAvailableException, UnknownExternalDeviceException {

        DeviceConfigurationData updatedDeviceConfigurationData = buildDeviceConfiguration(5678, TEST_DEVICE_ID, true);

        ExternalDeviceDriver initialExternalDeviceDriver = mock(ExternalDeviceDriver.class);
        ExternalDeviceDriver updatedExternalDeviceDriver = mock(ExternalDeviceDriver.class);

        // Mock configuration
        when(initialExternalDeviceDriver.getResolvedHost()).thenReturn(InetAddress.getByName(FAKE_HOST));
        when(initialExternalDeviceDriver.getPort()).thenReturn(1234);
        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);
        when(externalDeviceDriverFactory.create(FAKE_HOST,1234)).thenReturn(initialExternalDeviceDriver);
        when(externalDeviceDriverFactory.create(FAKE_HOST,5678)).thenReturn(updatedExternalDeviceDriver);

        // Call the connectDevice method twice on the same device, but the configuration changes after the first call
        devicesService.connectDevice(TEST_DEVICE_ID);
        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(updatedDeviceConfigurationData);
        devicesService.connectDevice(TEST_DEVICE_ID);

        // The corresponding configuration should have been retrieved each time (to check for updates)
        verify(configService,times(2)).retrieveDeviceConfiguration(TEST_DEVICE_ID);

        // Driver creation should happen twice
        verify(externalDeviceDriverFactory,times(1)).create(FAKE_HOST,1234);
        verify(externalDeviceDriverFactory,times(1)).create(FAKE_HOST,5678);

    }

    @Test
    void connectAndDisconnectDriverAssociatedWithDevice() throws ExternalDeviceConfigurationException, ExternalDeviceDriverException, ExternalDeviceAvailableException, UnknownExternalDeviceException, UnknownHostException {

        // Mock configuration
        sharedExternalDriverMockConfiguration();
        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);

        devicesService.connectDevice(TEST_DEVICE_ID);
        verify(externalDeviceDriver,times(1)).connect();

        devicesService.disconnectDevice(TEST_DEVICE_ID);
        verify(externalDeviceDriver,times(1)).disconnect();

        // In the case of a disconnect, there is no need to check configuration again
        verify(configService,times(1)).retrieveDeviceConfiguration(TEST_DEVICE_ID);

    }

    @Test
    void shouldNotBeAbleToConnectDisabledDevice() throws ExternalDeviceConfigurationException, ExternalDeviceDriverException, UnknownExternalDeviceException {
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
    void sendAppropriateSignalIfCorrectConfiguration() throws ExternalDeviceConfigurationException, ExternalDeviceDriverException, ExternalDeviceAvailableException, UnknownExternalDeviceException, UnknownHostException {
        mockResolvedConfigurations();

        ExternalDeviceDriver externalDeviceDriver1 = mockExternalDriver(1234);
        ExternalDeviceDriver externalDeviceDriver2 = mockExternalDriver(5678);

        devicesService.sendSignalToAllDevicesOfUser("ALARM", "testUser");

        verify(configService, times(1)).getResolvedConfigurationList("ALARM", "testUser");
        verify(externalDeviceDriver1, times(1)).send(3);
        verify(externalDeviceDriver2, times(1)).send(4);
    }

    @Test
    void shouldReconnectDisconnectedDevicesBeforeSendingSignal() throws ExternalDeviceConfigurationException, ExternalDeviceDriverException, ExternalDeviceAvailableException, UnknownExternalDeviceException, UnknownHostException {
        mockResolvedConfigurations();

        ExternalDeviceDriver externalDeviceDriver1 = mockExternalDriver(1234);

        ExternalDeviceDriver externalDeviceDriver2 = mockExternalDriver(5678);
        when(externalDeviceDriver2.getResolvedHost()).thenReturn(InetAddress.getByName(FAKE_HOST));

        // Add the device to the pool
        connectAndDisconnectDevice(deviceConfigurationData2);

        verify(externalDeviceDriver2,times(1)).connect();
        devicesService.sendSignalToAllDevicesOfUser("ALARM", "testUser");

        verify(configService,times(1)).getResolvedConfigurationList("ALARM", "testUser");
        verify(externalDeviceDriver2,times(2)).connect();
        verify(externalDeviceDriver1,times(1)).send(3);
        verify(externalDeviceDriver2,times(1)).send(4);
    }

    @Test
    void sendWatchdogToConnectedDevicesSignalIfEnabled() throws ExternalDeviceConfigurationException, ExternalDeviceDriverException, ExternalDeviceAvailableException, UnknownExternalDeviceException, UnknownHostException {

        final int CUSTOM_SIGNAL_ID = 4;


        // Mock configuration
        sharedExternalDriverMockConfiguration();
        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);
        when(externalDevicesWatchdogProperties.getEnabled()).thenReturn(true);
        when(externalDevicesWatchdogProperties.getSignalId()).thenReturn(CUSTOM_SIGNAL_ID);

        devicesService.connectDevice(TEST_DEVICE_ID); //Necessary to add driver to pool

        //If connected
        when(externalDeviceDriver.isConnected()).thenReturn(true);
        devicesService.sendWatchdog();
        verify(externalDeviceDriver,times(1)).send(CUSTOM_SIGNAL_ID);
        clearInvocations(externalDeviceDriver);

        //If not connected
        when(externalDeviceDriver.isConnected()).thenReturn(false);
        devicesService.sendWatchdog();
        verify(externalDeviceDriver,times(0)).send(CUSTOM_SIGNAL_ID);

    }

    @Test
    void notSendWatchdogSignalToDevicesIfWatchdogIsDisabled() throws ExternalDeviceConfigurationException, ExternalDeviceDriverException, ExternalDeviceAvailableException, UnknownExternalDeviceException, UnknownHostException {

        // Mock configuration
        sharedExternalDriverMockConfiguration();
        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);
        when(externalDevicesWatchdogProperties.getEnabled()).thenReturn(false);

        devicesService.connectDevice(TEST_DEVICE_ID); //Necessary to add driver to pool

        devicesService.sendWatchdog();
        verify(externalDeviceDriver,times(0)).send(anyInt());
    }

    @Test
    void notSendWatchdogSignalToDevicesIfDeviceIsDisabled() throws ExternalDeviceConfigurationException, ExternalDeviceDriverException, ExternalDeviceAvailableException, UnknownExternalDeviceException, UnknownHostException {

        // Mock configuration
        sharedExternalDriverMockConfiguration();
        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);
        when(externalDevicesWatchdogProperties.getEnabled()).thenReturn(true);
        devicesService.enableDevice(TEST_DEVICE_ID);

        devicesService.connectDevice(TEST_DEVICE_ID); //Necessary to add driver to pool
        when(externalDeviceDriver.isConnected()).thenReturn(true);

        devicesService.disableDevice(TEST_DEVICE_ID);
        devicesService.sendWatchdog();
        verify(externalDeviceDriver,times(0)).send(anyInt());
    }

    @Test
    void shouldNotSendWatchdogSignalToDisconnectedDevice() throws ExternalDeviceConfigurationException, ExternalDeviceDriverException, UnknownExternalDeviceException, ExternalDeviceAvailableException, UnknownHostException {
        // Mock configuration
        sharedExternalDriverMockConfiguration();
        when(externalDevicesWatchdogProperties.getEnabled()).thenReturn(true);

        connectAndDisconnectDevice(deviceConfigurationData);

        devicesService.sendWatchdog();
        verify(externalDeviceDriver,times(0)).send(anyInt());

    }

    @Test
    void shouldTryToReconnectDisconnectedDevice() throws ExternalDeviceConfigurationException, ExternalDeviceDriverException, UnknownExternalDeviceException, ExternalDeviceAvailableException, UnknownHostException {
        // Mock configuration
        sharedExternalDriverMockConfiguration();
        when(externalDeviceDriver.getResolvedHost()).thenReturn(InetAddress.getByName(FAKE_HOST));
        when(configService.getDeviceConfigurations()).thenReturn(Collections.singletonList(deviceConfigurationData));

        connectAndDisconnectDevice(deviceConfigurationData);

        devicesService.reconnectDisconnectedDevices();
        verify(externalDeviceDriver,times(2)).connect();
    }

    @Test
    void shouldNotTryToReconnectAlreadyConnectedDevice() throws ExternalDeviceConfigurationException, ExternalDeviceDriverException, UnknownExternalDeviceException, ExternalDeviceAvailableException, UnknownHostException {
        // Mock configuration
        sharedExternalDriverMockConfiguration();
        when(externalDeviceDriver.getResolvedHost()).thenReturn(InetAddress.getByName(FAKE_HOST));
        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);

        devicesService.connectDevice(TEST_DEVICE_ID);
        when(externalDeviceDriver.isConnected()).thenReturn(true);

        devicesService.reconnectDisconnectedDevices();
        verify(externalDeviceDriver,times(1)).connect();
    }

    @Test
    void shouldNotTryToReconnectDisconnectedAndDisabledDevice() throws ExternalDeviceConfigurationException, ExternalDeviceDriverException, UnknownExternalDeviceException, ExternalDeviceAvailableException, UnknownHostException {
        // Mock configuration
        sharedExternalDriverMockConfiguration();
        when(externalDeviceDriver.getResolvedHost()).thenReturn(InetAddress.getByName(FAKE_HOST));

        connectAndDisconnectDevice(deviceConfigurationData);
        deviceConfigurationData.setIsEnabled(false);

        devicesService.reconnectDisconnectedDevices();
        verify(externalDeviceDriver,times(1)).connect();
    }

    @Test
    void shouldNotTryToReconnectSeveralTimesTheSameHostAndPort() throws ExternalDeviceConfigurationException, ExternalDeviceDriverException, UnknownExternalDeviceException, ExternalDeviceAvailableException, UnknownHostException {
        deviceConfigurationData = buildDeviceConfiguration(1234, TEST_DEVICE_ID, true);
        deviceConfigurationData2 = buildDeviceConfiguration(1234, TEST_DEVICE_ID_2, true);
        deviceConfigurationData2.setSignalMappingId("testSignalMapping2");

        // Mock configuration
        sharedExternalDriverMockConfiguration();
        when(externalDeviceDriver.getResolvedHost()).thenReturn(InetAddress.getByName(FAKE_HOST));
        when(configService.getDeviceConfigurations()).thenReturn(Arrays.asList(deviceConfigurationData, deviceConfigurationData2));

        // Necessary to add devices in the pool
        connectAndDisconnectDevice(deviceConfigurationData);
        connectAndDisconnectDevice(deviceConfigurationData2);

        devicesService.reconnectDisconnectedDevices();
        verify(externalDeviceDriver,times(3)).connect();
    }

    @Test
    void shouldNotTryToReconnectSeveralTimesTheSameHostAndPortEvenIfFirstAttemptFails() throws ExternalDeviceConfigurationException, ExternalDeviceDriverException, UnknownExternalDeviceException, ExternalDeviceAvailableException, UnknownHostException {
        deviceConfigurationData = buildDeviceConfiguration(1234, TEST_DEVICE_ID, true);
        deviceConfigurationData2 = buildDeviceConfiguration(1234, TEST_DEVICE_ID_2, true);
        deviceConfigurationData2.setSignalMappingId("testSignalMapping2");

        // Mock configuration
        sharedExternalDriverMockConfiguration();
        when(externalDeviceDriver.getResolvedHost()).thenReturn(InetAddress.getByName(FAKE_HOST));
        when(configService.getDeviceConfigurations()).thenReturn(Arrays.asList(deviceConfigurationData, deviceConfigurationData2));

        // Necessary to add devices in the pool
        connectAndDisconnectDevice(deviceConfigurationData);
        connectAndDisconnectDevice(deviceConfigurationData2);

        doThrow(ExternalDeviceDriverException.class).when(externalDeviceDriver).connect();
        devicesService.reconnectDisconnectedDevices();
        verify(externalDeviceDriver,times(3)).connect();
    }

    @Test
    void shouldTryToReconnectAllPortsOnSameHost() throws ExternalDeviceConfigurationException, ExternalDeviceDriverException, UnknownExternalDeviceException, ExternalDeviceAvailableException, UnknownHostException {
        deviceConfigurationData2.setSignalMappingId("testSignalMapping2");

        // Mock configuration
        sharedExternalDriverMockConfiguration();
        when(externalDeviceDriver.getResolvedHost()).thenReturn(InetAddress.getByName(FAKE_HOST));
        when(externalDeviceDriver.getPort()).thenReturn(1234);

        ExternalDeviceDriver externalDeviceDriver2 = mockExternalDriver(5678);
        when(externalDeviceDriver2.getResolvedHost()).thenReturn(InetAddress.getByName(FAKE_HOST));

        when(configService.getDeviceConfigurations()).thenReturn(Arrays.asList(deviceConfigurationData, deviceConfigurationData2));

        // Necessary to add devices in the pool
        connectAndDisconnectDevice(deviceConfigurationData);
        connectAndDisconnectDevice(deviceConfigurationData2);

        devicesService.reconnectDisconnectedDevices();
        verify(externalDeviceDriver,times(2)).connect();
        verify(externalDeviceDriver2,times(2)).connect();
    }

    @Test
    void shouldTryToConnectDevicesWhenAddedToConfig() throws ExternalDeviceConfigurationException, ExternalDeviceDriverException, UnknownExternalDeviceException, ExternalDeviceAvailableException, UnknownHostException {
        // Mock configuration
        sharedExternalDriverMockConfiguration();
        when(externalDeviceDriver.getResolvedHost()).thenReturn(InetAddress.getByName(FAKE_HOST));
        when(configService.getDeviceConfigurations()).thenReturn(Collections.singletonList(deviceConfigurationData));

        verify(externalDeviceDriver,times(0)).connect();
        devicesService.reconnectDisconnectedDevices();
        verify(externalDeviceDriver,times(1)).connect();
    }

    @Test
    void getDeviceIfExists() throws ExternalDeviceDriverException, ExternalDeviceConfigurationException, UnknownHostException, ExternalDeviceAvailableException, UnknownExternalDeviceException {

        sharedExternalDriverMockConfiguration();
        when(externalDeviceDriver.isConnected()).thenReturn(true);
        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);

        // To add the device to the driver pool
        devicesService.connectDevice(TEST_DEVICE_ID);

        Optional<Device> result = devicesService.getDevice(TEST_DEVICE_ID);
        Assertions.assertThat(result).isPresent();
        Device device = result.get();
        Assertions.assertThat(device.getId()).isEqualTo(TEST_DEVICE_ID);
        Assertions.assertThat(device.getResolvedAddress()).isEqualTo("/123.45.67.1");
        Assertions.assertThat(device.getPort()).isEqualTo(1234);
        Assertions.assertThat(device.getIsConnected()).isTrue();

    }

    @Test
    void returnEmptyIfDeviceDoesntExists() {

        Optional<Device> result = devicesService.getDevice("deviceThatIsNotInPool");
        Assertions.assertThat(result).isEmpty();

    }

    @Test
    void getDevices() throws ExternalDeviceDriverException, ExternalDeviceConfigurationException, UnknownHostException, ExternalDeviceAvailableException, UnknownExternalDeviceException {

        sharedExternalDriverMockConfiguration();
        when(externalDeviceDriver.isConnected()).thenReturn(true);
        when(configService.retrieveDeviceConfiguration(TEST_DEVICE_ID)).thenReturn(deviceConfigurationData);

        // To add the device to the driver pool
        devicesService.connectDevice(TEST_DEVICE_ID);

        List<Device> deviceList = devicesService.getDevices();
        Assertions.assertThat(deviceList).isNotNull().hasSize(1);
        Device device = deviceList.get(0);
        Assertions.assertThat(device.getId()).isEqualTo(TEST_DEVICE_ID);
        Assertions.assertThat(device.getResolvedAddress()).isEqualTo("/123.45.67.1");
        Assertions.assertThat(device.getPort()).isEqualTo(1234);
        Assertions.assertThat(device.getIsConnected()).isTrue();

    }

    @Test
    void returnEmptyDevicesList() {

        List<Device> deviceList = devicesService.getDevices();
        Assertions.assertThat(deviceList).isNotNull().isEmpty();

    }


    /** This method contains the basic configuration of mock ConfigService, ExternalDeviceDriverFactory and
     * ExternalDeviceDriver instances that is common to several tests.
     * */
    private void sharedExternalDriverMockConfiguration() throws UnknownHostException, ExternalDeviceDriverException {
        // Mock configuration
        when(externalDeviceDriverFactory.create(FAKE_HOST, 1234)).thenReturn(externalDeviceDriver);
        when(externalDeviceDriver.getResolvedHost()).thenReturn(InetAddress.getByName(FAKE_HOST));
        when(externalDeviceDriver.getPort()).thenReturn(1234);
    }

    private void connectAndDisconnectDevice(DeviceConfiguration deviceConfiguration) throws ExternalDeviceDriverException, ExternalDeviceAvailableException, UnknownExternalDeviceException {
        devicesService.connectDevice(deviceConfiguration);
        devicesService.disconnectDevice(deviceConfiguration.getId());
    }

    private ExternalDeviceDriver mockExternalDriver(int port) throws ExternalDeviceDriverException, UnknownHostException {
        ExternalDeviceDriver driverMock = mock(ExternalDeviceDriver.class);
        when(externalDeviceDriverFactory.create(FAKE_HOST, port)).thenReturn(driverMock);

        return driverMock;
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

    private void mockResolvedConfigurations() throws ExternalDeviceConfigurationException, UnknownExternalDeviceException {
        ResolvedConfiguration resolvedConfiguration1 = new ResolvedConfiguration(deviceConfigurationData, 3);
        ResolvedConfiguration resolvedConfiguration2 = new ResolvedConfiguration(deviceConfigurationData2, 4);

        when(configService.getResolvedConfigurationList("ALARM", "testUser")).thenReturn(Arrays.asList(resolvedConfiguration1, resolvedConfiguration2));
    }
}
