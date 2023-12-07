/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.repositories;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.externaldevices.application.UnitTestApplication;
import org.opfab.externaldevices.model.DeviceConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UnitTestApplication.class)

class DeviceConfigurationRepositoryShould {

    // This test class might be overkill given that so far we're only using native MongoRepository methods in this
    // repository but it was created to make sure the test setup (resources etc.) was working, then kept as a sanity
    // check while working on more complex tests.

    @Autowired
    DeviceConfigurationRepository deviceConfigurationRepository;

    @BeforeEach
    public void init(){
        DeviceConfiguration deviceConfiguration1, deviceConfiguration2;

        deviceConfiguration1 = new DeviceConfiguration();
        deviceConfiguration1.setId("ESS_1");
        deviceConfiguration1.setHost("some_host");
        deviceConfiguration1.setPort(1234);
        deviceConfiguration1.setSignalMappingId("someMapping");

        deviceConfiguration2 = new DeviceConfiguration();
        deviceConfiguration2.setId("ESS_2");
        deviceConfiguration2.setHost("some_other_host");
        deviceConfiguration2.setPort(1234);
        deviceConfiguration2.setSignalMappingId("someMapping");

        deviceConfigurationRepository.insert(deviceConfiguration1);
        deviceConfigurationRepository.insert(deviceConfiguration2);
    }

    @Test
    void findAll() {
        List<DeviceConfiguration> deviceConfigurationDataList = deviceConfigurationRepository.findAll();
        assertThat(deviceConfigurationDataList).hasSize(2);
    }

    @AfterEach
    public void clean(){
        deviceConfigurationRepository.deleteAll();
    }

}
