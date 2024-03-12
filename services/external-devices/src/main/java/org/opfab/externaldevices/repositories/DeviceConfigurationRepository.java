/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.repositories;

import org.opfab.externaldevices.model.DeviceConfiguration;

import java.util.List;
import java.util.Optional;

public interface DeviceConfigurationRepository {

    Optional<DeviceConfiguration> findById(String id);

    List<DeviceConfiguration> findAll();

    void deleteById(String id);

    void deleteAll();

    void insert(DeviceConfiguration deviceConfiguration);

    void save(DeviceConfiguration deviceConfiguration);

    void saveAll(List<DeviceConfiguration> deviceConfigurations);

    List<DeviceConfiguration> findBySignalMappingId(String signalMappingId);

}
