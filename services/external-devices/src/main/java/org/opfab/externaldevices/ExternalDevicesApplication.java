/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices;


import org.opfab.springtools.configuration.mongo.EnableOperatorFabricMongo;
import org.opfab.springtools.configuration.oauth.EnableOperatorFabricOAuth2;
import org.opfab.springtools.configuration.oauth.UserServiceCacheImpl;
import org.opfab.utilities.eventbus.rabbit.RabbitEventBus;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication
@EnableOperatorFabricOAuth2
@EnableOperatorFabricMongo
@EnableMongoRepositories
@EnableConfigurationProperties
@EnableScheduling
@Import({RabbitEventBus.class,UserServiceCacheImpl.class})
public class ExternalDevicesApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(ExternalDevicesApplication.class, args);
        assert (ctx != null);

    }

}
