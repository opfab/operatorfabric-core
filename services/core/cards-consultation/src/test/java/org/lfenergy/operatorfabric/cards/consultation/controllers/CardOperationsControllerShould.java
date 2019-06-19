/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.consultation.TestUtilities;
import org.lfenergy.operatorfabric.cards.consultation.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.cards.consultation.model.CardOperation;
import org.lfenergy.operatorfabric.cards.consultation.model.CardOperationConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.model.LightCardConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.repositories.CardRepository;
import org.lfenergy.operatorfabric.cards.consultation.services.CardSubscription;
import org.lfenergy.operatorfabric.cards.consultation.services.CardSubscriptionService;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.function.Consumer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.lfenergy.operatorfabric.cards.consultation.TestUtilities.createSimpleCard;

/**
 * <p></p>
 * Created on 29/10/18
 *
 * @author David Binder
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {IntegrationTestApplication.class, CardSubscriptionService.class, CardOperationsController
   .class})
@Slf4j
@ActiveProfiles("test")
@Tag("end-to-end")
@Tag("amqp")
public class CardOperationsControllerShould {
    private static String TEST_ID = "testClient";

    private static Instant now = Instant.now();
    private static Instant nowPlusOne = now.plus(1, ChronoUnit.HOURS);
    private static Instant nowPlusTwo = now.plus(2, ChronoUnit.HOURS);
    private static Instant nowPlusThree = now.plus(3, ChronoUnit.HOURS);
    private static Instant nowMinusOne = now.minus(1, ChronoUnit.HOURS);
    private static Instant nowMinusTwo = now.minus(2, ChronoUnit.HOURS);
    private static Instant nowMinusThree = now.minus(3, ChronoUnit.HOURS);

    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Autowired
    private TopicExchange groupExchange;
    @Autowired
    private DirectExchange userExchange;
    @Autowired
    private CardOperationsController controller;
    @Autowired
    private CardSubscriptionService service;
    @Autowired
    private ObjectMapper mapper;
    @Autowired
    private ThreadPoolTaskScheduler taskScheduler;
    @Autowired
    private CardRepository repository;

    private User user;

    public CardOperationsControllerShould(){
        user = new User();
        user.setLogin("ret-operator");
        user.setFirstName("Test");
        user.setLastName("User");
        List<String> groups = new ArrayList<>();
        groups.add("rte");
        groups.add("operator");
        user.setGroups(groups);
    }

//    @AfterEach
//    public void clean() {
//        repository.deleteAll().subscribe();
//    }

    @BeforeEach
    private void initCardData() {
        service.clearSubscriptions();
        StepVerifier.create(repository.deleteAll()).expectComplete().verify();
        int processNo = 0;
//create past cards
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowMinusTwo, nowMinusOne,"rte-operator","rte","operator")))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowMinusTwo, nowMinusOne,"rte-operator","rte","operator")))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowMinusOne, now,"rte-operator","rte","operator")))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        //create future cards
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, now, nowPlusOne,"rte-operator","rte","operator")))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowPlusOne, nowPlusTwo,"rte-operator","rte","operator")))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowPlusTwo, nowPlusThree,"rte-operator","rte","operator")))
                .expectNextCount(1)
                .expectComplete()
                .verify();

        //card starts in past and ends in future
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowMinusThree, nowPlusThree,"rte-operator","rte","operator")))
                .expectNextCount(1)
                .expectComplete()
                .verify();

        //card starts in past and never ends
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowMinusThree, null,"rte-operator","rte","operator")))
                .expectNextCount(1)
                .expectComplete()
                .verify();

        //card starts in future and nerver ends
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowPlusThree, null,"rte-operator","rte","operator")))
                .expectNextCount(1)
                .expectComplete()
                .verify();

        //create later published cards in past
        //this one overides first
        StepVerifier.create(repository.save(createSimpleCard(1, nowPlusOne, nowMinusTwo, nowMinusOne,"rte-operator","rte","operator")))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowPlusOne, nowMinusTwo, nowMinusOne,"rte-operator","rte","operator")))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        //create later published cards in future
        // this one overrides third
        StepVerifier.create(repository.save(createSimpleCard(3, nowPlusOne, nowPlusOne, nowPlusTwo,"rte-operator","rte","operator")))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowPlusOne, nowPlusTwo, nowPlusThree,"rte-operator","rte","operator")))
                .expectNextCount(1)
                .expectComplete()
                .verify();
    }

    @Test
    public void receiveNotificationCards() {
        Flux<String> publisher = controller.registerSubscriptionAndPublish(Mono.just(
                CardOperationsGetParameters.builder()
                        .user(user)
                        .clientId(TEST_ID)
                        .test(false)
                        .notification(true).build()
                ));
        StepVerifier.FirstStep<CardOperation> verifier = StepVerifier.create(publisher.map(s -> TestUtilities.readCardOperation(mapper, s)).doOnNext(TestUtilities::logCardOperation));
        taskScheduler.schedule(createSendMessageTask(), new Date(System.currentTimeMillis() + 1000));
        verifier
                .assertNext(op->{
                    assertThat(op.getCards().size()).isEqualTo(2);
                    assertThat(op.getPublishDate()).isEqualTo(nowPlusOne);
                    assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESSnotif1");
                    assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESSnotif2");
                })
           .thenCancel()
           .verify();
    }

    @Test
    public void receiveOlderCards() {
        Flux<String> publisher = controller.registerSubscriptionAndPublish(Mono.just(
                CardOperationsGetParameters.builder()
                        .user(user)
                        .clientId(TEST_ID)
                        .test(false)
                        .rangeStart(now)
                        .rangeEnd(nowPlusThree)
                        .notification(false).build()
        ));
        StepVerifier.FirstStep<CardOperation> verifier = StepVerifier.create(publisher.map(s -> TestUtilities.readCardOperation(mapper, s)).doOnNext(TestUtilities::logCardOperation));
        verifier
                .assertNext(op->{
                    assertThat(op.getCards().size()).isEqualTo(6);
                    assertThat(op.getPublishDate()).isEqualTo(nowMinusThree);
                    assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS6");
                    assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS7");
                    assertThat(op.getCards().get(2).getId()).isEqualTo("PUBLISHER_PROCESS2");
                    assertThat(op.getCards().get(3).getId()).isEqualTo("PUBLISHER_PROCESS4");
                    assertThat(op.getCards().get(4).getId()).isEqualTo("PUBLISHER_PROCESS5");
                    assertThat(op.getCards().get(5).getId()).isEqualTo("PUBLISHER_PROCESS8");
                })
                .expectComplete()
                .verify();
    }
    @Test
    public void receiveOlderCardsAndNotification() {
        Flux<String> publisher = controller.registerSubscriptionAndPublish(Mono.just(
                CardOperationsGetParameters.builder()
                        .user(user)
                        .clientId(TEST_ID)
                        .test(false)
                        .rangeStart(now)
                        .rangeEnd(nowPlusThree)
                        .notification(true).build()
        ));
        StepVerifier.FirstStep<CardOperation> verifier = StepVerifier.create(publisher.map(s -> TestUtilities.readCardOperation(mapper, s)).doOnNext(TestUtilities::logCardOperation));
        verifier
                .assertNext(op->{
                    assertThat(op.getCards().size()).isEqualTo(6);
                    assertThat(op.getPublishDate()).isEqualTo(nowMinusThree);
                    assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS6");
                    assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS7");
                    assertThat(op.getCards().get(2).getId()).isEqualTo("PUBLISHER_PROCESS2");
                    assertThat(op.getCards().get(3).getId()).isEqualTo("PUBLISHER_PROCESS4");
                    assertThat(op.getCards().get(4).getId()).isEqualTo("PUBLISHER_PROCESS5");
                    assertThat(op.getCards().get(5).getId()).isEqualTo("PUBLISHER_PROCESS8");
                })
                .then(createSendMessageTask())
                .assertNext(op->{
                    assertThat(op.getCards().size()).isEqualTo(2);
                    assertThat(op.getPublishDate()).isEqualTo(nowPlusOne);
                    assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESSnotif1");
                    assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESSnotif2");
                })
                .then(createUpdateSubscriptionTask())
                .assertNext(op->{
                    assertThat(op.getCards().size()).isEqualTo(3);
                    assertThat(op.getPublishDate()).isEqualTo(nowMinusThree);
                    assertThat(op.getCards().get(0).getId()).isEqualTo("PUBLISHER_PROCESS6");
                    assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS7");
                    assertThat(op.getCards().get(2).getId()).isEqualTo("PUBLISHER_PROCESS0");
//                    assertThat(op.getCards().get(1).getId()).isEqualTo("PUBLISHER_PROCESS9");
                })
                .thenCancel()
                .verify();
    }

    private Runnable createUpdateSubscriptionTask() {
        return () -> {
            log.info("execute update subscription task");
            CardSubscription subscription = CardSubscription.builder().rangeStart(nowMinusThree).rangeEnd(nowMinusTwo).build();
            Mono<CardOperationsGetParameters> parameters = Mono.just(CardOperationsGetParameters.builder()
                    .user(user)
                    .clientId(TEST_ID)
                    .test(false)
                    .rangeStart(nowMinusThree)
                    .rangeEnd(nowMinusTwo)
                    .notification(true).build());
            StepVerifier.create(controller.updateSubscriptionAndPublish(parameters))
            .expectNextCount(1)
            .expectComplete()
            .verify();
        };
    }

    @Test
    public void receiveFaultyCards() {
        Flux<String> publisher = controller.registerSubscriptionAndPublish(Mono.just(
                CardOperationsGetParameters.builder()
                        .user(user)
                        .test(false)
                        .notification(true).build()
        ));
        StepVerifier.FirstStep<String> verifier = StepVerifier.create(publisher);
        taskScheduler.schedule(createSendMessageTask(), new Date(System.currentTimeMillis() + 2000));
        verifier
           .expectNext("{\"status\":\"BAD_REQUEST\",\"message\":\"\\\"clientId\\\" is a mandatory request parameter\"}")
           .verifyComplete();
    }

    private Runnable createSendMessageTask() {
        return () -> {
            try {
                log.info("execute send task");
                CardOperationConsultationData.CardOperationConsultationDataBuilder builder = CardOperationConsultationData.builder();
                builder.publishDate(nowPlusOne)
                        .card(LightCardConsultationData.copy(TestUtilities.createSimpleCard("notif1", nowPlusOne, nowPlusTwo, nowPlusThree,"rte-operator","rte","operator")))
                        .card(LightCardConsultationData.copy(TestUtilities.createSimpleCard("notif2", nowPlusOne, nowPlusTwo, nowPlusThree,"rte-operator","rte","operator")))
                ;

                rabbitTemplate.convertAndSend(userExchange.getName(), user.getLogin(), mapper.writeValueAsString(builder.build()));
            } catch (JsonProcessingException e) {
                log.error("Error during test data generation",e);
            }
        };
    }

    @Test
    public void receiveTestNotificationCards() {
        Flux<String> publisher = controller.publishTestData(Mono.just(CardOperationsGetParameters.builder()
                .user(user)
                .clientId(TEST_ID)
                .test(true)
                .notification(true).build()));
        StepVerifier.FirstStep<String> verifier = StepVerifier.create(publisher);
        verifier
           .assertNext(generateAssertions(0))
           .assertNext(generateAssertions(1))
           .assertNext(generateAssertions(2))
           .thenCancel()
           .verify();
    }

    private Consumer<? super String> generateAssertions(long l) {
        String stringLong = ""+l;
        return s->{
            try {
                CardOperationConsultationData op = mapper.readValue(s, CardOperationConsultationData.class);
                boolean test = l == op.getNumber();
                LightCardConsultationData c = (LightCardConsultationData) op.getCards().get(0);
                assertThat(c.getId()).isEqualTo(stringLong);
                assertThat(c.getUid()).isEqualTo(stringLong);
                assertThat(c.getSummary().getKey()).isEqualTo("summary");
                assertThat(c.getTitle().getKey()).isEqualTo("title");
                assertThat(c.getMainRecipient()).isEqualTo("rte-operator");
                assertThat(c.getSeverity()).isEqualTo(SeverityEnum.ALARM);
            } catch (IOException e) {
                log.error("Unable to extract light cards",e);
                Assertions.assertThat(e).doesNotThrowAnyException();
            }
        };
    }

}
