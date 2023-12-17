/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.mocks;

import java.util.Hashtable;
import java.util.List;
import java.util.Optional;

import org.opfab.externaldevices.model.DeviceConfiguration;
import org.opfab.externaldevices.repositories.DeviceConfigurationRepository;

public class DeviceConfigurationRepositoryMock implements DeviceConfigurationRepository {

    private Hashtable<String, DeviceConfiguration> config = new Hashtable<String, DeviceConfiguration>();

    @Override
    public Optional<DeviceConfiguration> findById(String id) {
        return Optional.ofNullable(this.config.get(id));
    }

    @Override
    public List<DeviceConfiguration> findAll() {
        return this.config.values().stream().toList();
    }

    @Override
    public void deleteById(String id) {
        this.config.remove(id);
    }

    @Override
    public void deleteAll() {
        this.config.clear();
    }

    @Override
    public void insert(DeviceConfiguration deviceConfiguration) {
        this.config.put(deviceConfiguration.id, deviceConfiguration);
    }

    @Override
    public void save(DeviceConfiguration deviceConfiguration) {
        this.config.put(deviceConfiguration.id, deviceConfiguration);
    }

    @Override
    public void saveAll(List<DeviceConfiguration> deviceConfigurations) {
        deviceConfigurations
                .forEach(deviceConfiguration -> this.config.put(deviceConfiguration.id, deviceConfiguration));
    }

    @Override
    public List<DeviceConfiguration> findBySignalMappingId(String signalMappingId) {
        return this.config.values().stream().filter(deviceConfiguration -> {
            if (deviceConfiguration.signalMappingId == null) {
                return false;
            }
            return deviceConfiguration.signalMappingId.equals(signalMappingId);
        }).toList();
    }

}
