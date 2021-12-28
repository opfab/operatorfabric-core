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

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.cards.consultation.application.IntegrationTestApplication;
import org.opfab.users.model.ComputedPerimeter;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.RightsEnum;
import org.opfab.users.model.User;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;


import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;



@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {IntegrationTestApplication.class})
@Slf4j
@ActiveProfiles("test")
public class CardRoutingUtilitiesShould {

 
    private CurrentUserWithPerimeters currentUserWithPerimeters;
    private String processStateInPerimeter = "\"card\":{\"process\":\"Process1\", \"state\":\"State1\"}";
    private String processStateNotInPerimeter = "\"card\":{\"process\":\"Process1\", \"state\":\"State2\"}";

    public CardRoutingUtilitiesShould(){
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
    void checkIfUserMustReceiveTheCardUsingGroupsOnly() {

        JSONObject messageBodyWithGroupOfTheUser = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"]}");  //true
        JSONObject messageBodyWithGroupOfTheUserButStateNotInPerimeter = createJSONObjectFromString("{" + processStateNotInPerimeter + ", \"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"]}");  //true
        JSONObject messageBodyWithNoGroupOfTheUser = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup3\", \"testgroup4\"]}");  //false
        JSONObject messageBodyWithGroupOfTheUserAndEmptyEntitiesList = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"], \"entityRecipientsIds\":[]}");  //true
        JSONObject messageBodyWithNoGroupOfTheUserAndEmptyEntitiessList = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup3\", \"testgroup4\"], \"entityRecipientsIds\":[]}");  //false

        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithGroupOfTheUser, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithGroupOfTheUserButStateNotInPerimeter, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithNoGroupOfTheUser, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithGroupOfTheUserAndEmptyEntitiesList, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithNoGroupOfTheUserAndEmptyEntitiessList, currentUserWithPerimeters)).isFalse();

    }

    @Test
    void checkIfUserMustReceiveTheCardUsingEntitiesOnly() {


        JSONObject messageBodyWithEntityOfTheUser = createJSONObjectFromString("{" + processStateInPerimeter + ", \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}");
        JSONObject messageBodyWithEntityOfTheUserButStateNotInPerimeter = createJSONObjectFromString("{" + processStateNotInPerimeter + ", \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}");
        JSONObject messageBodyWithNoEntityOfTheUser = createJSONObjectFromString("{" + processStateInPerimeter + ", \"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}");
        JSONObject messageBodyWithEntityOfTheUserAndEmptyGroupsList = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[], \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}");
        JSONObject messageBodyWithNoEntityOfTheUserAndEmptyGroupsList = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[], \"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}");

        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEntityOfTheUser, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEntityOfTheUserButStateNotInPerimeter, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithNoEntityOfTheUser, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEntityOfTheUserAndEmptyGroupsList, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithNoEntityOfTheUserAndEmptyGroupsList, currentUserWithPerimeters)).isFalse();

    }


    @Test
    void checkIfUserMustReceiveTheCardUsingGroupsAndEntities() {

        JSONObject messageBodyWithEntityAndGroupOfTheUser = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}");  //true
        JSONObject messageBodyWithEntityAndGroupOfTheUser2 = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup2\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity2\", \"testentity4\"]}");  //true
        JSONObject messageBodyWithEntityAndGroupOfTheUserButStateNotInPerimeter = createJSONObjectFromString("{" + processStateNotInPerimeter + ", \"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}");  //true
        JSONObject messageBodyWithGroupOfTheUserButNotEntity = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}");  //false (in group but not in entity)
        JSONObject messageBodyWithEntityOfTheUserButNotGroup = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup3\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}");  //false (in entity but not in group)
        JSONObject messageBodyWithNoGroupAndNoEntityOfTheUser = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup3\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}");  //false (not in group and not in entity)

        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEntityAndGroupOfTheUser, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEntityAndGroupOfTheUser2, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEntityAndGroupOfTheUserButStateNotInPerimeter, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithGroupOfTheUserButNotEntity, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEntityOfTheUserButNotGroup, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithNoGroupAndNoEntityOfTheUser,currentUserWithPerimeters)).isFalse();

    }

    @Test
    void checkIfUserMustReceiveTheCardUsingNoGroupsAndNoEntities() {

        JSONObject messageBodyWithEmptyRecipientAndGroup = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[], \"entityRecipientsIds\":[]}");    //false
        JSONObject messageBodyWithNoRecipients = createJSONObjectFromString("{" + processStateInPerimeter + "}");    //false

        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEmptyRecipientAndGroup, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithNoRecipients, currentUserWithPerimeters)).isFalse();

    }


    @Test
    void checkIfUserMustReceiveTheCardUsingUserOnly() {

        JSONObject messageBodyWithTheUser = createJSONObjectFromString("{" + processStateInPerimeter + ",\"userRecipientsIds\":[\"testuser\", \"noexistantuser2\"]}");
        JSONObject messageBodyWithTheUserAndEntity = createJSONObjectFromString("{" + processStateInPerimeter + ",\"userRecipientsIds\":[\"testuser\", \"noexistantuser2\"],\"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}");
        JSONObject messageBodyWithTheUserAndGroup = createJSONObjectFromString("{" + processStateInPerimeter + ",\"userRecipientsIds\":[\"testuser\", \"noexistantuser2\"], \"groupRecipientsIds\":[\"testgroup3\", \"testgroup4\"]}");
        JSONObject messageBodyWithTheUserButStateNotInPerimeter = createJSONObjectFromString("{" + processStateNotInPerimeter + ",\"userRecipientsIds\":[\"testuser\", \"noexistantuser2\"]}");
        JSONObject messageBodyWithoutTheUser = createJSONObjectFromString("{" + processStateInPerimeter + ",\"userRecipientsIds\":[\"noexistantuser1\", \"noexistantuser2\"]}"); 

        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithTheUser, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithTheUserAndEntity, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithTheUserAndGroup, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithTheUserButStateNotInPerimeter, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithoutTheUser, currentUserWithPerimeters)).isFalse();
    }


    @Test
    void testCreateDeleteCardMessageForUserNotRecipient(){
        JSONObject cardAdd  = createJSONObjectFromString("{\"card\":{\"severity\":\"ALARM\",\"summary\":{\"parameters\":{},\"key\":\"defaultProcess.summary\"},\"process\":\"defaultProcess\",\"publishDate\":1592389043000,\"title\":{\"parameters\":{},\"key\":\"defaultProcess.title\"},\"uid\":\"db914230-a5aa-42f2-aa29-f5348700fa55\",\"publisherVersion\":\"1\",\"processInstanceId\":\"process5b\",\"publisher\":\"api_test\",\"id\":\"api_test_process5b\",\"state\":\"messageState\",\"startDate\":1592396243446},\"publishDate\":1592389043000,\"groupRecipientsIds\":[\"Dispatcher\"],\"type\":\"ADD\"}");
        JSONObject cardAddWantedOutput = createJSONObjectFromString("{\"card\":{\"severity\":\"ALARM\",\"summary\":{\"parameters\":{},\"key\":\"defaultProcess.summary\"},\"process\":\"defaultProcess\",\"publishDate\":1592389043000,\"title\":{\"parameters\":{},\"key\":\"defaultProcess.title\"},\"uid\":\"db914230-a5aa-42f2-aa29-f5348700fa55\",\"publisherVersion\":\"1\",\"processInstanceId\":\"process5b\",\"publisher\":\"api_test\",\"id\":\"api_test_process5b\",\"state\":\"messageState\",\"startDate\":1592396243446},\"publishDate\":1592389043000,\"groupRecipientsIds\":[\"Dispatcher\"],\"type\":\"DELETE\",\"cardId\":\"api_test_process5b\"}");
        JSONObject cardAddOutput = createJSONObjectFromString(CardRoutingUtilities.createDeleteCardMessageForUserNotRecipient(cardAdd,"test"));
        Assertions.assertThat(cardAddOutput).isEqualTo(cardAddWantedOutput); 

        String messageBodyDelete = "{\"card\":{\"severity\":\"ALARM\",\"summary\":{\"parameters\":{},\"key\":\"defaultProcess.summary\"},\"process\":\"defaultProcess\",\"publishDate\":1592389043000,\"title\":{\"parameters\":{},\"key\":\"defaultProcess.title\"},\"uid\":\"db914230-a5aa-42f2-aa29-f5348700fa55\",\"publisherVersion\":\"1\",\"processInstanceId\":\"process5b\",\"publisher\":\"api_test\",\"id\":\"api_test_process5d\",\"state\":\"messageState\",\"startDate\":1592396243446},\"publishDate\":1592389043000,\"groupRecipientsIds\":[\"Dispatcher\"],\"type\":\"DELETE\"}";
        JSONObject inputDelete = createJSONObjectFromString(messageBodyDelete);
        String outputDelete = CardRoutingUtilities.createDeleteCardMessageForUserNotRecipient(inputDelete,"test");
        Assertions.assertThat(outputDelete).isEmpty(); 
    }
}
