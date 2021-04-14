/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.consultation.application;

import lombok.extern.slf4j.Slf4j;
import org.opfab.cards.consultation.configuration.json.JacksonConfig;
import org.opfab.cards.consultation.configuration.mongo.LocalMongoConfiguration;
import org.opfab.cards.consultation.repositories.ArchivedCardRepository;
import org.opfab.cards.consultation.repositories.CardRepository;
import org.opfab.springtools.configuration.mongo.EnableOperatorFabricMongo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.ImportResource;
import org.springframework.data.mongodb.repository.config.EnableReactiveMongoRepositories;

/**
 * <p></p>
 * Created on 29/10/18
 *
 *
 */
@SpringBootApplication
@Slf4j
@EnableOperatorFabricMongo
@EnableReactiveMongoRepositories(basePackageClasses = {CardRepository.class, ArchivedCardRepository.class})
@ImportResource("classpath:/amqp.xml")
@Import({JacksonConfig.class, LocalMongoConfiguration.class})
public class IntegrationTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(IntegrationTestApplication.class, args);

        assert (ctx != null);
    }
}
