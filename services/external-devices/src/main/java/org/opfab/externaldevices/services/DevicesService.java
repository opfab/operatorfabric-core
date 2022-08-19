/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.services;


import lombok.extern.slf4j.Slf4j;
import org.opfab.externaldevices.configuration.externaldevices.ExternalDevicesWatchdogProperties;
import org.opfab.externaldevices.drivers.ExternalDeviceAvailableException;
import org.opfab.externaldevices.drivers.ExternalDeviceConfigurationException;
import org.opfab.externaldevices.drivers.ExternalDeviceDriver;
import org.opfab.externaldevices.drivers.ExternalDeviceDriverException;
import org.opfab.externaldevices.drivers.ExternalDeviceDriverFactory;
import org.opfab.externaldevices.drivers.UnknownExternalDeviceException;
import org.opfab.externaldevices.model.Device;
import org.opfab.externaldevices.model.DeviceConfiguration;
import org.opfab.externaldevices.model.DeviceData;
import org.opfab.externaldevices.model.ResolvedConfiguration;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * {@link DevicesService}
 * * Acts a an interface between the APIs and the repositories
 * * Creates external devices drivers
 * * Maintains a pool of drivers and acts on their connection status
 * * Translates each notification received through the API into a signal to send to the appropriate driver
 * * Generates watchdog signals
 */
@Service
@Slf4j
public class DevicesService {

    public static final String EXISTING_DRIVER = "Driver already exists in pool for {}: {}";
    public static final String OUTDATED_DRIVER = "Driver exists in pool for {}: {}, but configuration has changed. Replacing it with new driver.";
    public static final String DISCONNECTION_FAILED = "No disconnection was performed as there is no driver for device %1$s in the pool.";
    private static final String CONNECT_FAILED = "Connection to device %1$s failed.";
    private static final String CONNECT_FAILED_BECAUSE_DEVICE_IS_DISABLED = "Could not connect device %s because it is disabled.";

    private final ConfigService configService;
    private final ExternalDeviceDriverFactory externalDeviceDriverFactory;
    private final ExternalDevicesWatchdogProperties externalDevicesWatchdogProperties;

    private final Map<String, ExternalDeviceDriver> enabledDevicesPool;

    public DevicesService(ConfigService configService,
                          ExternalDeviceDriverFactory externalDeviceDriverFactory,
                          ExternalDevicesWatchdogProperties externalDevicesWatchdogProperties) {
        this.configService = configService;
        this.externalDeviceDriverFactory = externalDeviceDriverFactory;
        this.externalDevicesWatchdogProperties = externalDevicesWatchdogProperties;
        this.enabledDevicesPool = new HashMap<>();
    }

    public void connectDevice(String deviceId) throws ExternalDeviceDriverException, ExternalDeviceConfigurationException, ExternalDeviceAvailableException, UnknownExternalDeviceException {
        DeviceConfiguration deviceConfiguration = configService.retrieveDeviceConfiguration(deviceId);
        connectDevice(deviceConfiguration);
    }

    /* Preferably use this function rather than the above one for performance reasons (to avoid calls to the database) */
    public void connectDevice(DeviceConfiguration deviceConfiguration) throws ExternalDeviceDriverException, ExternalDeviceAvailableException {
        String deviceId = deviceConfiguration.getId();
        if (Boolean.TRUE.equals(deviceConfiguration.getIsEnabled())) {
            ExternalDeviceDriver externalDeviceDriver = safeGetDriverForDevice(deviceConfiguration);
            if (externalDeviceDriver != null) {
                enabledDevicesPool.put(deviceId, externalDeviceDriver);
                connectExternalDriver(deviceId);
            }
        } else {
            enabledDevicesPool.remove(deviceId);
            throw new ExternalDeviceAvailableException(String.format(CONNECT_FAILED_BECAUSE_DEVICE_IS_DISABLED, deviceId));
        }

    }

    private void connectExternalDriver(String deviceId) throws ExternalDeviceDriverException {
        ExternalDeviceDriver externalDeviceDriver = enabledDevicesPool.get(deviceId);
        if (!externalDeviceDriver.isConnected()) {
            externalDeviceDriver.connect();
            log.debug("Device {} is now connected", deviceId);
        }
    }

    public void sendSignalToAllDevicesOfUser(String opFabSignalKey, String userLogin) throws ExternalDeviceConfigurationException, ExternalDeviceDriverException, ExternalDeviceAvailableException, UnknownExternalDeviceException {

        List<ResolvedConfiguration> resolvedConfigurationList = configService.getResolvedConfigurationList(opFabSignalKey, userLogin);
        ExternalDeviceConfigurationException configurationException = null;
        ExternalDeviceDriverException driverException = null;
        ExternalDeviceAvailableException deviceDisabledException = null;
        UnknownExternalDeviceException unknownDeviceException = null;

        for(ResolvedConfiguration resolvedConfiguration: resolvedConfigurationList) {
            try {
                sendSignalToOneDevice(resolvedConfiguration);
            } catch (ExternalDeviceConfigurationException e) {
                configurationException = e;
            } catch (ExternalDeviceDriverException e) {
                driverException = e;
            } catch (ExternalDeviceAvailableException e) {
                deviceDisabledException = e;
            } catch (UnknownExternalDeviceException e) {
                unknownDeviceException = e;
            }
        }

        throwCaughtException(configurationException, driverException, deviceDisabledException, unknownDeviceException);

    }

    private void throwCaughtException(ExternalDeviceConfigurationException configurationException, ExternalDeviceDriverException driverException, ExternalDeviceAvailableException deviceDisabledException, UnknownExternalDeviceException unknownDeviceException) throws ExternalDeviceConfigurationException, ExternalDeviceDriverException, ExternalDeviceAvailableException, UnknownExternalDeviceException {
        if (configurationException != null) {
            throw configurationException;
        } else if (driverException != null) {
            throw driverException;
        } else if (deviceDisabledException != null) {
            throw deviceDisabledException;
        } else if (unknownDeviceException != null) {
            throw unknownDeviceException;
        }
    }

    private void sendSignalToOneDevice(ResolvedConfiguration resolvedConfiguration) throws ExternalDeviceDriverException, ExternalDeviceConfigurationException, ExternalDeviceAvailableException, UnknownExternalDeviceException {
        DeviceConfiguration deviceConfiguration = resolvedConfiguration.getDeviceConfiguration();
        if (Boolean.TRUE.equals(deviceConfiguration.getIsEnabled())) {
            sendSignalToOneEnabledDevice(resolvedConfiguration);
        } else {
            String errorMessage = String.format("Could not send signal to device %1$s because it is disabled", deviceConfiguration.getId());
            throw new ExternalDeviceAvailableException(errorMessage);
        }
    }

    private void sendSignalToOneEnabledDevice(ResolvedConfiguration resolvedConfiguration) throws ExternalDeviceDriverException, ExternalDeviceConfigurationException, ExternalDeviceAvailableException, UnknownExternalDeviceException {
        DeviceConfiguration deviceConfiguration = resolvedConfiguration.getDeviceConfiguration();
        try {
            ExternalDeviceDriver externalDeviceDriver = getDriverForDevice(deviceConfiguration);
            if (!externalDeviceDriver.isConnected()) {
                log.debug("External device {} was not connected. Connecting before sending signal.", deviceConfiguration.getId());
                connectDevice(deviceConfiguration);
            }
            externalDeviceDriver.send(resolvedConfiguration.getSignalId());
        } catch (UnknownHostException e) {
            disconnectDevice(deviceConfiguration.getId());
            throw new ExternalDeviceDriverException("Unable to initialize ModbusDriver with host " + deviceConfiguration.getHost() + ".", e);
        }
    }

    @Scheduled(cron = "${operatorfabric.externaldevices.watchdog.cron:*/5 * * * * *}", zone = "UTC")
    public void sendWatchdog() {
        if (Boolean.TRUE.equals((externalDevicesWatchdogProperties.getEnabled()))) {

            HashSet<String> knownHostsAndPorts = new HashSet<>();

            this.enabledDevicesPool.forEach((deviceId, externalDeviceDriver) -> {

                String hostAndPort = buildHostAndPortString(externalDeviceDriver);

                if (isDeviceConnectedAndEnabled(deviceId) && (! knownHostsAndPorts.contains(hostAndPort))) { // To avoid reconnecting drivers automatically
                    try {
                        log.debug("Sending watchdog signal for device {}", deviceId);
                        knownHostsAndPorts.add(hostAndPort);
                        externalDeviceDriver.send(externalDevicesWatchdogProperties.getSignalId());
                    } catch (ExternalDeviceDriverException e) {
                        log.error("Watchdog signal couldn't be sent to device {} (driver: {}): {}", deviceId, externalDeviceDriver.toString(), e.getMessage());
                    }
                }
            });
        } else {
            log.debug("Watchdog signal disabled.");
        }
    }

    private String buildHostAndPortString(ExternalDeviceDriver externalDeviceDriver) {
        return externalDeviceDriver.getResolvedHost() + ":" + externalDeviceDriver.getPort();
    }

    private boolean isDeviceConnectedAndEnabled(String deviceId) {
        ExternalDeviceDriver driver = enabledDevicesPool.get(deviceId);
        return driver.isConnected() && isDeviceEnabled(deviceId);
    }

    private boolean isDeviceEnabled(String deviceId) {
        return enabledDevicesPool.containsKey(deviceId);
    }


    @Scheduled(fixedDelay = 5000)
    public void reconnectDisconnectedDevices() {

        HashSet<String> knownHostsAndPorts = new HashSet<>();

        List<DeviceConfiguration> devices = configService.getDeviceConfigurations();

        for (DeviceConfiguration currentDevice : devices) {

            ExternalDeviceDriver externalDeviceDriver = safeGetDriverForDevice(currentDevice);
            if (externalDeviceDriver != null) {
                String hostAndPort = buildHostAndPortString(externalDeviceDriver);

                if (!knownHostsAndPorts.contains(hostAndPort) && Boolean.TRUE.equals(currentDevice.getIsEnabled())) {
                    knownHostsAndPorts.add(hostAndPort);
                    tryToReconnectDisconnectedDevice(currentDevice);
                }
            } else {
                log.warn("Automatic reconnection failed for device {} because it has no known driver", currentDevice.getId());
                tryToDisconnectDevice(currentDevice.getId());
            }
        }

    }


    private void tryToReconnectDisconnectedDevice(DeviceConfiguration deviceConfiguration) {
        log.debug("Sending reconnection signal for device {}", deviceConfiguration);

        try {
            connectDevice(deviceConfiguration);
            ExternalDeviceDriver externalDeviceDriver = safeGetDriverForDevice(deviceConfiguration);

            if (externalDeviceDriver != null && !externalDeviceDriver.isConnected()) {
                tryToDisconnectDevice(deviceConfiguration.getId());
                log.warn("Automatic reconnection failed for device {}", deviceConfiguration.getId());
            } else if (externalDeviceDriver != null && externalDeviceDriver.isConnected()) {
                log.debug("Automatic reconnection succeeded for device {}", deviceConfiguration.getId());
            }

        } catch (ExternalDeviceDriverException e) {
            log.warn(String.format(CONNECT_FAILED, deviceConfiguration));
        } catch (ExternalDeviceAvailableException e) {
            log.warn(String.format(CONNECT_FAILED_BECAUSE_DEVICE_IS_DISABLED, deviceConfiguration));
        }
    }


    private void tryToDisconnectDevice(String deviceId) {
        try {
            disconnectDevice(deviceId);
        } catch (ExternalDeviceDriverException e) {
            log.warn("Could not disconnect device {} : driver returned an error", deviceId);
        } catch (UnknownExternalDeviceException e) {
            log.warn("Could not disconnect device {} that does not exist", deviceId);
        }
    }

    public void disconnectDevice(String deviceId) throws ExternalDeviceDriverException, UnknownExternalDeviceException {
        synchronized (enabledDevicesPool) {
            if (enabledDevicesPool.containsKey(deviceId)) {
                log.debug(EXISTING_DRIVER, deviceId, enabledDevicesPool.get(deviceId).toString());
                enabledDevicesPool.get(deviceId).disconnect();
            } else {
                log.warn(String.format(DISCONNECTION_FAILED, deviceId));
                if (isDriverOfDeviceMissing(deviceId)) {
                    throw new UnknownExternalDeviceException(String.format(DISCONNECTION_FAILED, deviceId));
                }
            }
        }
    }

    private boolean isDriverOfDeviceMissing(String deviceId) {
        boolean isDriverMissing = true;

        try {
            DeviceConfiguration deviceConfiguration = configService.retrieveDeviceConfiguration(deviceId);
            ExternalDeviceDriver driver = getDriverForDevice(deviceConfiguration);
            isDriverMissing = driver == null;
        } catch (ExternalDeviceConfigurationException | UnknownExternalDeviceException | ExternalDeviceDriverException e) {
            log.warn("Could not find driver for device {}.", deviceId);
        } catch (UnknownHostException e) {
            log.warn("Device {} has an unknown host.", deviceId);
        }

        return isDriverMissing;
    }


    public Optional<Device> getDevice(String deviceId) {
        synchronized (enabledDevicesPool) {
            return Optional.ofNullable(enabledDevicesPool.get(deviceId)).map(driver -> createDeviceFromDriver(deviceId,driver));
        }
    }

    public List<Device> getDevices() {
        synchronized (enabledDevicesPool) {
            return enabledDevicesPool.entrySet().stream()
                    .map(entry -> createDeviceFromDriver(entry.getKey(),entry.getValue()))
                    .collect(Collectors.toList());
        }
    }

    private ExternalDeviceDriver safeGetDriverForDevice(DeviceConfiguration deviceConfiguration) {
        ExternalDeviceDriver result = null;
        try {
            result = getDriverForDevice(deviceConfiguration);
        } catch (ExternalDeviceDriverException |UnknownHostException | ExternalDeviceConfigurationException e) {
            log.debug("Device {} was not found", deviceConfiguration.getId());
        }

        return result;
    }

    private ExternalDeviceDriver getDriverForDevice(DeviceConfiguration deviceConfiguration) throws ExternalDeviceDriverException, ExternalDeviceConfigurationException, UnknownHostException {
        String deviceId = deviceConfiguration.getId();
        synchronized (enabledDevicesPool) {
                if (enabledDevicesPool.containsKey(deviceId)) {

                    ExternalDeviceDriver existingDriver = enabledDevicesPool.get(deviceId);
                    log.debug(EXISTING_DRIVER, deviceId, existingDriver.toString());
                    // Check whether the host still resolves to the same InetAddress
                    // (for example in the case of a transient IP for a docker container) and the port hasn't changed

                    InetAddress resolvedHost = InetAddress.getByName(deviceConfiguration.getHost());
                    if (existingDriver.getResolvedHost().equals(resolvedHost)
                            && existingDriver.getPort() == deviceConfiguration.getPort()) {
                        return existingDriver;
                    } else {
                        log.debug(OUTDATED_DRIVER, deviceId, existingDriver.toString());
                    }

                }
                return externalDeviceDriverFactory.create(deviceConfiguration.getHost(), deviceConfiguration.getPort());
        }
    }


    private Device createDeviceFromDriver(String id, ExternalDeviceDriver externalDeviceDriver) {
        return DeviceData.builder()
                .id(id)
                .resolvedAddress(externalDeviceDriver.getResolvedHost().toString())
                .port(externalDeviceDriver.getPort())
                .isConnected(externalDeviceDriver.isConnected())
                .build();
    }

    public void enableDevice(String deviceId) throws ExternalDeviceConfigurationException, UnknownExternalDeviceException {
        DeviceConfiguration deviceConfiguration = configService.retrieveDeviceConfiguration(deviceId);
        deviceConfiguration.setIsEnabled(true);
        enabledDevicesPool.put(deviceId, safeGetDriverForDevice(deviceConfiguration));
    }

    public void disableDevice(String deviceId) throws ExternalDeviceConfigurationException, UnknownExternalDeviceException {
        DeviceConfiguration deviceConfiguration = configService.retrieveDeviceConfiguration(deviceId);
        deviceConfiguration.setIsEnabled(false);
        enabledDevicesPool.remove(deviceId);
    }
}

