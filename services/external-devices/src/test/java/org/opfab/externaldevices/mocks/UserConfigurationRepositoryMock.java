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

import org.opfab.externaldevices.model.UserConfiguration;
import org.opfab.externaldevices.repositories.UserConfigurationRepository;

public class UserConfigurationRepositoryMock implements UserConfigurationRepository {

    Hashtable<String, UserConfiguration> userConfigurations = new Hashtable<String, UserConfiguration>();

    @Override
    public void save(UserConfiguration userConfiguration) {
        this.userConfigurations.put(userConfiguration.userLogin, userConfiguration);
    }

    @Override
    public List<UserConfiguration> findAll() {
        return this.userConfigurations.values().stream().toList();
    }

    @Override
    public Optional<UserConfiguration> findById(String id) {
        return Optional.ofNullable(this.userConfigurations.get(id));
    }

    @Override
    public void deleteById(String id) {
        this.userConfigurations.remove(id);
    }

    @Override
    public List<UserConfiguration> findByExternalDeviceIds(String externalDeviceId) {
        return this.userConfigurations.values().stream()
                .filter(userConfiguration -> {
                    if (userConfiguration.externalDeviceIds == null) {
                        return false;
                    }
                    return userConfiguration.externalDeviceIds.contains(externalDeviceId);
                }).toList();
    }

    @Override
    public void insert(UserConfiguration userConfiguration) {
        this.userConfigurations.put(userConfiguration.userLogin, userConfiguration);
    }

    @Override
    public void saveAll(List<UserConfiguration> userConfigurations) {
        userConfigurations.forEach(
                userConfiguration -> this.userConfigurations.put(userConfiguration.userLogin, userConfiguration));
    }

    @Override
    public void deleteAll() {
        this.userConfigurations.clear();
    }

}
