/* Copyright (c) 2021, RTE (http://www.rte-france.com)
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
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.externaldevices.application.UnitTestApplication;
import org.opfab.externaldevices.model.DeviceConfigurationData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UnitTestApplication.class)
@ActiveProfiles(profiles = {"default","test"})
@Tag("end-to-end")
@Tag("mongo")
public class DeviceConfigurationRepositoryShould {

    // This test class might be overkill given that so far we're only using native MongoRepository methods in this
    // repository but it was created to make sure the test setup (resources etc.) was working, then kept as a sanity
    // check while working on more complex tests.

    @Autowired
    DeviceConfigurationRepository deviceConfigurationRepository;

    @BeforeEach
    public void init(){
        DeviceConfigurationData deviceConfiguration1, deviceConfiguration2;

        deviceConfiguration1 = DeviceConfigurationData.builder()
                .id("ESS_1")
                .host("some_host")
                .port(1234)
                .signalMappingId("someMapping")
                .build();

        deviceConfiguration2 = DeviceConfigurationData.builder()
                .id("ESS_2")
                .host("some_other_host")
                .port(1234)
                .signalMappingId("someMapping")
                .build();

        deviceConfigurationRepository.insert(deviceConfiguration1);
        deviceConfigurationRepository.insert(deviceConfiguration2);
    }

    @Test
    public void findAll() {
        List<DeviceConfigurationData> deviceConfigurationDataList = deviceConfigurationRepository.findAll();
        assertThat(deviceConfigurationDataList.size()).isEqualTo(2);
    }

    @AfterEach
    public void clean(){
        deviceConfigurationRepository.deleteAll();
    }

}
