/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.actions;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.configuration.mongo.EnableOperatorFabricMongo;
import org.lfenergy.operatorfabric.springtools.configuration.oauth.EnableReactiveOperatorFabricOAuth2;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.data.mongodb.repository.config.EnableReactiveMongoRepositories;


@SpringBootApplication
@Slf4j
@RefreshScope
@EnableDiscoveryClient
@EnableReactiveOperatorFabricOAuth2
@EnableOperatorFabricMongo
@EnableReactiveMongoRepositories
//@ImportResource("classpath:/amqp.xml")
public class ActionsApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(ActionsApplication.class, args);

        assert (ctx != null);
    }
}