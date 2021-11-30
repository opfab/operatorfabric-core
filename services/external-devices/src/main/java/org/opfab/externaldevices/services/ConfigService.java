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

    public Optional<DeviceConfigurationData> getDeviceConfiguration(String deviceId) {
        return deviceConfigurationRepository.findById(deviceId);
    }

    public List<DeviceConfigurationData> getDeviceConfigurations() {
        return deviceConfigurationRepository.findAll().stream().collect(Collectors.toList());
    }

    public ResolvedConfiguration getResolvedConfiguration(String opFabSignalKey, String userLogin) throws ExternalDeviceConfigurationException {
            UserConfiguration userConfiguration = retrieveUserConfiguration(userLogin);
            DeviceConfiguration deviceConfiguration = retrieveDeviceConfiguration(userConfiguration.getExternalDeviceId());
            SignalMapping signalMapping = retrieveSignalMapping(deviceConfiguration.getSignalMappingId());
            int signalId = computeSignalId(signalMapping,opFabSignalKey);
            return new ResolvedConfiguration(deviceConfiguration,signalId);
    }

    public DeviceConfiguration retrieveDeviceConfiguration(String deviceId) throws ExternalDeviceConfigurationException {

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

    private int computeSignalId(SignalMapping signalMapping, String opFabSignalKey) throws ExternalDeviceConfigurationException {
        if(signalMapping.getSupportedSignals().containsKey(opFabSignalKey)) {
            return signalMapping.getSupportedSignals().get(opFabSignalKey);
        } else {
            throw new ExternalDeviceConfigurationException(String.format(UNSUPPORTED_SIGNAL,opFabSignalKey,signalMapping.getId()));
        }
    }
}
