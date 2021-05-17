/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
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
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.ImportResource;

@SpringBootApplication
@Import({ProcessesService.class, MonitoringService.class, CustomExceptionHandler.class, JacksonConfig.class, BusinessconfigController.class})
@ImportResource({"classpath:/security.xml"})

public class IntegrationTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(IntegrationTestApplication.class, args);
        assert (ctx != null);
    }

}
