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
import org.opfab.externaldevices.drivers.*;
import org.opfab.externaldevices.model.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

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
 * * Translates each notification received through the API into a signal to send
 * to the appropriate driver
 * * Generates watchdog signals and try to reconnect disconnected devices
 * regulary
 */
@Service
@Slf4j
public class DevicesService {

    public static final String EXISTING_DRIVER = "Driver already exists in pool for {}: {}";

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

    public Optional<Device> getDevice(String deviceId) {
        return Optional.ofNullable(deviceDriversPool.get(deviceId))
                .map(driver -> createDeviceFromDriver(deviceId, driver));
    }

    private Device createDeviceFromDriver(String id, ExternalDeviceDriver externalDeviceDriver) {
        return DeviceData.builder()
                .id(id)
                .resolvedAddress(externalDeviceDriver.getResolvedHost().toString())
                .port(externalDeviceDriver.getPort())
                .isConnected(externalDeviceDriver.isConnected())
                .build();
    }

    public List<Device> getDevices() {
        return deviceDriversPool.entrySet().stream()
                .map(entry -> createDeviceFromDriver(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }

    public void enableDevice(String deviceId)
            throws ExternalDeviceConfigurationException, UnknownExternalDeviceException {

        DeviceConfiguration deviceConfiguration = configService.retrieveDeviceConfiguration(deviceId);
        deviceConfiguration.setIsEnabled(true);
        try {
            connectDevice(deviceConfiguration);
        } catch (Exception exc) {
            log.info("Enable device " + deviceId + ": impossible to connect ", exc);
        }
    }

    public void connectDevice(String deviceId) throws ExternalDeviceDriverException,
            ExternalDeviceConfigurationException, ExternalDeviceAvailableException, UnknownExternalDeviceException {

        DeviceConfiguration deviceConfiguration = configService.retrieveDeviceConfiguration(deviceId);
        connectDevice(deviceConfiguration);
    }

    private void connectDevice(DeviceConfiguration deviceConfiguration) throws ExternalDeviceDriverException,
            ExternalDeviceConfigurationException, ExternalDeviceAvailableException {

        log.info("Try to connect device " + deviceConfiguration.getId());
        if (Boolean.TRUE.equals(deviceConfiguration.getIsEnabled())) {
            ExternalDeviceDriver externalDeviceDriver = getDriverForDevice(deviceConfiguration);
            externalDeviceDriver.connect();
            log.info("Device " + deviceConfiguration.getId() + " is connected");
        } else {
            throw new ExternalDeviceAvailableException(
                    String.format("Could not connect device %s because it is disabled", deviceConfiguration.getId()));
        }
    }

    private ExternalDeviceDriver getDriverForDevice(DeviceConfiguration deviceConfiguration)
            throws ExternalDeviceDriverException, ExternalDeviceConfigurationException {
        String deviceId = deviceConfiguration.getId();

        synchronized (deviceDriversPool) {
            if (deviceDriversPool.containsKey(deviceId)) {
                ExternalDeviceDriver existingDriver = deviceDriversPool.get(deviceId);
                log.debug(EXISTING_DRIVER, deviceId, existingDriver.toString());
                return existingDriver;
            }
            log.info("Add driver to pool ", deviceId);
            ExternalDeviceDriver newDriver = externalDeviceDriverFactory.create(deviceConfiguration.getHost(),
                    deviceConfiguration.getPort());
            deviceDriversPool.put(deviceId, newDriver);
            return newDriver;
        }
    }

    public void disableDevice(String deviceId)
            throws ExternalDeviceConfigurationException, UnknownExternalDeviceException {

        DeviceConfiguration deviceConfiguration = configService.retrieveDeviceConfiguration(deviceId);
        deviceConfiguration.setIsEnabled(false);
        try {
            disconnectDevice(deviceId);
            deviceDriversPool.remove(deviceId);
        } catch (UnknownExternalDeviceException exc) {
            log.info("No disconnection needed as device " + deviceId + " is not in pool");
        } catch (ExternalDeviceDriverException exc) {
            log.info("Impossible to disconnect device" + deviceId, exc);
        }

    }

    public void disconnectDevice(String deviceId) throws ExternalDeviceDriverException, UnknownExternalDeviceException {

        log.info("Try to disconnect device " + deviceId);
        if (deviceDriversPool.containsKey(deviceId)) {
            log.debug(EXISTING_DRIVER, deviceId, deviceDriversPool.get(deviceId).toString());
            deviceDriversPool.get(deviceId).disconnect();
            log.info("Device " + deviceId + " is disconnected");
        } else {
            throw new UnknownExternalDeviceException(String.format(
                    "No disconnection was performed as there is no driver for device %1$s in the pool.", deviceId));
        }

    }

    /**
     * The method send the signal to all user devices, if one device fail we
     * continue with the next one
     * We choose to send only the last exception message for end user
     **/
    public void sendSignalToAllDevicesOfUser(String opFabSignalKey, String userLogin)
            throws ExternalDeviceException, ExternalDeviceConfigurationException, UnknownExternalDeviceException {

        log.info("Send signals " + opFabSignalKey + " for user " + userLogin);
        List<ResolvedConfiguration> resolvedConfigurationList = configService
                .getResolvedConfigurationList(opFabSignalKey, userLogin);
        String exceptionMessage = null;
        for (ResolvedConfiguration resolvedConfiguration : resolvedConfigurationList) {
            try {
                sendSignalToOneDevice(resolvedConfiguration);
            } catch (ExternalDeviceConfigurationException e) {
                exceptionMessage = buildSignalSendingExceptionMessage(opFabSignalKey,
                        resolvedConfiguration.getSignalId(), userLogin,
                        resolvedConfiguration.getDeviceConfiguration().getId(), "due to a configuration error");
                log.warn(exceptionMessage, e);
            } catch (ExternalDeviceDriverException e) {
                exceptionMessage = buildSignalSendingExceptionMessage(opFabSignalKey,
                        resolvedConfiguration.getSignalId(), userLogin,
                        resolvedConfiguration.getDeviceConfiguration().getId(), "due to an external driver error");
                log.warn(exceptionMessage, e);
            } catch (ExternalDeviceAvailableException e) {
                exceptionMessage = buildSignalSendingExceptionMessage(opFabSignalKey,
                        resolvedConfiguration.getSignalId(), userLogin,
                        resolvedConfiguration.getDeviceConfiguration().getId(), "as device is disabled");
                log.warn(exceptionMessage, e);
            } 
        }
        if (exceptionMessage != null)
            throw new ExternalDeviceException(exceptionMessage);
    }

    private void sendSignalToOneDevice(ResolvedConfiguration resolvedConfiguration)
            throws ExternalDeviceDriverException, ExternalDeviceConfigurationException,
            ExternalDeviceAvailableException {

        String deviceId = resolvedConfiguration.getDeviceConfiguration().getId();
        int signalId = resolvedConfiguration.getSignalId();
        DeviceConfiguration deviceConfiguration = resolvedConfiguration.getDeviceConfiguration();

        log.info("Try to send signal " + signalId + " for device " + deviceId);
        if (Boolean.TRUE.equals(deviceConfiguration.getIsEnabled())) {
            ExternalDeviceDriver externalDeviceDriver = getDriverForDevice(
                    resolvedConfiguration.getDeviceConfiguration());
            if (!externalDeviceDriver.isConnected()) {
                log.info("External device {} was not connected. Connecting before send.",
                        deviceId);
                connectDevice(resolvedConfiguration.getDeviceConfiguration());
            }
            externalDeviceDriver.send(signalId);
        } else
            throw new ExternalDeviceAvailableException(
                    String.format("Could not send signal to device %s because it is disabled", deviceId));
    }

    private String buildSignalSendingExceptionMessage(String signalKey, int signalId, String userLogin, String deviceId,
            String reason) {
        return "Could not send signal " + signalKey + " (id=" + signalId + ") for user " + userLogin + " to device "
                + deviceId + " " + reason;

    }

    @Scheduled(cron = "${operatorfabric.externaldevices.watchdog.cron:*/5 * * * * *}", zone = "UTC")
    public void sendWatchdog() {

        if (Boolean.TRUE.equals((externalDevicesWatchdogProperties.getEnabled()))) {
            HashSet<String> hostAndPortsAlreadyProcessed = new HashSet<>();
            this.deviceDriversPool.forEach((deviceId, externalDeviceDriver) -> {
                String hostAndPort = externalDeviceDriver.getResolvedHost() + ":" + externalDeviceDriver.getPort();
                if (externalDeviceDriver.isConnected() && (!hostAndPortsAlreadyProcessed.contains(hostAndPort))) {
                    try {
                        log.debug("Sending watchdog signal for device {}", deviceId);
                        hostAndPortsAlreadyProcessed.add(hostAndPort);
                        externalDeviceDriver.send(externalDevicesWatchdogProperties.getSignalId());
                    } catch (ExternalDeviceDriverException e) {
                        log.error("Watchdog signal couldn't be sent to device {} (driver: {}): {}", deviceId,
                                externalDeviceDriver.toString(), e);
                    }
                }
            });
        } else {
            log.debug("Watchdog signal disabled.");
        }
    }

    /**
     * Reconnection is not done in the watchdog cron task to avoid having a too long
     * watchdog task if some external devices takes a lot of time to respond or
     * timeout to connection requests
     */
    @Scheduled(cron = "${operatorfabric.externaldevices.reconnect.cron:*/10 * * * * *}", zone = "UTC")
    public void reconnectDisconnectedDevices() {

        if (Boolean.TRUE.equals((externalDevicesWatchdogProperties.getEnabled()))) {
            HashSet<String> hostAndPortsAlreadyProcessed = new HashSet<>();
            this.deviceDriversPool.forEach((deviceId, externalDeviceDriver) -> {

                String hostAndPort = externalDeviceDriver.getResolvedHost() + ":" + externalDeviceDriver.getPort();
                if (!externalDeviceDriver.isConnected() && (!hostAndPortsAlreadyProcessed.contains(hostAndPort))) {
                    try {
                        log.info("Try to reconnect {}", deviceId);
                        hostAndPortsAlreadyProcessed.add(hostAndPort);
                        externalDeviceDriver.connect();
                        log.info("Reconnection done for {}", deviceId);
                    } catch (ExternalDeviceDriverException e) {
                        log.error("Impossible to reconnect  {} (driver: {}): {}", deviceId,
                                externalDeviceDriver.toString(), e);
                    }
                }
            });
        }
    }

    public void removeDevice(String deviceId) {

        ExternalDeviceDriver device = deviceDriversPool.get(deviceId);
        if (device != null) {
            deviceDriversPool.remove(deviceId);
            try {
                device.disconnect();
            } catch (Exception exc) {
                log.warn("Error when try to disconnect removed device ", exc);
            }
        }
    }
}
