/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.consultation;

import org.opfab.useractiontracing.UserActionLogsConfiguration;
import org.opfab.useractiontracing.mongo.UserActionLogRepositoryImpl;
import org.opfab.utilities.eventbus.rabbit.RabbitEventBus;
import org.opfab.springtools.configuration.mongo.EnableOperatorFabricMongo;
import org.opfab.springtools.configuration.oauth.EnableReactiveOperatorFabricOAuth2;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.repository.config.EnableReactiveMongoRepositories;


@SpringBootApplication
@EnableReactiveOperatorFabricOAuth2
@EnableOperatorFabricMongo
@EnableReactiveMongoRepositories
@Import({ UserActionLogsConfiguration.class,UserActionLogRepositoryImpl.class,RabbitEventBus.class})
public class CardConsultationApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(CardConsultationApplication.class, args);
        assert (ctx != null);
    }
}
