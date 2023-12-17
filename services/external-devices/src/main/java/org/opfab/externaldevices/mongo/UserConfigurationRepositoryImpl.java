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

import org.opfab.externaldevices.model.UserConfiguration;
import org.opfab.externaldevices.repositories.UserConfigurationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserConfigurationRepositoryImpl implements UserConfigurationRepository {

    UserConfigurationMongoRepository userConfigurationMongoRepository;

    @Autowired
    public UserConfigurationRepositoryImpl(UserConfigurationMongoRepository userConfigurationMongoRepository) {
        this.userConfigurationMongoRepository = userConfigurationMongoRepository;
    }

    @Override
    public void save(UserConfiguration userConfiguration) {
        this.userConfigurationMongoRepository.save(userConfiguration);
    }

    @Override
    public List<UserConfiguration> findAll() {
        return this.userConfigurationMongoRepository.findAll();
    }

    @Override
    public Optional<UserConfiguration> findById(String id) {
        return this.userConfigurationMongoRepository.findById(id);
    }

    @Override
    public void deleteById(String id) {
        this.userConfigurationMongoRepository.deleteById(id);
    }

    @Override
    public List<UserConfiguration> findByExternalDeviceIds(String externalDeviceId) {
        return this.userConfigurationMongoRepository.findByExternalDeviceIds(externalDeviceId);
    }

    @Override
    public void insert(UserConfiguration userConfiguration) {
        this.userConfigurationMongoRepository.insert(userConfiguration);
    }

    @Override
    public void saveAll(List<UserConfiguration> userConfigurations) {
        this.userConfigurationMongoRepository.saveAll(userConfigurations);
    }

    @Override
    public void deleteAll() {
        this.userConfigurationMongoRepository.deleteAll();
    }

}
