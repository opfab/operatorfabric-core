/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.publication;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.configuration.mongo.EnableOperatorFabricMongo;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.ImportResource;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

@SpringBootApplication
@Slf4j
@RefreshScope
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
