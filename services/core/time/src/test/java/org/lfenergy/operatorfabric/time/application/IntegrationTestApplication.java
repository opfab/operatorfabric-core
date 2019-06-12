/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.time.application;

import org.lfenergy.operatorfabric.time.application.configuration.CardFeignMockConfiguration;
import org.lfenergy.operatorfabric.time.configuration.AmqpConfig;
import org.lfenergy.operatorfabric.time.configuration.CoreConfig;
import org.lfenergy.operatorfabric.time.configuration.json.JacksonConfig;
import org.lfenergy.operatorfabric.time.controllers.TimeController;
import org.lfenergy.operatorfabric.time.services.TimeService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@Import({TimeService.class,AmqpConfig.class,JacksonConfig.class,
   TimeController.class, CoreConfig.class, CardFeignMockConfiguration.class})
public class IntegrationTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(IntegrationTestApplication.class, args);
        assert (ctx != null);
    }

}
