/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.publication;


import org.opfab.useractiontracing.UserActionLogsConfiguration;
import org.opfab.useractiontracing.mongo.UserActionLogRepositoryImpl;
import org.opfab.utilities.eventbus.rabbit.RabbitEventBus;
import org.opfab.cards.publication.mongo.CardRepositoryImpl;
import org.opfab.springtools.configuration.mongo.EnableOperatorFabricMongo;
import org.opfab.springtools.configuration.oauth.EnableOperatorFabricOAuth2;
import org.opfab.springtools.configuration.oauth.UserServiceCacheImpl;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;


@SpringBootApplication
@EnableOperatorFabricOAuth2
@EnableOperatorFabricMongo
@Import({ UserActionLogsConfiguration.class,RabbitEventBus.class,CardRepositoryImpl.class,UserActionLogRepositoryImpl.class,UserServiceCacheImpl.class })
public class CardPublicationApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(CardPublicationApplication.class, args);
        assert (ctx != null);
        ctx.getBeanProvider(Jackson2ObjectMapperBuilder.class);
    }

}
