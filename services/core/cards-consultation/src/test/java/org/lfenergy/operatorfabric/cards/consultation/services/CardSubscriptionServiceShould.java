/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.consultation.services;

import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.awaitility.core.ConditionTimeoutException;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.consultation.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import reactor.test.StepVerifier;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.awaitility.Awaitility.await;

/**
 * <p></p>
 * Created on 29/10/18
 *
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {IntegrationTestApplication.class,CardSubscriptionService.class})
@Slf4j
@ActiveProfiles("test")
@Tag("end-to-end")
@Tag("amqp")
public class CardSubscriptionServiceShould {

    private static String TEST_ID = "testClient";

    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Autowired
    private FanoutExchange groupExchange;
    @Autowired
    private DirectExchange userExchange;
    @Autowired
    private CardSubscriptionService service;
    @Autowired
    private ThreadPoolTaskScheduler taskScheduler;

    private User user;

    public CardSubscriptionServiceShould(){
        user = new User();
        user.setLogin("testuser");
        user.setFirstName("Test");
        user.setLastName("User");

        List<String> groups = new ArrayList<>();
        groups.add("testgroup1");
        groups.add("testgroup2");
        user.setGroups(groups);

        List<String> entities = new ArrayList<>();
        entities.add("testentity1");
        entities.add("testentity2");
        user.setEntities(entities);
    }

    @Test
    public void createAndDeleteSubscription(){
        CardSubscription subscription = service.subscribe(user, TEST_ID, null, null, false);
        subscription.getPublisher().subscribe(log::info);
        Assertions.assertThat(subscription.checkActive()).isTrue();
        service.evict(subscription.getId());
        Assertions.assertThat(subscription.isCleared()).isTrue();
        Assertions.assertThat(subscription.checkActive()).isFalse();
//        await().atMost(10, TimeUnit.SECONDS).until(() -> !subscription.checkActive());
    }

    @Test
    public void deleteSubscriptionWithDelay(){
        CardSubscription subscription = service.subscribe(user, TEST_ID, null,null, false);
        subscription.getPublisher().subscribe(log::info);
        Assertions.assertThat(subscription.checkActive()).isTrue();
        service.scheduleEviction(subscription.getId());
        Assertions.assertThat(subscription.checkActive()).isTrue();
        Assertions.assertThat(subscription.isCleared()).isFalse();
        await().atMost(15, TimeUnit.SECONDS).until(() -> !subscription.checkActive() && subscription.isCleared());
    }

    @Test
    public void reviveSubscription(){
        CardSubscription subscription = service.subscribe(user, TEST_ID, null, null, false);
        subscription.getPublisher().subscribe(log::info);
        Assertions.assertThat(subscription.checkActive()).isTrue();
        service.scheduleEviction(subscription.getId());
        Assertions.assertThat(subscription.checkActive()).isTrue();
        try {
            await().atMost(6, TimeUnit.SECONDS).until(() -> !subscription.checkActive() && subscription.isCleared());
            Assertions.assertThat(false).isFalse().describedAs("An exception was expected here");
        }catch (ConditionTimeoutException e){
            //nothing, everything is alright
        }
        CardSubscription subscription2 = service.subscribe(user, TEST_ID, null, null, false);
        Assertions.assertThat(subscription2).isSameAs(subscription);
        try {
            await().atMost(6, TimeUnit.SECONDS).until(() -> !subscription.checkActive() && subscription.isCleared());
            Assertions.assertThat(false).isFalse().describedAs("An exception was expected here");
        }catch (ConditionTimeoutException e){
            //nothing, everything is alright
        }
        service.evict(subscription.getId());
        Assertions.assertThat(subscription.isCleared()).isTrue();
        Assertions.assertThat(subscription.checkActive()).isFalse();
    }

    @Test
    public void receiveCards(){
        CardSubscription subscription = service.subscribe(user, TEST_ID, null, null, false);
        StepVerifier.FirstStep<String> verifier = StepVerifier.create(subscription.getPublisher());
        taskScheduler.schedule(createSendMessageTask(),new Date(System.currentTimeMillis() + 1000));
        verifier
           .expectNext("test message 1")
           .expectNext("test message 2")
           .thenCancel()
           .verify();
    }

    private Runnable createSendMessageTask() {
        return () ->{
            rabbitTemplate.convertAndSend(userExchange.getName(),user.getLogin(),"test message 1");
            rabbitTemplate.convertAndSend(userExchange.getName(),user.getLogin(),"test message 2");
        };
    }

    @Test
    public void testCheckIfUserMustReceiveTheCard() {
        CardSubscription subscription = service.subscribe(user, TEST_ID, null, null, false);

        //groups only
        String messageBody1 = "{\"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"]}";  //true
        String messageBody2 = "{\"groupRecipientsIds\":[\"testgroup3\", \"testgroup4\"]}";  //false
        String messageBody3 = "{\"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"], \"entityRecipientsIds\":[]}";  //true
        String messageBody4 = "{\"groupRecipientsIds\":[\"testgroup3\", \"testgroup4\"], \"entityRecipientsIds\":[]}";  //false

        //entities only
        String messageBody5 = "{\"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}";   //true
        String messageBody6 = "{\"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}";   //false
        String messageBody7 = "{\"groupRecipientsIds\":[], \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}";    //true
        String messageBody8 = "{\"groupRecipientsIds\":[], \"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}";    //false

        //groups and entities
        String messageBody9 = "{\"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}";  //true
        String messageBody10 = "{\"groupRecipientsIds\":[\"testgroup2\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity2\", \"testentity4\"]}";  //true
        String messageBody11 = "{\"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}";  //false (in group but not in entity)
        String messageBody12 = "{\"groupRecipientsIds\":[\"testgroup3\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}";  //false (in entity but not in group)
        String messageBody13 = "{\"groupRecipientsIds\":[\"testgroup3\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}";  //false (not in group and not in entity)

        //no groups and no entities
        String messageBody14 = "{\"groupRecipientsIds\":[], \"entityRecipientsIds\":[]}";    //false
        String messageBody15 = "{}";    //false

        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody1)).isTrue();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody2)).isFalse();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody3)).isTrue();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody4)).isFalse();

        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody5)).isTrue();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody6)).isFalse();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody7)).isTrue();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody8)).isFalse();

        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody9)).isTrue();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody10)).isTrue();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody11)).isFalse();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody12)).isFalse();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody13)).isFalse();

        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody14)).isFalse();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody15)).isFalse();
    }
}
