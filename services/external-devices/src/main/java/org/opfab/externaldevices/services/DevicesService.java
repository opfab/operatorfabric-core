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

    private final ConfigService configService;
    private final ExternalDeviceDriverFactory externalDeviceDriverFactory;
    private final ExternalDevicesWatchdogProperties externalDevicesWatchdogProperties;

    private final Map<String, ExternalDeviceDriver> deviceDriversPool;

    public DevicesService(ConfigService configService,
                          ExternalDeviceDriverFactory externalDeviceDriverFactory,
                          ExternalDevicesWatchdogProperties externalDevicesWatchdogProperties) {
        this.configService = configService;
        this.externalDeviceDriverFactory = externalDeviceDriverFactory;
        this.externalDevicesWatchdogProperties = externalDevicesWatchdogProperties;
        this.deviceDriversPool = new HashMap<>();
    }

    public void connectDevice(String deviceId) throws ExternalDeviceDriverException, ExternalDeviceConfigurationException, ExternalDeviceAvailableException, UnknownExternalDeviceException {
        DeviceConfiguration deviceConfiguration = configService.retrieveDeviceConfiguration(deviceId);
        if (Boolean.TRUE.equals(deviceConfiguration.getIsEnabled())) {
            ExternalDeviceDriver externalDeviceDriver = getDriverForDevice(deviceConfiguration);
            externalDeviceDriver.connect();
        } else {
            throw new ExternalDeviceAvailableException(String.format("Could not connect device %s because it is disabled", deviceId));
        }
    }

    public void disconnectDevice(String deviceId) throws ExternalDeviceDriverException, UnknownExternalDeviceException {
        synchronized (deviceDriversPool) {
            if (deviceDriversPool.containsKey(deviceId)) {
                log.debug(EXISTING_DRIVER, deviceId,deviceDriversPool.get(deviceId).toString());
                deviceDriversPool.get(deviceId).disconnect();
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
        } catch (ExternalDeviceConfigurationException| UnknownExternalDeviceException | ExternalDeviceDriverException e) {
           log.warn("Could not find driver for device {}", deviceId);
        }

        return isDriverMissing;
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
        ExternalDeviceDriver externalDeviceDriver = getDriverForDevice(resolvedConfiguration.getDeviceConfiguration());
        if (!externalDeviceDriver.isConnected()) {
            log.debug("External device {} was not connected. Connecting before send.", resolvedConfiguration.getDeviceConfiguration().getId());
            connectDevice(resolvedConfiguration.getDeviceConfiguration().getId());
        }
        externalDeviceDriver.send(resolvedConfiguration.getSignalId());
    }

    @Scheduled(cron = "${operatorfabric.externaldevices.watchdog.cron:*/5 * * * * *}", zone = "UTC")
    public void sendWatchdog() {
        if (Boolean.TRUE.equals((externalDevicesWatchdogProperties.getEnabled()))) {

            HashSet<String> hostAndPorSet = new HashSet<>();

            this.deviceDriversPool.forEach((deviceId, externalDeviceDriver) -> {

                String hostAndPort = externalDeviceDriver.getResolvedHost() + ":" + externalDeviceDriver.getPort();

                if (isDeviceConnectedAndEnabled(deviceId) && (! hostAndPorSet.contains(hostAndPort))) { // To avoid reconnecting drivers automatically
                    try {
                        log.debug("Sending watchdog signal for device {}", deviceId);
                        hostAndPorSet.add(hostAndPort);
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

    private boolean isDeviceConnectedAndEnabled(String deviceId) {

        boolean isDeviceAvailable = false;

        try {
            ExternalDeviceDriver driver = deviceDriversPool.get(deviceId);
            DeviceConfiguration deviceConfiguration = configService.retrieveDeviceConfiguration(deviceId);
            isDeviceAvailable = driver.isConnected() && deviceConfiguration.getIsEnabled().booleanValue();
        } catch (ExternalDeviceConfigurationException e) {
            log.error("Could not access device {} because of an invalid configuration", deviceId);
        } catch (UnknownExternalDeviceException e) {
            log.error("Could not access device {} that does not exist", deviceId);
        }

        return isDeviceAvailable;
    }


    public Optional<Device> getDevice(String deviceId) {
        synchronized (deviceDriversPool) {
            return Optional.ofNullable(deviceDriversPool.get(deviceId)).map(driver -> createDeviceFromDriver(deviceId,driver));
        }
    }

    public List<Device> getDevices() {
        synchronized (deviceDriversPool) {
            return deviceDriversPool.entrySet().stream()
                    .map(entry -> createDeviceFromDriver(entry.getKey(),entry.getValue()))
                    .collect(Collectors.toList());
        }
    }

    private ExternalDeviceDriver getDriverForDevice(DeviceConfiguration deviceConfiguration) throws ExternalDeviceDriverException, ExternalDeviceConfigurationException {
        String deviceId = deviceConfiguration.getId();
        synchronized (deviceDriversPool) {
            try {

                if (deviceDriversPool.containsKey(deviceId)) {

                    ExternalDeviceDriver existingDriver = deviceDriversPool.get(deviceId);
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

                ExternalDeviceDriver newDriver = externalDeviceDriverFactory.create(deviceConfiguration.getHost(), deviceConfiguration.getPort());
                deviceDriversPool.put(deviceId, newDriver);
                return newDriver;

            } catch (UnknownHostException e) {
                deviceDriversPool.remove(deviceId);
                throw new ExternalDeviceDriverException("Unable to initialize ModbusDriver with host " + deviceConfiguration.getHost(), e);
            }
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
    }

    public void disableDevice(String deviceId) throws ExternalDeviceConfigurationException, UnknownExternalDeviceException {
        DeviceConfiguration deviceConfiguration = configService.retrieveDeviceConfiguration(deviceId);
        deviceConfiguration.setIsEnabled(false);
    }
}

