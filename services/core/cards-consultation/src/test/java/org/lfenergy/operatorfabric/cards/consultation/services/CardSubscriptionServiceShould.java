/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.lfenergy.operatorfabric.cards.consultation.services;

import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.awaitility.core.ConditionTimeoutException;
import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
import net.minidev.json.parser.ParseException;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.consultation.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.users.model.CurrentUserWithPerimeters;
import org.lfenergy.operatorfabric.users.model.User;
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
    private FanoutExchange cardExchange;
    @Autowired
    private CardSubscriptionService service;
    @Autowired
    private ThreadPoolTaskScheduler taskScheduler;
    private CurrentUserWithPerimeters currentUserWithPerimeters;


    private static String rabbitTestMessage = "{\"cards\":[{\"severity\":\"ALARM\",\"summary\":{\"parameters\":{},\"key\":\"defaultProcess.summary\"},\"process\":\"defaultProcess\",\"publishDate\":1592389043000,\"title\":{\"parameters\":{},\"key\":\"defaultProcess.title\"},\"uid\":\"db914230-a5aa-42f2-aa29-f5348700fa55\",\"publisherVersion\":\"1\",\"processInstanceId\":\"process5b\",\"publisher\":\"api_test\",\"id\":\"api_test_process5b\",\"state\":\"messageState\",\"startDate\":1592396243446}],\"publishDate\":1592389043000,\"groupRecipientsIds\":[\"testgroup1\"],\"type\":\"ADD\"}";

    public CardSubscriptionServiceShould(){
        User user = new User();
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

        currentUserWithPerimeters = new CurrentUserWithPerimeters();
        currentUserWithPerimeters.setUserData(user);
    }

    @Test
    public void createAndDeleteSubscription(){
        CardSubscription subscription = service.subscribe(currentUserWithPerimeters, TEST_ID);
        subscription.getPublisher().subscribe(log::info);
        Assertions.assertThat(subscription.checkActive()).isTrue();
        service.evict(subscription.getId());
        Assertions.assertThat(subscription.isCleared()).isTrue();
        Assertions.assertThat(subscription.checkActive()).isFalse();
//        await().atMost(10, TimeUnit.SECONDS).until(() -> !subscription.checkActive());
    }

    @Test
    public void deleteSubscriptionWithDelay(){
        CardSubscription subscription = service.subscribe(currentUserWithPerimeters, TEST_ID);
        subscription.getPublisher().subscribe(log::info);
        Assertions.assertThat(subscription.checkActive()).isTrue();
        service.scheduleEviction(subscription.getId());
        Assertions.assertThat(subscription.checkActive()).isTrue();
        Assertions.assertThat(subscription.isCleared()).isFalse();
        await().atMost(15, TimeUnit.SECONDS).until(() -> !subscription.checkActive() && subscription.isCleared());
    }

    @Test
    public void reviveSubscription(){
        CardSubscription subscription = service.subscribe(currentUserWithPerimeters, TEST_ID);
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
        CardSubscription subscription2 = service.subscribe(currentUserWithPerimeters, TEST_ID);
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
        CardSubscription subscription = service.subscribe(currentUserWithPerimeters, TEST_ID);
        StepVerifier.FirstStep<String> verifier = StepVerifier.create(subscription.getPublisher());
        taskScheduler.schedule(createSendMessageTask(),new Date(System.currentTimeMillis() + 1000));
        verifier
           .expectNext("INIT")
           .expectNext(rabbitTestMessage)
           .expectNext(rabbitTestMessage)
           .thenCancel()
           .verify();
    }

    private Runnable createSendMessageTask() {
        return () ->{
          
            rabbitTemplate.convertAndSend(cardExchange.getName(), currentUserWithPerimeters.getUserData().getLogin(),rabbitTestMessage);
            rabbitTemplate.convertAndSend(cardExchange.getName(), currentUserWithPerimeters.getUserData().getLogin(),rabbitTestMessage);
        };
    }

    private  JSONObject createJSONObjectFromString(String jsonString)
    {
        try
        {
           return  (JSONObject) (new JSONParser(JSONParser.MODE_PERMISSIVE)).parse(jsonString);
        }
        catch(ParseException e){ log.error("Error parsing", e); return null;}
    }

    @Test
    public void testCheckIfUserMustReceiveTheCard() {
        CardSubscription subscription = service.subscribe(currentUserWithPerimeters, TEST_ID);

        //groups only

        JSONObject messageBody1 = createJSONObjectFromString("{\"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"]}");  //true
        JSONObject messageBody2 = createJSONObjectFromString("{\"groupRecipientsIds\":[\"testgroup3\", \"testgroup4\"]}");  //false
        JSONObject messageBody3 = createJSONObjectFromString("{\"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"], \"entityRecipientsIds\":[]}");  //true
        JSONObject messageBody4 = createJSONObjectFromString("{\"groupRecipientsIds\":[\"testgroup3\", \"testgroup4\"], \"entityRecipientsIds\":[]}");  //false

        //entities only
        JSONObject messageBody5 = createJSONObjectFromString("{\"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}");   //true
        JSONObject messageBody6 = createJSONObjectFromString("{\"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}");   //false
        JSONObject messageBody7 = createJSONObjectFromString("{\"groupRecipientsIds\":[], \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}");    //true
        JSONObject messageBody8 = createJSONObjectFromString("{\"groupRecipientsIds\":[], \"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}");    //false

        //groups and entities
        JSONObject messageBody9 = createJSONObjectFromString("{\"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}");  //true
        JSONObject messageBody10 = createJSONObjectFromString("{\"groupRecipientsIds\":[\"testgroup2\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity2\", \"testentity4\"]}");  //true
        JSONObject messageBody11 = createJSONObjectFromString("{\"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}");  //false (in group but not in entity)
        JSONObject messageBody12 = createJSONObjectFromString("{\"groupRecipientsIds\":[\"testgroup3\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}");  //false (in entity but not in group)
        JSONObject messageBody13 = createJSONObjectFromString("{\"groupRecipientsIds\":[\"testgroup3\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}");  //false (not in group and not in entity)

        //no groups and no entities
        JSONObject messageBody14 = createJSONObjectFromString("{\"groupRecipientsIds\":[], \"entityRecipientsIds\":[]}");    //false
        JSONObject messageBody15 = createJSONObjectFromString("{}");    //false

        // users only 
        JSONObject messageBody16 = createJSONObjectFromString("{\"userRecipientsIds\":[\"testuser\", \"noexistantuser2\"]}");   //true
        JSONObject messageBody17 = createJSONObjectFromString("{\"userRecipientsIds\":[\"noexistantuser1\", \"noexistantuser2\"]}");


        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody1)).isTrue();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody2)).isFalse();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody3)).isTrue();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody4)).isFalse();

        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody5)).isFalse();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody6)).isFalse();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody7)).isFalse();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody8)).isFalse();

        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody9)).isTrue();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody10)).isTrue();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody11)).isFalse();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody12)).isFalse();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody13)).isFalse();

        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody14)).isFalse();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody15)).isFalse();

        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody16)).isTrue();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody17)).isFalse();
    }


    @Test
    public void testCreateDeleteCardMessageForUserNotRecipient(){
        CardSubscription subscription = service.subscribe(currentUserWithPerimeters, TEST_ID);

        String messageBodyAdd = "{\"cards\":[{\"severity\":\"ALARM\",\"summary\":{\"parameters\":{},\"key\":\"defaultProcess.summary\"},\"process\":\"defaultProcess\",\"publishDate\":1592389043000,\"title\":{\"parameters\":{},\"key\":\"defaultProcess.title\"},\"uid\":\"db914230-a5aa-42f2-aa29-f5348700fa55\",\"publisherVersion\":\"1\",\"processInstanceId\":\"process5b\",\"publisher\":\"api_test\",\"id\":\"api_test_process5b\",\"state\":\"messageState\",\"startDate\":1592396243446}],\"publishDate\":1592389043000,\"groupRecipientsIds\":[\"Dispatcher\"],\"type\":\"ADD\"}";
        String messageBodyUpdate = "{\"cards\":[{\"severity\":\"ALARM\",\"summary\":{\"parameters\":{},\"key\":\"defaultProcess.summary\"},\"process\":\"defaultProcess\",\"publishDate\":1592389043000,\"title\":{\"parameters\":{},\"key\":\"defaultProcess.title\"},\"uid\":\"db914230-a5aa-42f2-aa29-f5348700fa55\",\"publisherVersion\":\"1\",\"processInstanceId\":\"process5b\",\"publisher\":\"api_test\",\"id\":\"api_test_process5c\",\"state\":\"messageState\",\"startDate\":1592396243446}],\"publishDate\":1592389043000,\"groupRecipientsIds\":[\"Dispatcher\"],\"type\":\"UPDATE\"}";
        String messageBodyDelete = "{\"cards\":[{\"severity\":\"ALARM\",\"summary\":{\"parameters\":{},\"key\":\"defaultProcess.summary\"},\"process\":\"defaultProcess\",\"publishDate\":1592389043000,\"title\":{\"parameters\":{},\"key\":\"defaultProcess.title\"},\"uid\":\"db914230-a5aa-42f2-aa29-f5348700fa55\",\"publisherVersion\":\"1\",\"processInstanceId\":\"process5b\",\"publisher\":\"api_test\",\"id\":\"api_test_process5d\",\"state\":\"messageState\",\"startDate\":1592396243446}],\"publishDate\":1592389043000,\"groupRecipientsIds\":[\"Dispatcher\"],\"type\":\"DELETE\"}";

        Assertions.assertThat(subscription.createDeleteCardMessageForUserNotRecipient(createJSONObjectFromString(messageBodyAdd)).equals("{\"cards\":[{\"severity\":\"ALARM\",\"summary\":{\"parameters\":{},\"key\":\"defaultProcess.summary\"},\"process\":\"defaultProcess\",\"publishDate\":1592389043000,\"title\":{\"parameters\":{},\"key\":\"defaultProcess.title\"},\"uid\":\"db914230-a5aa-42f2-aa29-f5348700fa55\",\"publisherVersion\":\"1\",\"processInstanceId\":\"process5b\",\"publisher\":\"api_test\",\"id\":\"api_test_process5b\",\"state\":\"messageState\",\"startDate\":1592396243446}],\"publishDate\":1592389043000,\"groupRecipientsIds\":[\"Dispatcher\"],\"type\":\"DELETE\",\"cardIds\":\"api_test_process5b\"}"));
        Assertions.assertThat(subscription.createDeleteCardMessageForUserNotRecipient(createJSONObjectFromString(messageBodyUpdate)).equals("{\"cards\":[{\"severity\":\"ALARM\",\"summary\":{\"parameters\":{},\"key\":\"defaultProcess.summary\"},\"process\":\"defaultProcess\",\"publishDate\":1592389043000,\"title\":{\"parameters\":{},\"key\":\"defaultProcess.title\"},\"uid\":\"db914230-a5aa-42f2-aa29-f5348700fa55\",\"publisherVersion\":\"1\",\"processInstanceId\":\"process5b\",\"publisher\":\"api_test\",\"id\":\"api_test_process5b\",\"state\":\"messageState\",\"startDate\":1592396243446}],\"publishDate\":1592389043000,\"groupRecipientsIds\":[\"Dispatcher\"],\"type\":\"DELETE\",\"cardIds\":\"api_test_process5c\"}"));
        Assertions.assertThat(subscription.createDeleteCardMessageForUserNotRecipient(createJSONObjectFromString(messageBodyDelete)).equals(messageBodyDelete));    //message must not be changed
    }
}
