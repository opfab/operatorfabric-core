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
import org.opfab.externaldevices.model.*;
import org.opfab.externaldevices.repositories.DeviceConfigurationRepository;
import org.opfab.externaldevices.repositories.SignalMappingRepository;
import org.opfab.externaldevices.repositories.UserConfigurationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * {@link DevicesService}
 * * Acts a an interface with the repositories
 * * Queries the repositories to resolve configuration
 * * Handles incorrect / incomplete / missing configuration
 */
@Service
@Slf4j
public class ConfigService {

    public static final String CONFIGURATION_NOT_FOUND = "Configuration not found for %1$s %2$s";
    public static final String DEBUG_RETRIEVED_CONFIG = "Retrieved configuration for";
    public static final String UNSUPPORTED_SIGNAL ="Signal %1$s is not supported in mapping %2$s";
    public static final String NULL_AFTER_DELETE = "Following deletion of {}, no {} is configured for {} {}";
    public static final String CANNOT_RETRIEVE_FOR_NULL_OR_EMPTY_ID = "Cannot retrieve %1$s with null or empty id.";
    public static final String DEVICE_CONFIG = "device configuration";
    public static final String SIGNAL_CONFIG = "signal mapping";
    public static final String USER_CONFIG = "user configuration";

    private final UserConfigurationRepository userConfigurationRepository;
    private final DeviceConfigurationRepository deviceConfigurationRepository;
    private final SignalMappingRepository signalMappingRepository;

    public ConfigService(UserConfigurationRepository userConfigurationRepository,
                         DeviceConfigurationRepository deviceConfigurationRepository,
                         SignalMappingRepository signalMappingRepository) {
        this.userConfigurationRepository = userConfigurationRepository;
        this.deviceConfigurationRepository = deviceConfigurationRepository;
        this.signalMappingRepository = signalMappingRepository;
    }

    public void insertDeviceConfiguration(DeviceConfiguration deviceConfiguration) {
        deviceConfigurationRepository.insert(new DeviceConfigurationData(deviceConfiguration));
    }

    public void insertSignalMapping(SignalMapping signalMapping) {
        signalMappingRepository.insert(new SignalMappingData(signalMapping));
    }

    public void insertUserConfiguration(UserConfiguration userConfiguration) {
        userConfigurationRepository.insert(new UserConfigurationData(userConfiguration));
    }

    public List<DeviceConfiguration> getDeviceConfigurations() {
        return deviceConfigurationRepository.findAll().stream().collect(Collectors.toList());
    }

    public List<SignalMapping> getSignalMappings() {
        return signalMappingRepository.findAll().stream().collect(Collectors.toList());
    }

    public List<UserConfiguration> getUserConfigurations() {
        return userConfigurationRepository.findAll().stream().collect(Collectors.toList());
    }

    public ResolvedConfiguration getResolvedConfiguration(String opFabSignalKey, String userLogin) throws ExternalDeviceConfigurationException {
            UserConfiguration userConfiguration = retrieveUserConfiguration(userLogin);
            DeviceConfiguration deviceConfiguration = retrieveDeviceConfiguration(userConfiguration.getExternalDeviceId());
            SignalMapping signalMapping = retrieveSignalMapping(deviceConfiguration.getSignalMappingId());
            int signalId = computeSignalId(signalMapping,opFabSignalKey);
            return new ResolvedConfiguration(deviceConfiguration,signalId);
    }

    public DeviceConfiguration retrieveDeviceConfiguration(String deviceId) throws ExternalDeviceConfigurationException {
        if(deviceId == null || deviceId.isEmpty()) {
           throw new ExternalDeviceConfigurationException(String.format(CANNOT_RETRIEVE_FOR_NULL_OR_EMPTY_ID, DEVICE_CONFIG, deviceId));
        } else {
            Optional<DeviceConfigurationData> deviceConfiguration = deviceConfigurationRepository.findById(deviceId);
            if(deviceConfiguration.isPresent()) {
                DeviceConfiguration retrievedDeviceConfig = deviceConfiguration.get();
                log.debug("{} for device {} : {}", DEBUG_RETRIEVED_CONFIG, deviceId, retrievedDeviceConfig.toString());
                return retrievedDeviceConfig;
            } else {
                throw new ExternalDeviceConfigurationException(String.format(CONFIGURATION_NOT_FOUND, DEVICE_CONFIG, deviceId));
            }
        }
    }

    public UserConfiguration retrieveUserConfiguration(String userLogin) throws ExternalDeviceConfigurationException {
        if(userLogin == null || userLogin.isEmpty()) {
            throw new ExternalDeviceConfigurationException(String.format(CANNOT_RETRIEVE_FOR_NULL_OR_EMPTY_ID, USER_CONFIG));
        } else {
            Optional<UserConfigurationData> userConfiguration = userConfigurationRepository.findById(userLogin);
            if(userConfiguration.isPresent()) {
                UserConfiguration retrievedUserConfig = userConfiguration.get();
                log.debug("{} for user {} : {}", DEBUG_RETRIEVED_CONFIG, userLogin, retrievedUserConfig.toString());
                return retrievedUserConfig;
            } else {
                throw new ExternalDeviceConfigurationException(String.format(CONFIGURATION_NOT_FOUND, USER_CONFIG, userLogin));
            }
        }
    }
    public SignalMapping retrieveSignalMapping(String signalMappingId) throws ExternalDeviceConfigurationException {
        if(signalMappingId == null || signalMappingId.isEmpty()) {
            throw new ExternalDeviceConfigurationException(String.format(CANNOT_RETRIEVE_FOR_NULL_OR_EMPTY_ID, SIGNAL_CONFIG));
        }
        Optional<SignalMappingData> signalMapping = signalMappingRepository.findById(signalMappingId);
        if(signalMapping.isPresent()) {
            SignalMapping retrievedSignalMapping = signalMapping.get();
            log.debug("{} for signal {} : {}", DEBUG_RETRIEVED_CONFIG, signalMappingId, retrievedSignalMapping.toString());
            return retrievedSignalMapping;
        } else {
            throw new ExternalDeviceConfigurationException(String.format(CONFIGURATION_NOT_FOUND, SIGNAL_CONFIG, signalMappingId));
        }

    }

    public void deleteDeviceConfiguration(String deviceId) throws ExternalDeviceConfigurationException {

        // Only existing configurations can be deleted
        retrieveDeviceConfiguration(deviceId);

        // First we need to remove it from the userConfigurations that were using it
        List<UserConfigurationData> foundUserConfigurations = userConfigurationRepository.findByExternalDeviceId(deviceId);
        if (foundUserConfigurations != null) {
            for (UserConfigurationData userConfigurationData :  foundUserConfigurations) {
                userConfigurationData.setExternalDeviceId(null);
                log.warn(NULL_AFTER_DELETE, deviceId, DEVICE_CONFIG, "user", userConfigurationData.getUserLogin());
            }
            userConfigurationRepository.saveAll(foundUserConfigurations);
        }

        // Then delete it
        deviceConfigurationRepository.deleteById(deviceId);

    }


    public void deleteSignalMapping(String signalMappingId) throws ExternalDeviceConfigurationException {

        // Only existing configurations can be deleted
        retrieveSignalMapping(signalMappingId);

        // First we need to remove it from the deviceConfigurations that were using it
        List<DeviceConfigurationData> foundDeviceConfigurations = deviceConfigurationRepository.findBySignalMappingId(signalMappingId);
        if (foundDeviceConfigurations != null) {
            for (DeviceConfigurationData deviceConfigurationData : foundDeviceConfigurations) {
                deviceConfigurationData.setSignalMappingId(null);
                log.warn(NULL_AFTER_DELETE, signalMappingId, "signalMapping", DEVICE_CONFIG, deviceConfigurationData.getId());
            }
            deviceConfigurationRepository.saveAll(foundDeviceConfigurations);
        }

        // Then delete it
       signalMappingRepository.deleteById(signalMappingId);
    }

    public void deleteUserConfiguration(String userLogin) throws ExternalDeviceConfigurationException {

        // Only existing configurations can be deleted
        retrieveUserConfiguration(userLogin);
        userConfigurationRepository.deleteById(userLogin);
    }


    private int computeSignalId(SignalMapping signalMapping, String opFabSignalKey) throws ExternalDeviceConfigurationException {
        if(signalMapping.getSupportedSignals().containsKey(opFabSignalKey)) {
            return signalMapping.getSupportedSignals().get(opFabSignalKey);
        } else {
            throw new ExternalDeviceConfigurationException(String.format(UNSUPPORTED_SIGNAL,opFabSignalKey,signalMapping.getId()));
        }
    }

}
