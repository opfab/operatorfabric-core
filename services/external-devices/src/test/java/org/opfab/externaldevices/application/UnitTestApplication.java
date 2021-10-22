/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.externaldevices.application;

import org.opfab.externaldevices.configuration.json.JacksonConfig;
import org.opfab.externaldevices.controllers.ConfigurationsController;
import org.opfab.externaldevices.controllers.CustomExceptionHandler;
import org.opfab.externaldevices.controllers.DevicesController;
import org.opfab.externaldevices.controllers.NotificationsController;
import org.opfab.externaldevices.repositories.DeviceConfigurationRepository;
import org.opfab.externaldevices.repositories.SignalMappingRepository;
import org.opfab.externaldevices.repositories.UserConfigurationRepository;
import org.opfab.externaldevices.services.DevicesService;
import org.opfab.springtools.configuration.mongo.EnableOperatorFabricMongo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.ImportResource;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableOperatorFabricMongo
@EnableMongoRepositories(basePackageClasses = {DeviceConfigurationRepository.class, UserConfigurationRepository.class, SignalMappingRepository.class})
@Import({DevicesService.class, CustomExceptionHandler.class, JacksonConfig.class,
        DevicesController.class,NotificationsController.class, ConfigurationsController.class})
@ImportResource({"classpath:/security.xml"})
public class UnitTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(UnitTestApplication.class, args);
        assert (ctx != null);
    }

}
