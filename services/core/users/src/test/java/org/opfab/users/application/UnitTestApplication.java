/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.users.application;

import org.opfab.springtools.configuration.mongo.EnableOperatorFabricMongo;
import org.opfab.springtools.configuration.oauth.jwt.JwtProperties;
import org.opfab.springtools.configuration.oauth.jwt.groups.GroupsProperties;
import org.opfab.springtools.configuration.oauth.jwt.groups.GroupsUtils;
import org.opfab.users.configuration.DataInitComponent;
import org.opfab.users.configuration.json.JacksonConfig;
import org.opfab.users.configuration.mongo.LocalMongoConfiguration;
import org.opfab.users.configuration.users.UsersProperties;
import org.opfab.users.controllers.*;
import org.opfab.users.controllers.*;
import org.opfab.users.repositories.UserRepository;
import org.opfab.users.services.UserServiceImp;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.ImportResource;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import lombok.extern.slf4j.Slf4j;

@SpringBootApplication
@EnableOperatorFabricMongo
@EnableConfigurationProperties
@EnableMongoRepositories(basePackageClasses = UserRepository.class)
@Import({JacksonConfig.class, LocalMongoConfiguration.class, UsersProperties.class, CustomExceptionHandler.class,
   GroupsController.class, EntitiesController.class, UsersController.class, PerimetersController.class,
   CurrentUserWithPerimetersController.class, DataInitComponent.class, GroupsProperties.class, GroupsUtils.class,
   JwtProperties.class, UserServiceImp.class})
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
