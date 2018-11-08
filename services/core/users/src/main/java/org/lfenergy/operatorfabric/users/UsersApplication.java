/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.users;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.config.mongo.EnableOperatorFabricMongo;
import org.lfenergy.operatorfabric.users.repositories.UserRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@Slf4j
@RefreshScope
@EnableOperatorFabricMongo
@EnableMongoRepositories(basePackageClasses = UserRepository.class)
@EnableConfigurationProperties
@EnableDiscoveryClient
public class UsersApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(UsersApplication.class, args);
        assert (ctx != null);
    }



}
