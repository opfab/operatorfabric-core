/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.services;

import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
import net.minidev.json.parser.ParseException;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.cards.consultation.application.IntegrationTestApplication;
import org.opfab.springtools.configuration.test.UserServiceCacheTestApplication;
import org.opfab.users.model.ComputedPerimeter;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.RightsEnum;
import org.opfab.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;


import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;



/**
 * <p></p>
 * Created on 29/10/18
 *
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {IntegrationTestApplication.class,CardSubscriptionService.class,
        UserServiceCacheTestApplication.class})
@Slf4j
@ActiveProfiles("test")
@Tag("end-to-end")
@Tag("amqp")
public class CardSubscriptionServiceShould {

    private static String TEST_ID = "testClient";


    @Autowired
    private CardSubscriptionService service;

    private CurrentUserWithPerimeters currentUserWithPerimeters;

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

        ComputedPerimeter perimeter = new ComputedPerimeter();
        perimeter.setProcess("Process1");
        perimeter.setState("State1");
        perimeter.setRights(RightsEnum.RECEIVE);

        currentUserWithPerimeters = new CurrentUserWithPerimeters();
        currentUserWithPerimeters.setUserData(user);
        currentUserWithPerimeters.setComputedPerimeters(Arrays.asList(perimeter));
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
    void testCheckIfUserMustReceiveTheCard() {
        CardSubscription subscription = service.subscribe(currentUserWithPerimeters, TEST_ID);

        //groups only
        String processStateInPerimeter = "\"card\":{\"process\":\"Process1\", \"state\":\"State1\"}";
        JSONObject messageBody1 = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"]}");  //true
        JSONObject messageBody2 = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup3\", \"testgroup4\"]}");  //false
        JSONObject messageBody3 = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"], \"entityRecipientsIds\":[]}");  //true
        JSONObject messageBody4 = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup3\", \"testgroup4\"], \"entityRecipientsIds\":[]}");  //false

        //entities only
        JSONObject messageBody5 = createJSONObjectFromString("{" + processStateInPerimeter + ", \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}");   //true
        JSONObject messageBody6 = createJSONObjectFromString("{" + processStateInPerimeter + ", \"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}");   //false
        JSONObject messageBody7 = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[], \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}");    //true
        JSONObject messageBody8 = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[], \"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}");    //false

        //groups and entities
        JSONObject messageBody9 = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}");  //true
        JSONObject messageBody10 = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup2\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity2\", \"testentity4\"]}");  //true
        JSONObject messageBody11 = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}");  //false (in group but not in entity)
        JSONObject messageBody12 = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup3\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}");  //false (in entity but not in group)
        JSONObject messageBody13 = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup3\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}");  //false (not in group and not in entity)

        //no groups and no entities
        JSONObject messageBody14 = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[], \"entityRecipientsIds\":[]}");    //false
        JSONObject messageBody15 = createJSONObjectFromString("{" + processStateInPerimeter + "}");    //false

        // users only 
        JSONObject messageBody16 = createJSONObjectFromString("{" + processStateInPerimeter + ",\"userRecipientsIds\":[\"testuser\", \"noexistantuser2\"]}");   //true
        JSONObject messageBody17 = createJSONObjectFromString("{" + processStateInPerimeter + ",\"userRecipientsIds\":[\"noexistantuser1\", \"noexistantuser2\"]}");    //false


        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody1, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody2, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody3, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody4, currentUserWithPerimeters)).isFalse();

        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody5, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody6, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody7, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody8, currentUserWithPerimeters)).isFalse();

        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody9, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody10, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody11, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody12, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody13,currentUserWithPerimeters)).isFalse();

        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody14, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody15, currentUserWithPerimeters)).isFalse();

        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody16, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(subscription.checkIfUserMustReceiveTheCard(messageBody17, currentUserWithPerimeters)).isFalse();
    }


    @Test
    void testCreateDeleteCardMessageForUserNotRecipient(){
        CardSubscription subscription = service.subscribe(currentUserWithPerimeters, TEST_ID);

        JSONObject cardAdd  = createJSONObjectFromString("{\"card\":{\"severity\":\"ALARM\",\"summary\":{\"parameters\":{},\"key\":\"defaultProcess.summary\"},\"process\":\"defaultProcess\",\"publishDate\":1592389043000,\"title\":{\"parameters\":{},\"key\":\"defaultProcess.title\"},\"uid\":\"db914230-a5aa-42f2-aa29-f5348700fa55\",\"publisherVersion\":\"1\",\"processInstanceId\":\"process5b\",\"publisher\":\"api_test\",\"id\":\"api_test_process5b\",\"state\":\"messageState\",\"startDate\":1592396243446},\"publishDate\":1592389043000,\"groupRecipientsIds\":[\"Dispatcher\"],\"type\":\"ADD\"}");
        JSONObject cardAddWantedOutput = createJSONObjectFromString("{\"card\":{\"severity\":\"ALARM\",\"summary\":{\"parameters\":{},\"key\":\"defaultProcess.summary\"},\"process\":\"defaultProcess\",\"publishDate\":1592389043000,\"title\":{\"parameters\":{},\"key\":\"defaultProcess.title\"},\"uid\":\"db914230-a5aa-42f2-aa29-f5348700fa55\",\"publisherVersion\":\"1\",\"processInstanceId\":\"process5b\",\"publisher\":\"api_test\",\"id\":\"api_test_process5b\",\"state\":\"messageState\",\"startDate\":1592396243446},\"publishDate\":1592389043000,\"groupRecipientsIds\":[\"Dispatcher\"],\"type\":\"DELETE\",\"cardId\":\"api_test_process5b\"}");
        JSONObject cardAddOutput = createJSONObjectFromString(subscription.createDeleteCardMessageForUserNotRecipient(cardAdd));
        Assertions.assertThat(cardAddOutput).isEqualTo(cardAddWantedOutput); 

        String messageBodyDelete = "{\"card\":{\"severity\":\"ALARM\",\"summary\":{\"parameters\":{},\"key\":\"defaultProcess.summary\"},\"process\":\"defaultProcess\",\"publishDate\":1592389043000,\"title\":{\"parameters\":{},\"key\":\"defaultProcess.title\"},\"uid\":\"db914230-a5aa-42f2-aa29-f5348700fa55\",\"publisherVersion\":\"1\",\"processInstanceId\":\"process5b\",\"publisher\":\"api_test\",\"id\":\"api_test_process5d\",\"state\":\"messageState\",\"startDate\":1592396243446},\"publishDate\":1592389043000,\"groupRecipientsIds\":[\"Dispatcher\"],\"type\":\"DELETE\"}";
        JSONObject inputDelete = createJSONObjectFromString(messageBodyDelete);
        String outputDelete = subscription.createDeleteCardMessageForUserNotRecipient(inputDelete);
        Assertions.assertThat(outputDelete).isEmpty(); 
    }
}
