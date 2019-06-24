/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.users.application;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.configuration.mongo.EnableOperatorFabricMongo;
import org.lfenergy.operatorfabric.users.configuration.DataInitComponent;
import org.lfenergy.operatorfabric.users.configuration.json.JacksonConfig;
import org.lfenergy.operatorfabric.users.configuration.mongo.LocalMongoConfiguration;
import org.lfenergy.operatorfabric.users.configuration.users.UsersProperties;
import org.lfenergy.operatorfabric.users.controllers.CustomExceptionHandler;
import org.lfenergy.operatorfabric.users.controllers.GroupsController;
import org.lfenergy.operatorfabric.users.controllers.UsersController;
import org.lfenergy.operatorfabric.users.repositories.UserRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.ImportResource;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableOperatorFabricMongo
@EnableConfigurationProperties
@EnableMongoRepositories(basePackageClasses = UserRepository.class)
@Import({JacksonConfig.class, LocalMongoConfiguration.class,UsersProperties.class,CustomExceptionHandler.class,GroupsController
   .class,UsersController.class,DataInitComponent.class})
@ImportResource("classpath:/security.xml")
@Slf4j
public class UnitTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(UnitTestApplication.class, args);
        assert (ctx != null);
//        DataInitService service = ctx.getBean(DataInitService.class);
//        assert service.isInitiated();
    }

}
