/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.businessconfig.application;

import org.lfenergy.operatorfabric.businessconfig.configuration.json.JacksonConfig;
import org.lfenergy.operatorfabric.businessconfig.controllers.CustomExceptionHandler;
import org.lfenergy.operatorfabric.businessconfig.controllers.BusinessconfigController;
import org.lfenergy.operatorfabric.businessconfig.services.ProcessesService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@Import({ProcessesService.class, CustomExceptionHandler.class, JacksonConfig.class, BusinessconfigController.class})
public class IntegrationTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(IntegrationTestApplication.class, args);
        assert (ctx != null);
    }

}
