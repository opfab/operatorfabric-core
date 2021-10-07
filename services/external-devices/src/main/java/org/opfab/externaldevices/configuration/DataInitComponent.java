/* Copyright (c) 2021, RTE (http://www.rte-france.com)
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
import org.opfab.externaldevices.model.DeviceConfigurationData;
import org.opfab.externaldevices.model.SignalMappingData;
import org.opfab.externaldevices.model.UserConfigurationData;
import org.opfab.externaldevices.repositories.DeviceConfigurationRepository;
import org.opfab.externaldevices.repositories.SignalMappingRepository;
import org.opfab.externaldevices.repositories.UserConfigurationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

/**
 * This component reads external devices configuration from a properties file and updates/creates them as appropriate.
 */
@Component
@Slf4j
public class DataInitComponent {

    private static final String FAILED_INIT_MSG = "Unable to insert ";

    @Autowired
    private ExternalDevicesProperties externalDevicesProperties;

    @Autowired
    private DeviceConfigurationRepository deviceConfigurationRepository;

    @Autowired
    private SignalMappingRepository signalMappingRepository; //TODO rename signal mapping to signal conf ?

    @Autowired
    private UserConfigurationRepository userConfigurationRepository;

    @PostConstruct
    public void init() {

        //TODO Handle no config found (to avoid null pointer)

        log.info("Found {} signal mappings in properties file",externalDevicesProperties.getSignalMappings().size());

        log.info("Found {} device configurations in properties file",externalDevicesProperties.getDeviceConfigurations().size());

        log.info("Found {} user configurations in properties file",externalDevicesProperties.getUserConfigurations().size());


        //TODO Before accepting a DeviceConfig, check if signalMappingId exists? It should be done for properties loading and through the API. See if/what is done for users/groups

        for(SignalMappingData signalMappingData : externalDevicesProperties.getSignalMappings()) {
            safeInsertDeviceSignalMapping(signalMappingData);
        }

        for(DeviceConfigurationData deviceConfigurationData : externalDevicesProperties.getDeviceConfigurations()) {
            safeInsertDeviceConfiguration(deviceConfigurationData);
        }

        for(UserConfigurationData userConfigurationData : externalDevicesProperties.getUserConfigurations()) {
            safeInsertUserConfiguration(userConfigurationData);
        }

    }

    /**
     * Inserts device configuration unless a configuration already exists with the same id. In this case log it and
     * carry on with the next configuration
     *
     * @param deviceConfigurationData
     */
    private void safeInsertDeviceConfiguration(DeviceConfigurationData deviceConfigurationData) {
        try {
            deviceConfigurationRepository.insert(deviceConfigurationData);
        } catch (DuplicateKeyException ex) {
            log.warn("{} {} device configuration: duplicate",FAILED_INIT_MSG, deviceConfigurationData.getId());
        }
    }

    /**
     * Inserts signal mapping unless a mapping already exists with the same id. In this case log it and
     * carry on with the next mapping
     *
     * @param signalMappingData
     */
    private void safeInsertDeviceSignalMapping(SignalMappingData signalMappingData) {
        try {
            signalMappingRepository.insert(signalMappingData);
        } catch (DuplicateKeyException ex) {
            log.warn("{} {} signal mapping: duplicate",FAILED_INIT_MSG, signalMappingData.getId());
        }
    }

    /**
     * Inserts signal mapping unless a mapping already exists with the same id. In this case log it and
     * carry on with the next mapping
     *
     * @param userConfigurationData
     */
    private void safeInsertUserConfiguration(UserConfigurationData userConfigurationData) {
        try {
            userConfigurationRepository.insert(userConfigurationData);
        } catch (DuplicateKeyException ex) {
            log.warn("{} {} user configuration: duplicate",FAILED_INIT_MSG, userConfigurationData.getUserLogin());
        }
    }

}
