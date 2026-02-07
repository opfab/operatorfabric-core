/* Copyright (c) 2018-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.application;

import org.opfab.useractiontracing.UserActionLogsConfiguration;
import org.opfab.useractiontracing.mongo.LastUserActionRepositoryImpl;
import org.opfab.useractiontracing.mongo.UserActionLogRepositoryImpl;
import org.opfab.cards.consultation.configuration.ThreadPoolTaskSchedulerConfiguration;
import org.opfab.cards.consultation.repositories.ArchivedCardRepository;
import org.opfab.cards.consultation.repositories.CardRepository;
import org.opfab.configuration.mongo.MongoConfiguration;
import org.opfab.configuration.test.UserServiceCacheMock;
import org.opfab.test.EventBusSpy;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.repository.config.EnableReactiveMongoRepositories;

@SpringBootApplication
@EnableReactiveMongoRepositories(basePackageClasses = { CardRepository.class, ArchivedCardRepository.class })
@Import({ ThreadPoolTaskSchedulerConfiguration.class, UserActionLogsConfiguration.class,
        UserActionLogRepositoryImpl.class, EventBusSpy.class, UserServiceCacheMock.class, MongoConfiguration.class,
        LastUserActionRepositoryImpl.class })
public class IntegrationTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(IntegrationTestApplication.class, args);

        assert (ctx != null);
    }
}
