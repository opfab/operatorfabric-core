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
import org.opfab.externaldevices.drivers.ExternalDeviceConfigurationException;
import org.opfab.externaldevices.drivers.ExternalDeviceDriver;
import org.opfab.externaldevices.drivers.ExternalDeviceDriverException;
import org.opfab.externaldevices.drivers.ExternalDeviceDriverFactory;
import org.opfab.externaldevices.model.Device;
import org.opfab.externaldevices.model.DeviceConfiguration;
import org.opfab.externaldevices.model.DeviceData;
import org.opfab.externaldevices.model.ResolvedConfiguration;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.*;
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

    public void connectDevice(String deviceId) throws ExternalDeviceDriverException, ExternalDeviceConfigurationException {
        DeviceConfiguration deviceConfiguration = configService.retrieveDeviceConfiguration(deviceId);
        ExternalDeviceDriver externalDeviceDriver = getDriverForDevice(deviceConfiguration);
        externalDeviceDriver.connect();
    }

    public void disconnectDevice(String deviceId) throws ExternalDeviceDriverException {
        synchronized (deviceDriversPool) {
            if (deviceDriversPool.containsKey(deviceId)) {
                log.debug(EXISTING_DRIVER, deviceId,deviceDriversPool.get(deviceId).toString());
                deviceDriversPool.get(deviceId).disconnect();
            } else {
                log.warn("No disconnection was performed as no driver for device {} exists in the pool.", deviceId);
            }
        }
    }

    public void sendSignalToAllDevicesOfUser(String opFabSignalKey, String userLogin) throws ExternalDeviceConfigurationException, ExternalDeviceDriverException {

        List<ResolvedConfiguration> resolvedConfigurationList = configService.getResolvedConfigurationList(opFabSignalKey, userLogin);
        for(ResolvedConfiguration resolvedConfiguration: resolvedConfigurationList) {
            sendSignalToOneDevice(resolvedConfiguration);
        }
    }

    private void sendSignalToOneDevice(ResolvedConfiguration resolvedConfiguration) throws ExternalDeviceDriverException, ExternalDeviceConfigurationException {
        ExternalDeviceDriver externalDeviceDriver = getDriverForDevice(resolvedConfiguration.getDeviceConfiguration());
        if(!externalDeviceDriver.isConnected()) {
            log.debug("External device {} was not connected. Connecting before send.",resolvedConfiguration.getDeviceConfiguration().getId());
            externalDeviceDriver.connect();
        }
        externalDeviceDriver.send(resolvedConfiguration.getSignalId());
    }

    @Scheduled(cron = "${operatorfabric.externaldevices.watchdog.cron:*/5 * * * * *}", zone = "UTC")
    public void sendWatchdog() {
        if (externalDevicesWatchdogProperties.getEnabled()) {

            HashSet<String> hostAndPorSet = new HashSet<>();

            this.deviceDriversPool.forEach((deviceId, externalDeviceDriver) -> {

                String hostAndPort = externalDeviceDriver.getResolvedHost() + ":" + externalDeviceDriver.getPort();

                if (externalDeviceDriver.isConnected() && (! hostAndPorSet.contains(hostAndPort))) { // To avoid reconnecting drivers automatically
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

}

