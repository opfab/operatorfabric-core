/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.thirds.application;

import org.lfenergy.operatorfabric.thirds.configuration.json.JacksonConfig;
import org.lfenergy.operatorfabric.thirds.controllers.CustomExceptionHandler;
import org.lfenergy.operatorfabric.thirds.controllers.ThirdsController;
import org.lfenergy.operatorfabric.thirds.services.ThirdsService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@Import({ThirdsService.class, CustomExceptionHandler.class, JacksonConfig.class, ThirdsController.class})
public class IntegrationTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(IntegrationTestApplication.class, args);
        assert (ctx != null);
    }

}
