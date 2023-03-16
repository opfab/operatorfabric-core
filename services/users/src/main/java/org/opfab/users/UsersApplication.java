/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users;

import org.opfab.useractiontracing.UserActionLogsConfiguration;
import org.opfab.users.mongo.repositories.EntityRepositoryImpl;
import org.opfab.users.mongo.repositories.CachedGroupRepositoryImpl;
import org.opfab.users.mongo.repositories.PerimeterRepositoryImpl;
import org.opfab.users.mongo.repositories.UserRepositoryImpl;
import org.opfab.users.mongo.repositories.UserSettingsRepositoryImpl;
import org.opfab.utilities.eventbus.rabbit.RabbitEventBus;
import org.opfab.springtools.configuration.mongo.EnableOperatorFabricMongo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableOperatorFabricMongo
@EnableMongoRepositories(basePackageClasses = UsersApplication.class)
@EnableConfigurationProperties
@Import({ UserActionLogsConfiguration.class, EntityRepositoryImpl.class, CachedGroupRepositoryImpl.class,
        PerimeterRepositoryImpl.class,UserRepositoryImpl.class, UserSettingsRepositoryImpl.class, RabbitEventBus.class })
public class UsersApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(UsersApplication.class, args);
        assert (ctx != null);
    }

}
