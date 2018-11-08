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
import org.lfenergy.operatorfabric.cards.consultation.model.CardOperationConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.model.LightCardConsultationData;
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
import reactor.util.function.Tuples;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;

/**
 * <p></p>
 * Created on 29/10/18
 *
 * @author davibind
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

    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Autowired
    private TopicExchange groupExchange;
    @Autowired
    private DirectExchange userExchange;
    @Autowired
    private CardOperationsController controller;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private ThreadPoolTaskScheduler taskScheduler;

    private User user;

    public CardOperationsControllerShould(){
        user = new User();
        user.setLogin("testuser");
        user.setFirstName("Test");
        user.setLastName("User");
        List<String> groups = new ArrayList<>();
        groups.add("testgroup1");
        groups.add("testgroup2");
        user.setGroups(groups);
    }

    @Test
    public void receiveCards() {
        Flux<String> publisher = controller.registerSubscriptionAndPublish(Mono.just(Tuples.of(user,
           Optional.of(TEST_ID))));
        StepVerifier.FirstStep<String> verifier = StepVerifier.create(publisher);
        taskScheduler.schedule(createSendMessageTask(), new Date(System.currentTimeMillis() + 1000));
        verifier
           .expectNext("test message 1")
           .expectNext("test message 2")
           .thenCancel()
           .verify();
    }

    @Test
    public void receiveFaultyCards() {
        Flux<String> publisher = controller.registerSubscriptionAndPublish(Mono.just(Tuples.of(user,
           Optional.empty())));
        StepVerifier.FirstStep<String> verifier = StepVerifier.create(publisher);
        taskScheduler.schedule(createSendMessageTask(), new Date(System.currentTimeMillis() + 2000));
        verifier
           .expectNext("{\"status\":\"BAD_REQUEST\",\"message\":\"\\\"clientId\\\" is a mandatory request parameter\"}")
           .verifyComplete();
    }

    private Runnable createSendMessageTask() {
        return () -> {
            rabbitTemplate.convertAndSend(userExchange.getName(), user.getLogin(), "test message 1");
            rabbitTemplate.convertAndSend(userExchange.getName(), user.getLogin(), "test message 2");
        };
    }

    @Test
    public void receiveTestCards() {
        Flux<String> publisher = controller.publishTestData(Mono.just(Tuples.of(user,
           Optional.of(TEST_ID))));
        StepVerifier.FirstStep<String> verifier = StepVerifier.create(publisher);
        taskScheduler.schedule(createSendMessageTask(), new Date(System.currentTimeMillis() + 1000));
        verifier
           .expectNextMatches(generatePredicate(0))
           .expectNextMatches(generatePredicate(1))
           .expectNextMatches(generatePredicate(2))
           .thenCancel()
           .verify();
    }

    private Predicate<? super String> generatePredicate(long l) {
        String stringLong = ""+l;
        return s->{
            try {
                CardOperationConsultationData op = objectMapper.readValue(s, CardOperationConsultationData.class);
                boolean test = l == op.getNumber();
                LightCardConsultationData c = (LightCardConsultationData) op.getCards().get(0);
                test = test && stringLong.equals(c.getId());
                test = test && stringLong.equals(c.getUid());
                test = test && c.getSummary().getKey().equals("summary");
                test = test && c.getTitle().getKey().equals("title");
                test = test && c.getMainRecipient().equals("rte-operator");
                test = test && c.getSeverity().equals(SeverityEnum.ALARM);
                return test;
            } catch (IOException e) {
                log.error("Unnabable to extract light cards",e);
                return false;
            }
        };
    }

}