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

import java.net.InetAddress;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import jakarta.annotation.PreDestroy;

/**
 * {@link DevicesService}
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

    private final ConfigService configService;
    private final ExternalDeviceDriverFactory externalDeviceDriverFactory;
    private final ExternalDevicesWatchdogProperties externalDevicesWatchdogProperties;

    private final Map<String, ExternalDeviceDriver> driversPool;
    private final Map<String, Device> devices;

    public DevicesService(ConfigService configService,
            ExternalDeviceDriverFactory externalDeviceDriverFactory,
            ExternalDevicesWatchdogProperties externalDevicesWatchdogProperties) {
        this.configService = configService;
        this.externalDeviceDriverFactory = externalDeviceDriverFactory;
        this.externalDevicesWatchdogProperties = externalDevicesWatchdogProperties;
        this.driversPool = new HashMap<>();
        this.devices = new HashMap<>();
    }

    public Optional<Device> getDevice(String deviceId) {
        return Optional.ofNullable(devices.get(deviceId));
    }

    public List<Device> getDevices() {
        return devices.values().stream().collect(Collectors.toList());
    }

    public void enableDevice(String deviceId)
            throws ExternalDeviceDriverException, ExternalDeviceConfigurationException, UnknownExternalDeviceException {

        log.info("Try to add device {} to connected devices", deviceId);
        DeviceConfiguration deviceConfiguration = configService.retrieveDeviceConfiguration(deviceId);

        String resolvedAddress = deviceConfiguration.getHost();

        try {
            resolvedAddress = InetAddress.getByName(resolvedAddress).toString();
        }
        catch (Exception exc) {
            throw new ExternalDeviceConfigurationException("Impossible to resolve device host ");
        }
        

        Device device = DeviceData.builder()
                .id(deviceConfiguration.getId())
                .resolvedAddress(resolvedAddress)
                .port(deviceConfiguration.getPort())
                .isConnected(true)
                .build();

        String driverId = getDriverIdFromDevice(device);
        if (!driversPool.containsKey(driverId)) {
            log.info("No driver in pool , try to add driver {} ", driverId);
            ExternalDeviceDriver driver = externalDeviceDriverFactory.create(deviceConfiguration.getHost(),
                    deviceConfiguration.getPort());
            driversPool.put(driverId, driver);
            log.info("Driver {}  added in pool", driverId);

        } else
            log.info("Driver {} already in pool", driverId);
        devices.put(deviceId, device);
        log.info("Device {} added to connected devices", device.toString());

    }

    private String getDriverIdFromDevice(Device device) {
        return device.getResolvedAddress() + ":" + Integer.toString(device.getPort());
    }


    public void disableDevice(String deviceId) throws ExternalDeviceDriverException {
        log.info("Try to remove device {} from connected devices", deviceId);
        Device deviceToRemove = devices.get(deviceId);
        if (deviceToRemove != null) {

            devices.remove(deviceId);
            String driverId = getDriverIdFromDevice(deviceToRemove);
            if (isDriverStillConnectedToADevice(driverId)) {
                log.info("Keep driver {} as still in use ", driverId);
            } else {
                log.info("Remove driver {} as it is not used anymore by another device",driverId);
                ExternalDeviceDriver driver = driversPool.get(driverId);
                driversPool.remove(driverId);
                log.info("Driver {} has been removed form pool", driverId);
                driver.disconnect();
                log.info("Driver {} has been disconnected", driverId);
            }
        }
        else  log.info("No device {} was present in connected devices", deviceId);
    }

    private boolean isDriverStillConnectedToADevice(String driverId) {
        List<Device> devicesConnectedToDriver = devices.values().stream()
                .filter(device -> getDriverIdFromDevice(device).equals(driverId))
                .collect(Collectors.toList());
        return  (!devicesConnectedToDriver.isEmpty());
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
            throws ExternalDeviceException, ExternalDeviceDriverException, ExternalDeviceConfigurationException,
            ExternalDeviceAvailableException {

        String deviceId = resolvedConfiguration.getDeviceConfiguration().getId();
        int signalId = resolvedConfiguration.getSignalId();
        log.info("Try to send signal " + signalId + " for device " + deviceId);

        Device device = devices.get(deviceId);
        if (device == null){
            log.warn("No device with id " + deviceId + " is enabled ");
            throw new ExternalDeviceAvailableException("No device with id " + deviceId + " is enabled ");
        }

        ExternalDeviceDriver driver = driversPool.get(getDriverIdFromDevice(device));
        if (driver == null) {
            log.warn( "No driver with id " + getDriverIdFromDevice(device) + " in the driver pool ");
            throw new ExternalDeviceAvailableException(
                    "No driver with id " + getDriverIdFromDevice(device) + " in the driver pool ");
        }

        if (!driver.isConnected()) {
            log.info("External device {} was not connected. Connecting before send.", deviceId);
            driver.connect();
        }
        driver.send(signalId);
    }

    private String buildSignalSendingExceptionMessage(String signalKey, int signalId, String userLogin, String deviceId,
            String reason) {
        return "Could not send signal " + signalKey + " (id=" + signalId + ") for user " + userLogin + " to device "
                + deviceId + " " + reason;

    }

    @Scheduled(cron = "${operatorfabric.externaldevices.watchdog.cron:*/5 * * * * *}", zone = "UTC")
    public void sendWatchdog() {

        if (Boolean.TRUE.equals((externalDevicesWatchdogProperties.getEnabled()))) {

            this.driversPool.forEach((driverId, driver) -> {
                if (driver.isConnected()) {
                    log.debug("Sending watchdog signal for device {}", driverId);
                    try {
                        driver.send(externalDevicesWatchdogProperties.getSignalId());
                    } catch (ExternalDeviceDriverException e) {
                        log.error("Watchdog signal couldn't be sent to device {} (driver: {}): {}", driverId,
                                driver.toString(), e);
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
            this.driversPool.forEach((driverId, driver) -> {
                if (!driver.isConnected()) {
                    log.info("Driver {} is not connected. Try to connect",driverId);
                    try {
                        driver.connect();

                    } catch (ExternalDeviceDriverException e) {
                        log.error("Impossible to connect  {} (driver: {}): {}", driverId,
                                driver.toString(), e);
                    }
                }
            });
        }
    }


    @PreDestroy
    public void destroy() {
        log.info("Will disconnect all devices");
        driversPool.values().stream().forEach( driver -> {
            try {
                driver.disconnect();
                log.info("Driver " + driver.toString() + " has been disconnected");
            }
            catch (Exception exc) {
                log.warn("Impossible to disconnect driver " + driver,exc);
            }

        });
        

    }

}
