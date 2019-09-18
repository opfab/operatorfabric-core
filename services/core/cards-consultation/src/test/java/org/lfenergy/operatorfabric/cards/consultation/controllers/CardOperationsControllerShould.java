/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.consultation.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.cards.consultation.repositories.CardRepository;
import org.lfenergy.operatorfabric.cards.consultation.services.CardSubscription;
import org.lfenergy.operatorfabric.cards.consultation.services.CardSubscriptionService;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

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


    @Test
    public void receiveNotificationCards() {

    }

    @Test
    public void receiveOlderCards() {

    }
    @Test
    public void receiveOlderCardsAndNotification() {

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

    }


    @Test
    public void receiveTestNotificationCards() {

    }


}
