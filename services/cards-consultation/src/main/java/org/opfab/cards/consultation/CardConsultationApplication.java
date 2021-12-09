/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.consultation;

import lombok.extern.slf4j.Slf4j;
import org.opfab.springtools.configuration.mongo.EnableOperatorFabricMongo;
import org.opfab.springtools.configuration.oauth.EnableReactiveOperatorFabricOAuth2;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.ImportResource;
import org.springframework.data.mongodb.repository.config.EnableReactiveMongoRepositories;


@SpringBootApplication
@Slf4j
@EnableReactiveOperatorFabricOAuth2
@EnableOperatorFabricMongo
@EnableReactiveMongoRepositories
@ImportResource("classpath:/amqp.xml")
public class CardConsultationApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(CardConsultationApplication.class, args);

        assert (ctx != null);
    }
}
