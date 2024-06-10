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
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.avro.*;
import org.opfab.cards.publication.application.UnitTestApplication;
import org.opfab.cards.publication.configuration.kafka.ConsumerFactoryAutoConfiguration;
import org.opfab.cards.publication.configuration.kafka.KafkaListenerContainerFactoryConfiguration;
import org.opfab.cards.publication.configuration.kafka.ProducerFactoryAutoConfiguration;
import org.opfab.cards.publication.kafka.command.CreateCardCommandHandler;
import org.opfab.cards.publication.kafka.consumer.CardCommandConsumerListener;
import org.opfab.cards.publication.model.SeverityEnum;
import org.opfab.cards.publication.model.TimeSpan;
import org.opfab.cards.publication.services.ExternalAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.EmbeddedKafkaZKBroker;
import org.springframework.kafka.test.utils.KafkaTestUtils;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = { UnitTestApplication.class })
@ContextConfiguration(classes = { CardCommandConsumerListener.class, ConsumerFactoryAutoConfiguration.class,
                KafkaListenerContainerFactoryConfiguration.class, ProducerFactoryAutoConfiguration.class,
                CreateCardCommandHandler.class })
@ActiveProfiles({ "test", "kafka" })
@Profile("kafka")
@DirtiesContext
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ReceiveKafkaCardShould {
        private static final EmbeddedKafkaBroker embeddedKafkaBroker = new EmbeddedKafkaZKBroker(1, false)
                        .kafkaPorts(8384);

        @Autowired
        private ExternalAppService externalAppService;

        @Value("${operatorfabric.cards-publication.kafka.topics.card.topicname:opfab}")
        private String commandTopic;
        private static CountDownLatch latch;
        private static volatile boolean receiveCardCommandResultIsOK;

        @BeforeAll
        void setUp() {
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

        @KafkaListener(topics = "${operatorfabric.cards-publication.kafka.topics.response-card.topicname}", properties = {
                        "auto.offset.reset = earliest" })
        public void consumer(ConsumerRecord<String, CardCommand> consumerRecord) {

                CardCommand cardCommand = consumerRecord.value();
                ResponseCard card = cardCommand.getResponseCard();

                receiveCardCommandResultIsOK = card.getPublisher().equals("PUBLISHER_1") &&
                                card.getParentCardId().equals("MyParent123") &&
                                cardCommand.getCommand() == CommandType.RESPONSE_CARD;
                latch.countDown();
        }

        @Test
        void receiveCard() throws InterruptedException {
                // Setup
                receiveCardCommandResultIsOK = false;
                latch = new CountDownLatch(1);

                // Send response card via Kafka
                org.opfab.cards.publication.model.Card cardPublicationData = org.opfab.cards.publication.model.Card
                                .builder()
                                .id("12345")
                                .uid("uid1234")
                                .parentCardId("MyParent123")
                                .publisher("PUBLISHER_1").processVersion("O")
                                .processInstanceId("PROCESS_1").severity(SeverityEnum.ALARM)
                                .title(new org.opfab.cards.publication.model.I18n("title", null))
                                .summary(new org.opfab.cards.publication.model.I18n("summary", null))
                                .startDate(Instant.now())
                                .timeSpan(new TimeSpan(
                                                Instant.ofEpochMilli(123L),
                                                null,
                                                null))
                                .process("process1")
                                .state("state1")
                                .externalRecipient("camunda1")
                                .build();

                externalAppService.sendCardToExternalApplication(cardPublicationData, Optional.empty());

                assertThat(latch.await(5, TimeUnit.SECONDS), is(true));
                assertThat(receiveCardCommandResultIsOK, is(true));
        }
}
