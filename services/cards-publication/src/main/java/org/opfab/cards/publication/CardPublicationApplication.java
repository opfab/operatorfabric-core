/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.publication;

import lombok.extern.slf4j.Slf4j;
import org.opfab.aop.annotations.EnableAopTraceProcessing;
import org.opfab.springtools.configuration.mongo.EnableOperatorFabricMongo;
import org.opfab.springtools.configuration.oauth.EnableOperatorFabricOAuth2;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.ImportResource;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

@SpringBootApplication
@Slf4j
@EnableOperatorFabricOAuth2
@EnableAopTraceProcessing
@EnableOperatorFabricMongo
@ImportResource("classpath:/amqp.xml")
public class CardPublicationApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(CardPublicationApplication.class, args);
        assert (ctx != null);
        ObjectProvider<Jackson2ObjectMapperBuilder> beanProvider = ctx.getBeanProvider(Jackson2ObjectMapperBuilder
           .class);
        log.info(beanProvider.toString());
    }

}
