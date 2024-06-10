/* Copyright (c) 2020-2021 Alliander (http://www.alliander.com)
 * Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.kafka.integration;

import org.apache.kafka.clients.admin.AdminClient;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.avro.*;
import org.opfab.cards.publication.application.UnitTestApplication;
import org.opfab.cards.publication.configuration.Services;
import org.opfab.cards.publication.configuration.kafka.ConsumerFactoryAutoConfiguration;
import org.opfab.cards.publication.configuration.kafka.KafkaListenerContainerFactoryConfiguration;
import org.opfab.cards.publication.configuration.kafka.ProducerFactoryAutoConfiguration;
import org.opfab.cards.publication.kafka.command.CreateCardCommandHandler;
import org.opfab.cards.publication.kafka.consumer.CardCommandConsumerListener;
import org.opfab.cards.publication.mocks.CardRepositoryMock;
import org.opfab.cards.publication.mocks.I18NRepositoryMock;
import org.opfab.cards.publication.mocks.ProcessRepositoryMock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.EmbeddedKafkaZKBroker;
import org.springframework.kafka.test.utils.KafkaTestUtils;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = { UnitTestApplication.class })
@ContextConfiguration(classes = { CardCommandConsumerListener.class, ConsumerFactoryAutoConfiguration.class,
                KafkaListenerContainerFactoryConfiguration.class, ProducerFactoryAutoConfiguration.class,
                CreateCardCommandHandler.class, I18NRepositoryMock.class })
@ActiveProfiles({ "test", "kafka" })
@Profile("kafka")
@DirtiesContext
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class SendKafkaCardShould {
        private static final EmbeddedKafkaBroker embeddedKafkaBroker = new EmbeddedKafkaZKBroker(1, false)
                        .kafkaPorts(8384);

        @Autowired
        private CardRepositoryMock cardRepositoryMock;

        @Autowired
        private Services services;

        @Autowired
        private KafkaTemplate<String, CardCommand> kafkaTemplate;

        @Value("${operatorfabric.cards-publication.kafka.topics.card.topicname:opfab}")
        private String commandTopic;


        @BeforeEach
        public void cleanBefore() {
                cardRepositoryMock.clear();
        }

        @AfterEach
        public void cleanAfter() {
                cardRepositoryMock.clear();
        }

        @BeforeAll
        void setUp() {

                ProcessRepositoryMock processRepositoryMock = new ProcessRepositoryMock();
                String process = "{\"id\":\"taskId\",\"states\":{\"currentState\":{\"name\":\"state1\"}}}";
                processRepositoryMock.setProcessAsString(process, "myVersion");
                services.getCardValidationService().setProcessRepository(processRepositoryMock);
                this.waitForKafkaReady();
        }

        void waitForKafkaReady() {
                embeddedKafkaBroker.afterPropertiesSet();
                Map<String, Object> configs = new HashMap<>(
                                KafkaTestUtils.consumerProps("consumerGroup", "true", embeddedKafkaBroker));
                try (AdminClient adminClient = AdminClient.create(configs)) {
                        adminClient.describeCluster().nodes().get();
                } catch (InterruptedException | ExecutionException e) {
                        throw new IllegalStateException("Failed to verify Kafka readiness", e);
                }
        }

        @Test
        void sendCard() throws InterruptedException {
                String publisher = "myPublisher";
                String processVersion = "myVersion";
                Instant startDate = Instant.now().truncatedTo(ChronoUnit.SECONDS);
                SeverityType severityType = SeverityType.INFORMATION;
                String title = "MyTitle";
                String summary = "MySummary";
                String processInstanceId = UUID.randomUUID().toString();
                String taskId = "taskId";
                String state = "currentState";

                CardCommand cardCommand = CardCommand.newBuilder()
                                .setCommand(CommandType.CREATE_CARD)
                                .setCard(Card.newBuilder()
                                                .setProcessInstanceId(processInstanceId)
                                                .setProcess(taskId)
                                                .setState(state)
                                                .setPublisher(publisher)
                                                .setProcessVersion(processVersion)
                                                .setStartDate(startDate)
                                                .setSeverity(severityType)
                                                .setTitle(new I18n(title, null))
                                                .setSummary(new I18n(summary, null))
                                                .build())
                                .build();
                kafkaTemplate.send(commandTopic, cardCommand);

                org.opfab.cards.publication.model.Card card = cardRepositoryMock
                                .findCardById(taskId + "." + processInstanceId);
 
                
                CountDownLatch latch = new CountDownLatch(20);
                for (int retries = 20; retries > 0 && card == null; retries--) {
                    card = cardRepositoryMock.findCardById(taskId + "." + processInstanceId);
                    if (card == null) {
                        try {
                            latch.await(250, TimeUnit.MILLISECONDS);
                        } catch (InterruptedException e) {
                            // No need to log this exception
                        }
                    }
                    latch.countDown();
                }

                assertThat(card, is(notNullValue()));
        }

}
