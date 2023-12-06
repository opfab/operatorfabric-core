/* Copyright (c) 2020-2021 Alliander (http://www.alliander.com)
 * Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.kafka.integration;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.avro.*;
import org.opfab.cards.model.SeverityEnum;
import org.opfab.cards.publication.application.UnitTestApplication;
import org.opfab.cards.publication.configuration.kafka.ConsumerFactoryAutoConfiguration;
import org.opfab.cards.publication.configuration.kafka.KafkaListenerContainerFactoryConfiguration;
import org.opfab.cards.publication.configuration.kafka.ProducerFactoryAutoConfiguration;
import org.opfab.cards.publication.kafka.command.CreateCardCommandHandler;
import org.opfab.cards.publication.kafka.consumer.CardCommandConsumerListener;
import org.opfab.cards.publication.mocks.CardRepositoryMock;
import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.cards.publication.model.I18nPublicationData;
import org.opfab.cards.publication.model.TimeSpanPublicationData;
import org.opfab.cards.publication.services.ExternalAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.listener.KafkaMessageListenerContainer;
import org.springframework.kafka.listener.MessageListener;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.EmbeddedKafkaZKBroker;
import org.springframework.kafka.test.utils.ContainerTestUtils;
import org.springframework.kafka.test.utils.KafkaTestUtils;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {UnitTestApplication.class})
@ContextConfiguration(classes = { CardCommandConsumerListener.class, ConsumerFactoryAutoConfiguration.class,
        KafkaListenerContainerFactoryConfiguration.class, ProducerFactoryAutoConfiguration.class, CreateCardCommandHandler.class})
@ActiveProfiles({"test", "kafka"})
@Profile("kafka")
@DirtiesContext
@TestInstance(TestInstance.Lifecycle.PER_CLASS)

class SendKafkaCardShould {

    private static final EmbeddedKafkaBroker embeddedKafkaBroker = new EmbeddedKafkaZKBroker(1, false)
            .kafkaPorts(8384);

    @Autowired
    private CardRepositoryMock cardRepositoryMock;


    @Autowired
    private ExternalAppService externalAppService;

    @Autowired
    private KafkaTemplate<String, CardCommand> kafkaTemplate;

    @Value("${opfab.kafka.topics.card.topicname:opfab}")
    private String commandTopic;

    private static CountDownLatch latch ;
    private static volatile boolean receiveCardCommandResultIsOK;
    private KafkaMessageListenerContainer<String, String> container;



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
        embeddedKafkaBroker.afterPropertiesSet();
        String TOPIC="DummyTopic";
        Map<String, Object> configs = new HashMap<>(KafkaTestUtils.consumerProps("consumerGroup", "true", embeddedKafkaBroker));
        DefaultKafkaConsumerFactory<String, String> consumerFactory = new DefaultKafkaConsumerFactory<>(configs, new StringDeserializer(), new StringDeserializer());
        ContainerProperties containerProperties = new ContainerProperties(TOPIC);
        container = new KafkaMessageListenerContainer<>(consumerFactory, containerProperties);
        @SuppressWarnings("MismatchedQueryAndUpdateOfCollection") BlockingQueue<ConsumerRecord<String, String>> records = new LinkedBlockingQueue<>();
        container.setupMessageListener((MessageListener<String, String>) records::add);
        container.start();
        ContainerTestUtils.waitForAssignment(container, embeddedKafkaBroker.getPartitionsPerTopic());
    }

    @AfterAll
    void tearDown() {
        container.stop();
    }

    @Test
    void sendKafkaCardCommand() throws InterruptedException {
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

        kafkaTemplate.send(commandTopic,cardCommand);

        CardPublicationData card = cardRepositoryMock.findCardById(taskId + "." + processInstanceId);
        for (int retries = 10; retries >0 && card == null; retries--){
            Thread.sleep(250);  // Give the service some time to process the card
            card = cardRepositoryMock.findCardById(taskId + "." + processInstanceId);
        }

        assertThat( card, is(notNullValue()));
    }

    @KafkaListener(topics = "${opfab.kafka.topics.response-card.topicname}",
            properties = {"auto.offset.reset = earliest"})
    public void consumer(ConsumerRecord<String, CardCommand> consumerRecord) {
        CardCommand cardCommand = consumerRecord.value();
        ResponseCard card = cardCommand.getResponseCard();

        receiveCardCommandResultIsOK = card.getPublisher().equals("PUBLISHER_1") &&
                card.getParentCardId().equals("MyParent123") &&
                cardCommand.getCommand() == CommandType.RESPONSE_CARD;
        latch.countDown();
    }

    @Test
    void receiveCardCommand() throws InterruptedException {
       // Setup
        receiveCardCommandResultIsOK = false;
        latch = new CountDownLatch(1);

        // Send response card via Kafka
        CardPublicationData cardPublicationData = CardPublicationData.builder()
                .id("12345")
                .uid("uid1234")
                .parentCardId("MyParent123")
                .publisher("PUBLISHER_1").processVersion("O")
                .processInstanceId("PROCESS_1").severity(SeverityEnum.ALARM)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .timeSpan(TimeSpanPublicationData.builder()
                        .start(Instant.ofEpochMilli(123L)).build())
                .process("process1")
                .state("state1")
                .externalRecipient("camunda1")
                .build();

        externalAppService.sendCardToExternalApplication(cardPublicationData, Optional.empty());

        assertThat (latch.await(5, TimeUnit.SECONDS), is (true));
        assertThat(receiveCardCommandResultIsOK, is(true));
    }
}
