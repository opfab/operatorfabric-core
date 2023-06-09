/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
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
class CardRoutingUtilitiesShould {
 
    private CurrentUserWithPerimeters currentUserWithPerimeters;
    private String processStateInPerimeter = "\"card\":{\"process\":\"Process1\", \"state\":\"State1\", \"publisher\":\"publisher_test\", \"publisherType\":\"EXTERNAL\"}";
    private String processStateNotInPerimeter = "\"card\":{\"process\":\"Process1\", \"state\":\"State2\", \"publisher\":\"publisher_test\", \"publisherType\":\"EXTERNAL\"}";
    private String processStateInPerimeterAndPublisherIsTheEntityOfTheUser = "\"card\":{\"process\":\"Process1\", \"state\":\"State1\", \"publisher\":\"testentity2\", \"publisherType\":\"ENTITY\"";
    private String processStateNotInPerimeterAndPublisherIsTheEntityOfTheUser = "\"card\":{\"process\":\"Process1\", \"state\":\"State2\", \"publisher\":\"testentity2\", \"publisherType\":\"ENTITY\"";

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
        JSONObject messageBodyWithNoGroupOfTheUserAndEmptyEntitiessListButPublisherIsTheEntityOfUser =
                createJSONObjectFromString("{" + processStateInPerimeterAndPublisherIsTheEntityOfTheUser + ", \"groupRecipients\":[\"testgroup3\", \"testgroup4\"], \"entityRecipients\":[]}}");  //true

        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithGroupOfTheUser, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithGroupOfTheUserButStateNotInPerimeter, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithNoGroupOfTheUser, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithGroupOfTheUserAndEmptyEntitiesList, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithNoGroupOfTheUserAndEmptyEntitiessList, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithNoGroupOfTheUserAndEmptyEntitiessListButPublisherIsTheEntityOfUser, currentUserWithPerimeters)).isTrue();
    }

    @Test
    void checkIfUserMustReceiveTheCardUsingEntitiesOnly() {


        JSONObject messageBodyWithEntityOfTheUser = createJSONObjectFromString("{" + processStateInPerimeter + ", \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}");
        JSONObject messageBodyWithEntityOfTheUserButStateNotInPerimeter = createJSONObjectFromString("{" + processStateNotInPerimeter + ", \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}");
        JSONObject messageBodyWithNoEntityOfTheUser = createJSONObjectFromString("{" + processStateInPerimeter + ", \"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}"); //false
        JSONObject messageBodyWithEntityOfTheUserAndEmptyGroupsList = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[], \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}");
        JSONObject messageBodyWithNoEntityOfTheUserAndEmptyGroupsList = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[], \"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}");
        JSONObject messageBodyWithNoEntityOfTheUserAndEmptyGroupsListButPublisherIsTheEntityOfUser =
                createJSONObjectFromString("{" + processStateInPerimeterAndPublisherIsTheEntityOfTheUser + ", \"groupRecipients\":[], \"entityRecipients\":[\"testentity3\", \"testentity4\"]}}"); //true

        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEntityOfTheUser, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEntityOfTheUserButStateNotInPerimeter, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithNoEntityOfTheUser, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEntityOfTheUserAndEmptyGroupsList, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithNoEntityOfTheUserAndEmptyGroupsList, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithNoEntityOfTheUserAndEmptyGroupsListButPublisherIsTheEntityOfUser, currentUserWithPerimeters)).isTrue();
     }

    @Test
    void checkIfUserMustReceiveTheCardUsingGroupsAndEntities() {

        JSONObject messageBodyWithEntityAndGroupOfTheUser = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}");  //true
        JSONObject messageBodyWithEntityAndGroupOfTheUser2 = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup2\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity2\", \"testentity4\"]}");  //true
        JSONObject messageBodyWithEntityAndGroupOfTheUserButStateNotInPerimeter = createJSONObjectFromString("{" + processStateNotInPerimeter + ", \"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}");  //false
        JSONObject messageBodyWithGroupOfTheUserButNotEntity = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup1\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}");  //false (in group but not in entity)
        JSONObject messageBodyWithEntityOfTheUserButNotGroup = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup3\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity1\", \"testentity4\"]}");  //false (in entity but not in group)
        JSONObject messageBodyWithNoGroupAndNoEntityOfTheUser = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[\"testgroup3\", \"testgroup4\"], \"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}");  //false (not in group and not in entity)
        JSONObject messageBodyWithNoGroupAndNoEntityOfTheUserButPublisherIsTheEntityOfUser =
                createJSONObjectFromString("{" + processStateInPerimeterAndPublisherIsTheEntityOfTheUser + ", \"groupRecipients\":[\"testgroup3\", \"testgroup4\"], \"entityRecipients\":[\"testentity3\", \"testentity4\"]}}");  //true

        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEntityAndGroupOfTheUser, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEntityAndGroupOfTheUser2, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEntityAndGroupOfTheUserButStateNotInPerimeter, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithGroupOfTheUserButNotEntity, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEntityOfTheUserButNotGroup, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithNoGroupAndNoEntityOfTheUser,currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithNoGroupAndNoEntityOfTheUserButPublisherIsTheEntityOfUser,currentUserWithPerimeters)).isTrue();
    }

    @Test
    void checkIfUserMustReceiveTheCardUsingNoGroupsAndNoEntities() {

        JSONObject messageBodyWithEmptyRecipientAndGroup = createJSONObjectFromString("{" + processStateInPerimeter + ", \"groupRecipientsIds\":[], \"entityRecipientsIds\":[]}");    //false
        JSONObject messageBodyWithNoRecipients = createJSONObjectFromString("{" + processStateInPerimeter + "}");    //false
        JSONObject messageBodyWithEmptyRecipientAndGroupButPublisherIsTheEntityOfUser =
                createJSONObjectFromString("{" + processStateInPerimeterAndPublisherIsTheEntityOfTheUser + ", \"groupRecipients\":[], \"entityRecipients\":[]}}");    //true

        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEmptyRecipientAndGroup, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithNoRecipients, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEmptyRecipientAndGroupButPublisherIsTheEntityOfUser, currentUserWithPerimeters)).isTrue();
    }

    @Test
    void checkIfUserMustReceiveTheCardUsingUserOnly() {

        JSONObject messageBodyWithTheUser = createJSONObjectFromString("{" + processStateInPerimeter + ",\"userRecipientsIds\":[\"testuser\", \"noexistantuser2\"]}");
        JSONObject messageBodyWithTheUserAndEntity = createJSONObjectFromString("{" + processStateInPerimeter + ",\"userRecipientsIds\":[\"testuser\", \"noexistantuser2\"],\"entityRecipientsIds\":[\"testentity3\", \"testentity4\"]}");
        JSONObject messageBodyWithTheUserAndGroup = createJSONObjectFromString("{" + processStateInPerimeter + ",\"userRecipientsIds\":[\"testuser\", \"noexistantuser2\"], \"groupRecipientsIds\":[\"testgroup3\", \"testgroup4\"]}");
        JSONObject messageBodyWithTheUserButStateNotInPerimeter = createJSONObjectFromString("{" + processStateNotInPerimeter + ",\"userRecipientsIds\":[\"testuser\", \"noexistantuser2\"]}");
        JSONObject messageBodyWithoutTheUser = createJSONObjectFromString("{" + processStateInPerimeter + ",\"userRecipientsIds\":[\"noexistantuser1\", \"noexistantuser2\"]}");
        JSONObject messageBodyWithTheUserAndPublisherIsTheEntityOfUserButStateNotInPerimeter =
                createJSONObjectFromString("{" + processStateNotInPerimeterAndPublisherIsTheEntityOfTheUser + ",\"userRecipients\":[\"testuser\", \"noexistantuser2\"]}}"); //false
        JSONObject messageBodyWithoutTheUserButPublisherIsTheEntityOfUser =
                createJSONObjectFromString("{" + processStateInPerimeterAndPublisherIsTheEntityOfTheUser + ",\"userRecipients\":[\"noexistantuser1\", \"noexistantuser2\"]}}"); //true

        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithTheUser, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithTheUserAndEntity, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithTheUserAndGroup, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithTheUserButStateNotInPerimeter, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithoutTheUser, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithTheUserAndPublisherIsTheEntityOfUserButStateNotInPerimeter, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithoutTheUserButPublisherIsTheEntityOfUser, currentUserWithPerimeters)).isTrue();
    }

    @Test
    void checkIfUserNeedToReceiveADeleteCardOperation() {
        JSONObject messageBodyWithUdpateAndProcessStateInPerimeter = createJSONObjectFromString("{" + processStateInPerimeter + ", \"type\":\"UPDATE\"}");
        JSONObject messageBodyWithUpdateButProcessStateNotInPerimeter = createJSONObjectFromString("{" + processStateNotInPerimeter + ", \"type\":\"UPDATE\"}");
        JSONObject messageBodyWithAddAndProcessStateInPerimeter = createJSONObjectFromString("{" + processStateInPerimeter + ", \"type\":\"ADD\"}");
         
        Assertions.assertThat(CardRoutingUtilities.checkIfUserNeedToReceiveADeleteCardOperation(messageBodyWithUdpateAndProcessStateInPerimeter, currentUserWithPerimeters)).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserNeedToReceiveADeleteCardOperation(messageBodyWithUpdateButProcessStateNotInPerimeter, currentUserWithPerimeters)).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserNeedToReceiveADeleteCardOperation(messageBodyWithAddAndProcessStateInPerimeter, currentUserWithPerimeters)).isFalse();
     

    }
}
