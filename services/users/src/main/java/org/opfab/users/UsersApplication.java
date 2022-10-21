/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.users;

import lombok.extern.slf4j.Slf4j;
import org.opfab.actiontracing.UserActionLogsConfiguration;
import org.opfab.springtools.configuration.mongo.EnableOperatorFabricMongo;
import org.opfab.users.repositories.UserRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@Slf4j
@EnableOperatorFabricMongo
@EnableMongoRepositories(basePackageClasses = UserRepository.class)
@EnableConfigurationProperties
@Import(UserActionLogsConfiguration.class)
public class UsersApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(UsersApplication.class, args);
        assert (ctx != null);
    }



}
