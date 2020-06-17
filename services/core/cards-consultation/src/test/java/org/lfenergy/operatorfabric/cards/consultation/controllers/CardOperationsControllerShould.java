/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.consultation.controllers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.lfenergy.operatorfabric.cards.consultation.TestUtilities.createSimpleCard;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterEach;
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
import org.lfenergy.operatorfabric.cards.consultation.services.CardSubscriptionService;
import org.lfenergy.operatorfabric.users.model.CurrentUserWithPerimeters;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

/**
 * <p></p>
 * Created on 29/10/18
 *
 *
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
    private FanoutExchange groupExchange;
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

    private CurrentUserWithPerimeters currentUserWithPerimeters;

    public CardOperationsControllerShould(){
        User user = new User();
        user.setLogin("dummyUser");
        user.setFirstName("Test");
        user.setLastName("User");
        List<String> groups = new ArrayList<>();
        groups.add("rte");
        groups.add("operator");
        user.setGroups(groups);
        List<String> entities = new ArrayList<>();
        entities.add("entity1");
        entities.add("entity2");
        user.setEntities(entities);

        currentUserWithPerimeters = new CurrentUserWithPerimeters();
        currentUserWithPerimeters.setUserData(user);
    }

    @AfterEach
    public void clean() {
        repository.deleteAll().subscribe();
    }

    @BeforeEach
    private void initCardData() {
        service.clearSubscriptions();
        StepVerifier.create(repository.deleteAll()).expectComplete().verify();
        int processNo = 0;
        //create past cards
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowMinusTwo, nowMinusOne, "rte-operator", new String[]{"rte","operator"}, new String[]{"entity1","entity2"}, new String[]{"rte-operator","some-operator"})))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowMinusTwo, nowMinusOne, "rte-operator", new String[]{"rte","operator"}, null)))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowMinusOne, now, "rte-operator", new String[]{"rte","operator"}, new String[]{"entity1","entity2"}, new String[]{"any-operator","some-operator"})))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        //create future cards
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, now, nowPlusOne, "rte-operator", new String[]{"rte","operator"}, null)))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowPlusOne, nowPlusTwo, "rte-operator", new String[]{"rte","operator"}, new String[]{"entity1","entity2"})))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowPlusTwo, nowPlusThree, "rte-operator", new String[]{"rte","operator"}, null)))
                .expectNextCount(1)
                .expectComplete()
                .verify();

        //card starts in past and ends in future
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowMinusThree, nowPlusThree, "rte-operator", new String[]{"rte","operator"}, new String[]{"entity1","entity2"})))
                .expectNextCount(1)
                .expectComplete()
                .verify();

        //card starts in past and never ends
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowMinusThree, null, "rte-operator", new String[]{"rte","operator"}, null)))
                .expectNextCount(1)
                .expectComplete()
                .verify();

        //card starts in future and never ends
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowPlusThree, null, "rte-operator", new String[]{"rte","operator"}, new String[]{"entity1","entity2"})))
                .expectNextCount(1)
                .expectComplete()
                .verify();

        //create later published cards in past
        //this one overrides first
        StepVerifier.create(repository.save(createSimpleCard(1, nowPlusOne, nowMinusTwo, nowMinusOne, "rte-operator", new String[]{"rte","operator"}, null)))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowPlusOne, nowMinusTwo, nowMinusOne, "rte-operator", new String[]{"rte","operator"}, new String[]{"entity1","entity2"})))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        //create later published cards in future
        // this one overrides third
        StepVerifier.create(repository.save(createSimpleCard(3, nowPlusOne, nowPlusOne, nowPlusTwo, "rte-operator", new String[]{"rte","operator"}, null)))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowPlusOne, nowPlusTwo, nowPlusThree, "rte-operator", new String[]{"rte","operator"}, new String[]{"entity1","entity2"})))
                .expectNextCount(1)
                .expectComplete()
                .verify();
    }

    @Test
    public void receiveNotificationCards() {
        Flux<String> publisher = controller.registerSubscriptionAndPublish(Mono.just(
                CardOperationsGetParameters.builder()
                        .currentUserWithPerimeters(currentUserWithPerimeters)
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
                        .currentUserWithPerimeters(currentUserWithPerimeters)
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
                        .currentUserWithPerimeters(currentUserWithPerimeters)
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

                })
                .thenCancel()
                .verify();
    }

    private Runnable createUpdateSubscriptionTask() {
        return () -> {
            log.info("execute update subscription task");
            Mono<CardOperationsGetParameters> parameters = Mono.just(CardOperationsGetParameters.builder()
                    .currentUserWithPerimeters(currentUserWithPerimeters)
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
                        .currentUserWithPerimeters(currentUserWithPerimeters)
                        .test(false)
                        .notification(true).build()
        ));
        StepVerifier.FirstStep<String> verifier = StepVerifier.create(publisher);
        taskScheduler.schedule(createSendMessageTask(), new Date(System.currentTimeMillis() + 2000));
        verifier
           .expectNext("{\"status\":\"BAD_REQUEST\",\"message\":\"\\\"clientId\\\" is a mandatory request parameter\"}")
           .verifyComplete();
    }

    /*@Test
    public void receiveCardsCheckUserAcks() {
        Flux<String> publisher = controller.registerSubscriptionAndPublish(Mono.just(
                CardOperationsGetParameters.builder()
                        .currentUserWithPerimeters(currentUserWithPerimeters)
                        .clientId(TEST_ID)
                        .rangeStart(nowMinusThree)
                        .rangeEnd(nowPlusOne)
                        .test(false)
                        .notification(false).build()
        ));
        StepVerifier.FirstStep<CardOperation> verifier = StepVerifier.create(publisher.map(s -> TestUtilities.readCardOperation(mapper, s)).doOnNext(TestUtilities::logCardOperation));
        verifier
                .assertNext(op->{
                	assertThat(op.getCards().get(2).getId()).isEqualTo("PUBLISHER_PROCESS0");
                	assertThat(op.getCards().get(2).getHasBeenAcknowledged()).isTrue();
                	assertThat(op.getCards().get(3).getId()).isEqualTo("PUBLISHER_PROCESS2");
                	assertThat(op.getCards().get(3).getHasBeenAcknowledged()).isFalse();
                	assertThat(op.getCards().get(4).getId()).isEqualTo("PUBLISHER_PROCESS4");
                	assertThat(op.getCards().get(4).getHasBeenAcknowledged()).isFalse();
                })
                .expectComplete()
                .verify();
    }*/

    private Runnable createSendMessageTask() {
        return () -> {
            try {
                log.info("execute send task");
                CardOperationConsultationData.CardOperationConsultationDataBuilder builder = CardOperationConsultationData.builder();
                builder.publishDate(nowPlusOne)
                        .card(LightCardConsultationData.copy(TestUtilities.createSimpleCard("notif1", nowPlusOne, nowPlusTwo, nowPlusThree, "rte-operator", new String[]{"rte","operator"}, null)))
                        .card(LightCardConsultationData.copy(TestUtilities.createSimpleCard("notif2", nowPlusOne, nowPlusTwo, nowPlusThree, "rte-operator", new String[]{"rte","operator"}, new String[]{"entity1","entity2"})))
                ;

                rabbitTemplate.convertAndSend(userExchange.getName(), currentUserWithPerimeters.getUserData().getLogin(),
                                              mapper.writeValueAsString(builder.build()));
            } catch (JsonProcessingException e) {
                log.error("Error during test data generation",e);
            }
        };
    }

}
