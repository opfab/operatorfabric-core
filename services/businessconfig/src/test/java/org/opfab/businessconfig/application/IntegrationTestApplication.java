/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.businessconfig.application;

import org.opfab.businessconfig.configuration.json.JacksonConfig;
import org.opfab.businessconfig.controllers.BusinessconfigController;
import org.opfab.businessconfig.controllers.CustomExceptionHandler;
import org.opfab.businessconfig.services.MonitoringService;
import org.opfab.businessconfig.services.ProcessesService;
import org.opfab.test.EventBusSpy;
import org.opfab.useractiontracing.UserActionLogsConfiguration;
import org.opfab.useractiontracing.mongo.LastUserActionRepositoryImpl;
import org.opfab.useractiontracing.mongo.UserActionLogRepositoryImpl;
import org.opfab.useractiontracing.services.LastUserActionService;
import org.opfab.useractiontracing.services.UserActionLogService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@Import({ProcessesService.class, MonitoringService.class, CustomExceptionHandler.class, JacksonConfig.class,
        BusinessconfigController.class, EventBusSpy.class, UserActionLogsConfiguration.class,
        UserActionLogRepositoryImpl.class, UserActionLogService.class, LastUserActionService.class,
        LastUserActionRepositoryImpl.class})

public class IntegrationTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(IntegrationTestApplication.class, args);
        assert (ctx != null);
    }

}
