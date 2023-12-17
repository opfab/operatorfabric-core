/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.mongo;

import java.util.List;
import java.util.Optional;

import org.opfab.externaldevices.model.DeviceConfiguration;
import org.opfab.externaldevices.repositories.DeviceConfigurationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DeviceConfigurationRepositoryImpl implements DeviceConfigurationRepository {

    private final DeviceConfigurationMongoRepository deviceConfigurationMongoRepository;

    @Autowired
    public DeviceConfigurationRepositoryImpl(DeviceConfigurationMongoRepository deviceConfigurationMongoRepository) {
        this.deviceConfigurationMongoRepository = deviceConfigurationMongoRepository;
    }

    @Override
    public Optional<DeviceConfiguration> findById(String id) {
        return deviceConfigurationMongoRepository.findById(id);
    }

    @Override
    public List<DeviceConfiguration> findAll() {
        return deviceConfigurationMongoRepository.findAll();
    }

    @Override
    public void deleteById(String id) {
        deviceConfigurationMongoRepository.deleteById(id);
    }

    @Override
    public void deleteAll() {
        deviceConfigurationMongoRepository.deleteAll();
    }

    @Override
    public void insert(DeviceConfiguration deviceConfiguration) {
        deviceConfigurationMongoRepository.insert(deviceConfiguration);
    }

    @Override
    public void save(DeviceConfiguration deviceConfiguration) {
        deviceConfigurationMongoRepository.save(deviceConfiguration);
    }

    @Override
    public void saveAll(List<DeviceConfiguration> deviceConfigurations) {
        deviceConfigurationMongoRepository.saveAll(deviceConfigurations);
    }

    @Override
    public List<DeviceConfiguration> findBySignalMappingId(String signalMappingId) {
        return deviceConfigurationMongoRepository.findBySignalMappingId(signalMappingId);
    }

}
