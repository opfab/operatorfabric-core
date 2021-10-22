/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.services;


import lombok.extern.slf4j.Slf4j;
import org.opfab.externaldevices.drivers.ExternalDeviceConfigurationException;
import org.opfab.externaldevices.drivers.ExternalDeviceDriver;
import org.opfab.externaldevices.drivers.ExternalDeviceDriverException;
import org.opfab.externaldevices.drivers.ModbusDriver;
import org.opfab.externaldevices.model.*;
import org.opfab.externaldevices.repositories.DeviceConfigurationRepository;
import org.opfab.externaldevices.repositories.SignalMappingRepository;
import org.opfab.externaldevices.repositories.UserConfigurationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.*;

/**
 * {@link DevicesService}
 * * Acts a an interface between the APIs and the repositories
 * * Queries the repositories to resolve configuration and create external devices drivers
 * * Maintains a pool of drivers and acts on their connection status
 * * Translates each notification received through the API into a signal to send to the appropriate driver
 */
@Service
@Slf4j
public class DevicesService {

    public static final String CONFIGURATION_NOT_FOUND = "Configuration not found for %1$s %2$s";
    public static final String DEBUG_RETRIEVED_CONFIG = "Retrieved configuration for";
    public static final String EXISTING_DRIVER = "Driver already exists in pool for {}: {}";
    public static final String OUTDATED_DRIVER = "Driver exists in pool for {}: {}, but configuration has changed. Replacing it with new driver.";
    public static final String UNSUPPORTED_SIGNAL ="Signal %1$s is not supported by device %2$s";

    private final UserConfigurationRepository userConfigurationRepository;
    private final DeviceConfigurationRepository deviceConfigurationRepository;
    private final SignalMappingRepository signalMappingRepository;

    private final Map<String,ExternalDeviceDriver> deviceDriversPool;

    @Autowired
    public DevicesService(UserConfigurationRepository userConfigurationRepository,
                          DeviceConfigurationRepository deviceConfigurationRepository,
                          SignalMappingRepository signalMappingRepository) {
        this.userConfigurationRepository = userConfigurationRepository;
        this.deviceConfigurationRepository = deviceConfigurationRepository;
        this.signalMappingRepository = signalMappingRepository;
        this.deviceDriversPool = new HashMap<>();
    }

    public void connectDevice(String deviceId) throws ExternalDeviceDriverException, ExternalDeviceConfigurationException {
        ExternalDeviceDriver externalDeviceDriver = getDriverForDevice(deviceId);
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

    public void sendSignalForUser(String opFabSignalKey, String userLogin) throws ExternalDeviceConfigurationException, ExternalDeviceDriverException {

        UserConfiguration userConfiguration = retrieveUserConfiguration(userLogin);
        DeviceConfiguration deviceConfiguration = retrieveDeviceConfiguration(userConfiguration.getExternalDeviceId());
        SignalMapping signalMapping = retrieveSignalMapping(deviceConfiguration.getSignalMappingId());

        if(signalMapping.getSupportedSignals().containsKey(opFabSignalKey)) {
            int signalId = signalMapping.getSupportedSignals().get(opFabSignalKey);
            ExternalDeviceDriver externalDeviceDriver = getDriverForDevice(userConfiguration.getExternalDeviceId());
            if(!externalDeviceDriver.isConnected()) {
                log.debug("External device {} was not connected. Connecting before send.",userConfiguration.getExternalDeviceId());
                externalDeviceDriver.connect();
            }
            externalDeviceDriver.send(signalId);
        } else {
            throw new ExternalDeviceConfigurationException(String.format(UNSUPPORTED_SIGNAL,opFabSignalKey,userConfiguration.getExternalDeviceId()));
        }

    }

    public void insertDeviceConfiguration(DeviceConfiguration deviceConfiguration) {
        deviceConfigurationRepository.insert(new DeviceConfigurationData(deviceConfiguration));
    }

    private ExternalDeviceDriver getDriverForDevice(String deviceId) throws ExternalDeviceDriverException, ExternalDeviceConfigurationException {
        DeviceConfiguration deviceConfiguration = retrieveDeviceConfiguration(deviceId);
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

                ExternalDeviceDriver newDriver = new ModbusDriver(deviceConfiguration.getHost(), deviceConfiguration.getPort());
                deviceDriversPool.put(deviceId, newDriver);
                return newDriver;

            } catch (UnknownHostException e) {
                deviceDriversPool.remove(deviceId);
                throw new ExternalDeviceDriverException("Unable to initialize ModbusDriver with host " + deviceConfiguration.getHost(), e);
            }
        }
    }

    private DeviceConfiguration retrieveDeviceConfiguration(String deviceId) throws ExternalDeviceConfigurationException {

        Optional<DeviceConfigurationData> deviceConfiguration = deviceConfigurationRepository.findById(deviceId);
        if(deviceConfiguration.isPresent()) {
            DeviceConfiguration retrievedDeviceConfig = deviceConfiguration.get();
            log.debug("{} for device {} : {}", DEBUG_RETRIEVED_CONFIG, deviceId, retrievedDeviceConfig.toString());
            return retrievedDeviceConfig;
        } else {
            throw new ExternalDeviceConfigurationException(String.format(CONFIGURATION_NOT_FOUND, "device", deviceId));
        }

    }

    private UserConfiguration retrieveUserConfiguration(String userLogin) throws ExternalDeviceConfigurationException {

        Optional<UserConfigurationData> userConfiguration = userConfigurationRepository.findById(userLogin);
        if(userConfiguration.isPresent()) {
            UserConfiguration retrievedUserConfig = userConfiguration.get();
            log.debug("{} for user {} : {}", DEBUG_RETRIEVED_CONFIG, userLogin, retrievedUserConfig.toString());
            return retrievedUserConfig;
        } else {
            throw new ExternalDeviceConfigurationException(String.format(CONFIGURATION_NOT_FOUND, "user", userLogin));
        }

    }

    private SignalMapping retrieveSignalMapping(String signalMappingId) throws ExternalDeviceConfigurationException {

        Optional<SignalMappingData> signalMapping = signalMappingRepository.findById(signalMappingId);
        if(signalMapping.isPresent()) {
            SignalMapping retrievedSignalMapping = signalMapping.get();
            log.debug("{} for signal {} : {}", DEBUG_RETRIEVED_CONFIG, signalMappingId, retrievedSignalMapping.toString());
            return retrievedSignalMapping;
        } else {
            throw new ExternalDeviceConfigurationException(String.format(CONFIGURATION_NOT_FOUND, "signal", signalMappingId));
        }

    }

}

