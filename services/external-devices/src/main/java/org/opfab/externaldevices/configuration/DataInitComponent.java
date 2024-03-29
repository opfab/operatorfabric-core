/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.configuration;


import lombok.extern.slf4j.Slf4j;
import org.opfab.externaldevices.configuration.externaldevices.ExternalDevicesProperties;
import org.opfab.externaldevices.model.DeviceConfiguration;
import org.opfab.externaldevices.model.SignalMapping;
import org.opfab.externaldevices.model.UserConfiguration;
import org.opfab.externaldevices.repositories.DeviceConfigurationRepository;
import org.opfab.externaldevices.repositories.SignalMappingRepository;
import org.opfab.externaldevices.repositories.UserConfigurationRepository;
import org.opfab.externaldevices.services.DevicesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.List;

/**
 * This component reads external devices configuration from a properties file and updates/creates them as appropriate.
 */
@Component
@Slf4j
public class DataInitComponent {

    private static final String FAILED_INIT_MSG = "Unable to insert ";
    private static final String NUMBER_OF_ITEMS_DEBUG = "Found {} {} in properties file.";
    private static final String NO_PROPERTIES_DEBUG = "No {} in properties file.";

    private final ExternalDevicesProperties externalDevicesProperties;
    private final DeviceConfigurationRepository deviceConfigurationRepository;
    private final SignalMappingRepository signalMappingRepository;
    private final UserConfigurationRepository userConfigurationRepository;
    private final DevicesService deviceService;

    @Autowired
    public DataInitComponent(ExternalDevicesProperties externalDevicesProperties,
                             DeviceConfigurationRepository deviceConfigurationRepository,
                             SignalMappingRepository signalMappingRepository,
                             UserConfigurationRepository userConfigurationRepository,
                             DevicesService deviceService) {
        this.externalDevicesProperties = externalDevicesProperties;
        this.deviceConfigurationRepository = deviceConfigurationRepository;
        this.signalMappingRepository = signalMappingRepository;
        this.userConfigurationRepository = userConfigurationRepository;
        this.deviceService = deviceService;
    }

    @PostConstruct
    public void init() {

        if(externalDevicesProperties == null) {
            log.info(NO_PROPERTIES_DEBUG,"external devices properties");
        } else {

            initSignalMappings(externalDevicesProperties.getSignalMappings());
            initDeviceConfigurations(externalDevicesProperties.getDeviceConfigurations());
            initUserConfigurations(externalDevicesProperties.getUserConfigurations());

        }

    }

    /**
     * Initialize signal mappings using provided collection (if null, log debug message).
     */
    private void initSignalMappings(List<SignalMapping> signalMappings) {
        if(signalMappings != null) {
            log.debug(NUMBER_OF_ITEMS_DEBUG,signalMappings.size(),"signal mappings");
            for(SignalMapping signalMappingData : signalMappings) {
                safeInsertDeviceSignalMapping(signalMappingData);
            }
        } else {
            log.debug(NO_PROPERTIES_DEBUG,"signal mapping");
        }
    }

    /**
     * Initialize device configurations using provided collection (if null, log debug message).
     */
    private void initDeviceConfigurations(List<DeviceConfiguration> deviceConfigurations) {
        if(deviceConfigurations != null) {
            log.debug(NUMBER_OF_ITEMS_DEBUG,deviceConfigurations.size(),"device configurations");
            for(DeviceConfiguration deviceConfigurationData : deviceConfigurations) {
                safeInsertDeviceConfiguration(deviceConfigurationData);
            }
        } else {
            log.debug(NO_PROPERTIES_DEBUG,"device configurations");
        }
    }

    /**
     * Initialize user configurations using provided collection (if null, log debug message).
     */
    private void initUserConfigurations(List<UserConfiguration> userConfigurations) {
        if(userConfigurations != null) {
            log.debug(NUMBER_OF_ITEMS_DEBUG,userConfigurations.size(),"user configurations");
            for(UserConfiguration userConfigurationData : userConfigurations) {
                safeInsertUserConfiguration(userConfigurationData);
            }
        } else {
            log.debug(NO_PROPERTIES_DEBUG,"user configurations");
        }
    }

    /**
     * Inserts device configuration unless a configuration already exists with the same id. In this case log it and
     * carry on with the next configuration
     *
     * @param deviceConfigurationData
     */
    private void safeInsertDeviceConfiguration(DeviceConfiguration deviceConfigurationData) {
        try {
            deviceConfigurationRepository.insert(deviceConfigurationData);
            if (Boolean.TRUE.equals(deviceConfigurationData.isEnabled))  enableDevice(deviceConfigurationData.id);
        } catch (DuplicateKeyException ex) {
            log.warn("{} {} device configuration: duplicate",FAILED_INIT_MSG, deviceConfigurationData.id);
        }
    }

    private void enableDevice(String deviceId) {
        try {
            deviceService.enableDevice(deviceId);
        }
        catch (Exception exc) {
            log.warn("Impossible to enable device {} ", deviceId ,exc);
        }
    }
    /**
     * Inserts signal mapping unless a mapping already exists with the same id. In this case log it and
     * carry on with the next mapping
     *
     * @param signalMappingData
     */
    private void safeInsertDeviceSignalMapping(SignalMapping signalMappingData) {
        try {
            signalMappingRepository.insert(signalMappingData);
        } catch (DuplicateKeyException ex) {
            log.warn("{} {} signal mapping: duplicate",FAILED_INIT_MSG, signalMappingData.id);
        }
    }

    /**
     * Inserts signal mapping unless a mapping already exists with the same id. In this case log it and
     * carry on with the next mapping
     *
     * @param userConfigurationData
     */
    private void safeInsertUserConfiguration(UserConfiguration userConfigurationData) {
        try {
            userConfigurationRepository.insert(userConfigurationData);
        } catch (DuplicateKeyException ex) {
            log.warn("{} {} user configuration: duplicate",FAILED_INIT_MSG, userConfigurationData.userLogin);
        }
    }

}
