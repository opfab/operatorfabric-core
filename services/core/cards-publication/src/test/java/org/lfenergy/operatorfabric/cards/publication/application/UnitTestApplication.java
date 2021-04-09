/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.publication.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.lfenergy.operatorfabric.springtools.configuration.mongo.EnableOperatorFabricMongo;
import org.lfenergy.operatorfabric.cards.publication.repositories.CardRepositoryForTest;
import org.lfenergy.operatorfabric.cards.publication.repositories.ArchivedCardRepositoryForTest;

import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.lfenergy.operatorfabric.aop.annotations.EnableAopTraceProcessing;
import org.lfenergy.operatorfabric.cards.publication.configuration.mongo.LocalMongoConfiguration;
import org.lfenergy.operatorfabric.cards.publication.configuration.TestConsumerConfig;
import org.lfenergy.operatorfabric.cards.publication.configuration.WebSecurityConfigurationTest;
import org.lfenergy.operatorfabric.cards.publication.services.CardNotificationService;
import org.lfenergy.operatorfabric.cards.publication.services.CardProcessingService;
import org.lfenergy.operatorfabric.cards.publication.services.RecipientProcessor;
import org.lfenergy.operatorfabric.cards.publication.services.CardRepositoryService;
import org.lfenergy.operatorfabric.cards.publication.services.processors.impl.UserCardProcessorImpl;
import org.lfenergy.operatorfabric.cards.publication.services.clients.impl.ExternalAppClientImpl;
import org.lfenergy.operatorfabric.cards.publication.kafka.producer.ResponseCardProducer;
import org.lfenergy.operatorfabric.cards.publication.kafka.card.CardCommandFactory;
import org.lfenergy.operatorfabric.cards.publication.kafka.CardObjectMapper;
import org.lfenergy.operatorfabric.cards.publication.services.TraceRepository;
import org.lfenergy.operatorfabric.cards.publication.configuration.TestCardReceiver;
import org.lfenergy.operatorfabric.cards.publication.configuration.json.JacksonConfig;
import org.lfenergy.operatorfabric.cards.publication.configuration.Common;
import org.lfenergy.operatorfabric.cards.publication.controllers.CardController;

import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.ImportResource;

@SpringBootApplication
@EnableOperatorFabricMongo
@EnableMongoRepositories(basePackageClasses = {CardRepositoryForTest.class , TraceRepository.class,  ArchivedCardRepositoryForTest.class})
@EnableAopTraceProcessing
@Import({LocalMongoConfiguration.class,CardProcessingService.class,RecipientProcessor.class,CardNotificationService.class,
    CardRepositoryService.class, UserCardProcessorImpl.class, ExternalAppClientImpl.class ,ResponseCardProducer.class
, CardCommandFactory.class, CardObjectMapper.class, TestCardReceiver.class ,TestConsumerConfig.class, JacksonConfig.class
, Common.class , CardController.class, WebSecurityConfigurationTest.class })
@ImportResource("classpath:/amqp.xml")
public class UnitTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(UnitTestApplication.class, args);
        assert (ctx != null);
        ctx.getBeanProvider(Jackson2ObjectMapperBuilder
           .class);
    }

}
