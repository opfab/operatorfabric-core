/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.publication.application;

import org.opfab.cards.publication.configuration.TestCardReceiver;
import org.opfab.cards.publication.configuration.TestConsumerConfig;
import org.opfab.cards.publication.configuration.WebSecurityConfigurationTest;
import org.opfab.cards.publication.kafka.CardObjectMapper;
import org.opfab.cards.publication.kafka.card.CardCommandFactory;
import org.opfab.cards.publication.kafka.producer.ResponseCardProducer;
import org.opfab.cards.publication.repositories.ArchivedCardRepositoryForTest;
import org.opfab.cards.publication.repositories.CardRepositoryForTest;
import org.opfab.cards.publication.services.clients.impl.ExternalAppClientImpl;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.opfab.springtools.configuration.mongo.EnableOperatorFabricMongo;

import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.opfab.aop.annotations.EnableAopTraceProcessing;
import org.opfab.cards.publication.configuration.mongo.LocalMongoConfiguration;
import org.opfab.cards.publication.services.CardNotificationService;
import org.opfab.cards.publication.services.CardProcessingService;
import org.opfab.cards.publication.services.RecipientProcessor;
import org.opfab.cards.publication.services.CardRepositoryService;
import org.opfab.cards.publication.services.processors.impl.UserCardProcessorImpl;
import org.opfab.cards.publication.services.TraceRepository;
import org.opfab.cards.publication.configuration.json.JacksonConfig;
import org.opfab.cards.publication.configuration.Common;
import org.opfab.cards.publication.controllers.CardController;

import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.ImportResource;

@SpringBootApplication
@EnableOperatorFabricMongo
@EnableMongoRepositories(basePackageClasses = {CardRepositoryForTest.class , TraceRepository.class,  ArchivedCardRepositoryForTest.class})
@EnableAopTraceProcessing
@Import({LocalMongoConfiguration.class, CardProcessingService.class, RecipientProcessor.class, CardNotificationService.class,
    CardRepositoryService.class, UserCardProcessorImpl.class, ExternalAppClientImpl.class , ResponseCardProducer.class
, CardCommandFactory.class, CardObjectMapper.class, TestCardReceiver.class , TestConsumerConfig.class, JacksonConfig.class
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
