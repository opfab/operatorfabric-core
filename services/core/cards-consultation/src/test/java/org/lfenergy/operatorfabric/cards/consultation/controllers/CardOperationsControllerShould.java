/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.consultation.controllers;

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
import org.lfenergy.operatorfabric.springtools.configuration.test.UserServiceCacheTestApplication;
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
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.lfenergy.operatorfabric.cards.consultation.TestUtilities.createSimpleCard;
import static org.lfenergy.operatorfabric.cards.consultation.TestUtilities.roundingToMillis;

/**
 * <p></p>
 * Created on 29/10/18
 *
 *
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {IntegrationTestApplication.class, CardSubscriptionService.class, CardOperationsController
   .class, UserServiceCacheTestApplication.class})
@Slf4j
@ActiveProfiles("test")
@Tag("end-to-end")
@Tag("amqp")
public class CardOperationsControllerShould {
    private static String TEST_ID = "testClient";

    private static Instant now = roundingToMillis(Instant.now());
    private static Instant nowPlusOne = now.plus(1, ChronoUnit.HOURS);
    private static Instant nowPlusTwo = now.plus(2, ChronoUnit.HOURS);
    private static Instant nowPlusThree = now.plus(3, ChronoUnit.HOURS);
    private static Instant nowMinusOne = now.minus(1, ChronoUnit.HOURS);
    private static Instant nowMinusTwo = now.minus(2, ChronoUnit.HOURS);
    private static Instant nowMinusThree = now.minus(3, ChronoUnit.HOURS);

    @Autowired
    private CardOperationsController controller;
    @Autowired
    private CardSubscriptionService service;
    @Autowired
    private ObjectMapper mapper;

    @Autowired
    private CardRepository repository;

    private CurrentUserWithPerimeters currentUserWithPerimeters, userForUserAckAndReadTest;

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
        
        user = new User();
        user.setLogin("operator3");
        user.setFirstName("Test2");
        user.setLastName("User2");
        groups = new ArrayList<>();
        groups.add("rte");
        groups.add("operator");
        user.setGroups(groups);
        entities = new ArrayList<>();
        entities.add("entity1");
        entities.add("entity2");
        user.setEntities(entities);
        userForUserAckAndReadTest = new CurrentUserWithPerimeters();
        userForUserAckAndReadTest.setUserData(user);
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
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowMinusTwo, nowMinusOne, "operator3", new String[]{"rte","operator"}, new String[]{"entity1","entity2"}, new String[]{"operator3","some-operator"}, new String[]{"operator3","some-operator"})))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowMinusTwo, nowMinusOne, "operator3", new String[]{"rte","operator"}, null)))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowMinusOne, now, "operator3", new String[]{"rte","operator"}, new String[]{"entity1","entity2"}, new String[]{"any-operator","some-operator"}, new String[]{"any-operator","some-operator"})))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        //create future cards
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, now, nowPlusOne, "operator3", new String[]{"rte","operator"}, null)))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowPlusOne, nowPlusTwo, "operator3", new String[]{"rte","operator"}, new String[]{"entity1","entity2"})))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowPlusTwo, nowPlusThree, "operator3", new String[]{"rte","operator"}, null)))
                .expectNextCount(1)
                .expectComplete()
                .verify();

        //card starts in past and ends in future
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowMinusThree, nowPlusThree, "operator3", new String[]{"rte","operator"}, new String[]{"entity1","entity2"})))
                .expectNextCount(1)
                .expectComplete()
                .verify();

        //card starts in past and never ends
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowMinusThree, null, "operator3", new String[]{"rte","operator"}, null)))
                .expectNextCount(1)
                .expectComplete()
                .verify();

        //card starts in future and never ends
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowMinusThree, nowPlusThree, null, "operator3", new String[]{"rte","operator"}, new String[]{"entity1","entity2"})))
                .expectNextCount(1)
                .expectComplete()
                .verify();

        //create later published cards in past
        //this one overrides first
        StepVerifier.create(repository.save(createSimpleCard(1, nowPlusOne, nowMinusTwo, nowMinusOne, "operator3", new String[]{"rte","operator"}, null)))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowPlusOne, nowMinusTwo, nowMinusOne, "operator3", new String[]{"rte","operator"}, new String[]{"entity1","entity2"})))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        //create later published cards in future
        // this one overrides businessconfig
        StepVerifier.create(repository.save(createSimpleCard(3, nowPlusOne, nowPlusOne, nowPlusTwo, "operator3", new String[]{"rte","operator"}, null)))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        StepVerifier.create(repository.save(createSimpleCard(processNo++, nowPlusOne, nowPlusTwo, nowPlusThree, "operator3", new String[]{"rte","operator"}, new String[]{"entity1","entity2"})))
                .expectNextCount(1)
                .expectComplete()
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
        Set<String> cardIds = new HashSet<String>();
        StepVerifier.FirstStep<CardOperation> verifier = StepVerifier.create(publisher.map(s -> TestUtilities.readCardOperation(mapper, s)).doOnNext(TestUtilities::logCardOperation));
        verifier
                .assertNext(op->{
                        assertThat(op.getCardToBeProcessed()).isNotNull();
                        assertThat(op.getPublishDate()).isEqualTo(nowMinusThree);
                        cardIds.add(op.getCardToBeProcessed().getId());
                })
                .assertNext(op->{
                        assertThat(op.getCardToBeProcessed()).isNotNull();
                        assertThat(op.getPublishDate()).isEqualTo(nowPlusOne);
                        cardIds.add(op.getCardToBeProcessed().getId());
                })
                .assertNext(op->{
                        assertThat(op.getCardToBeProcessed()).isNotNull();
                        assertThat(op.getPublishDate()).isEqualTo(nowMinusThree);
                        cardIds.add(op.getCardToBeProcessed().getId());
                })
                .assertNext(op->{
                        assertThat(op.getCardToBeProcessed()).isNotNull();
                        assertThat(op.getPublishDate()).isEqualTo(nowMinusThree);
                        cardIds.add(op.getCardToBeProcessed().getId());
                })
                .assertNext(op->{
                        assertThat(op.getCardToBeProcessed()).isNotNull();
                        assertThat(op.getPublishDate()).isEqualTo(nowMinusThree);
                        cardIds.add(op.getCardToBeProcessed().getId());
                })
                .assertNext(op->{
                        assertThat(op.getCardToBeProcessed()).isNotNull();
                        assertThat(op.getPublishDate()).isEqualTo(nowMinusThree);
                        cardIds.add(op.getCardToBeProcessed().getId());
                })
                .assertNext(op->{
                        assertThat(op.getCardToBeProcessed()).isNotNull();
                        assertThat(op.getPublishDate()).isEqualTo(nowMinusThree);
                        cardIds.add(op.getCardToBeProcessed().getId());
                })
                .assertNext(op->{
                        assertThat(op.getCardToBeProcessed()).isNotNull();
                        assertThat(op.getPublishDate()).isEqualTo(nowPlusOne);
                        cardIds.add(op.getCardToBeProcessed().getId());
                })
                .expectComplete()
                .verify();
        assertThat(cardIds.contains("PROCESS.PROCESS7"));
        assertThat(cardIds.contains("PROCESS.PROCESS4"));
        assertThat(cardIds.contains("PROCESS.PROCESS5"));
        assertThat(cardIds.contains("PROCESS.PROCESS8"));
        assertThat(cardIds.contains("PROCESS.PROCESS2"));
        assertThat(cardIds.contains("PROCESS.PROCESS6"));
    }
    @Test

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
    public void receiveCardsCheckUserAcks() {
        Flux<String> publisher = controller.registerSubscriptionAndPublish(Mono.just(
                CardOperationsGetParameters.builder()
                        .currentUserWithPerimeters(userForUserAckAndReadTest)
                        .clientId(TEST_ID)
                        .rangeStart(nowMinusThree)
                        .rangeEnd(nowPlusOne)
                        .test(false)
                        .notification(false).build()
        ));
        List<CardOperation> list = publisher.map(s -> TestUtilities.readCardOperation(mapper, s))
        		.filter(co -> Arrays.asList("PROCESS.PROCESS0","PROCESS.PROCESS2","PROCESS.PROCESS4").contains(co.getCardToBeProcessed().getId()))
        		.collectSortedList((co1,co2) -> co1.getCardToBeProcessed().getId().compareTo(co2.getCardToBeProcessed().getId()))
    	.block();
        
		assertThat(list.get(0).getCardToBeProcessed().getId()).isEqualTo("PROCESS.PROCESS0");
        assertThat(list.get(0).getCardToBeProcessed().getHasBeenAcknowledged()).isTrue();
        assertThat(list.get(1).getCardToBeProcessed().getId()).isEqualTo("PROCESS.PROCESS2");
        assertThat(list.get(1).getCardToBeProcessed().getHasBeenAcknowledged()).isFalse();
        assertThat(list.get(2).getCardToBeProcessed().getId()).isEqualTo("PROCESS.PROCESS4");
        assertThat(list.get(2).getCardToBeProcessed().getHasBeenAcknowledged()).isFalse();
    }
    
    @Test
    public void receiveCardsCheckUserReads() {
        Flux<String> publisher = controller.registerSubscriptionAndPublish(Mono.just(
                CardOperationsGetParameters.builder()
                        .currentUserWithPerimeters(userForUserAckAndReadTest)
                        .clientId(TEST_ID)
                        .rangeStart(nowMinusThree)
                        .rangeEnd(nowPlusOne)
                        .test(false)
                        .notification(false).build()
        ));
        
        List<CardOperation> list = publisher.map(s -> TestUtilities.readCardOperation(mapper, s))
        		.filter(co -> Arrays.asList("PROCESS.PROCESS0","PROCESS.PROCESS2","PROCESS.PROCESS4").contains(co.getCardToBeProcessed().getId()))
        		.collectSortedList((co1,co2) -> co1.getCardToBeProcessed().getId().compareTo(co2.getCardToBeProcessed().getId()))
    	.block();
        
		assertThat(list.get(0).getCardToBeProcessed().getId()).isEqualTo("PROCESS.PROCESS0");
        assertThat(list.get(0).getCardToBeProcessed().getHasBeenRead()).isTrue();
        assertThat(list.get(1).getCardToBeProcessed().getId()).isEqualTo("PROCESS.PROCESS2");
        assertThat(list.get(1).getCardToBeProcessed().getHasBeenRead()).isFalse();
        assertThat(list.get(2).getCardToBeProcessed().getId()).isEqualTo("PROCESS.PROCESS4");
        assertThat(list.get(2).getCardToBeProcessed().getHasBeenRead()).isFalse();
    }

 

}
