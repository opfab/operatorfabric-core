/* Copyright (c) 2018-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.services;

import org.assertj.core.api.Assertions;
import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
import net.minidev.json.parser.ParseException;

import org.junit.jupiter.api.Test;
import org.opfab.common.users.ComputedPerimeter;
import org.opfab.common.users.CurrentUserWithPerimeters;
import org.opfab.common.users.RightEnum;
import org.opfab.common.users.User;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;

class CardRoutingUtilitiesShould {

    private CurrentUserWithPerimeters currentUserWithPerimeters;
    private String processStateInPerimeter = "\"card\":{\"process\":\"Process1\", \"state\":\"State1\", \"publisher\":\"publisher_test\", \"publisherType\":\"EXTERNAL\"";
    private String processStateInPerimeterNotNotified = "\"card\":{\"process\":\"ProcessNotNotified\", \"state\":\"StateNotNotified\", \"publisher\":\"publisher_test\", \"publisherType\":\"EXTERNAL\"";
    private String processStateNotInPerimeter = "\"card\":{\"process\":\"Process1\", \"state\":\"State2\", \"publisher\":\"publisher_test\", \"publisherType\":\"EXTERNAL\"";
    private String processStateInPerimeterAndPublisherIsTheEntityOfTheUser = "\"card\":{\"process\":\"Process1\", \"state\":\"State1\", \"publisher\":\"testentity2\", \"publisherType\":\"ENTITY\"";
    private String processStateNotInPerimeterAndPublisherIsTheEntityOfTheUser = "\"card\":{\"process\":\"Process1\", \"state\":\"State2\", \"publisher\":\"testentity2\", \"publisherType\":\"ENTITY\"";

    private String processStateInPerimeterAndPublisherIsTheUser = "\"card\":{\"process\":\"Process1\", \"state\":\"State1\", \"publisher\":\"testuser\", \"publisherType\":\"USER\"";
    private String processStateInPerimeterAndPublisherIsAnotherUser = "\"card\":{\"process\":\"Process1\", \"state\":\"State1\", \"publisher\":\"anotheruser\", \"publisherType\":\"USER\"";

    public CardRoutingUtilitiesShould() {
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
        perimeter.setRights(RightEnum.Receive);

        ComputedPerimeter perimeterNotNotified = new ComputedPerimeter();
        perimeterNotNotified.setProcess("ProcessNotNotified");
        perimeterNotNotified.setState("StateNotNotified");
        perimeterNotNotified.setRights(RightEnum.Receive);

        currentUserWithPerimeters = new CurrentUserWithPerimeters();
        currentUserWithPerimeters.setUserData(user);
        currentUserWithPerimeters.setComputedPerimeters(Arrays.asList(perimeter, perimeterNotNotified));

        HashMap<String, List<String>> processesStatesNotNotified = new HashMap<>();
        processesStatesNotNotified.put("ProcessNotNotified", Arrays.asList("StateNotNotified"));
        currentUserWithPerimeters.setProcessesStatesNotNotified(processesStatesNotNotified);
    }

    private JSONObject createJSONObjectFromString(String jsonString) {
        try {
            return (JSONObject) (new JSONParser(JSONParser.MODE_PERMISSIVE)).parse(jsonString);
        } catch (ParseException e) {
            System.err.println("Error parsing :" + e.toString());
            return null;
        }
    }

    @Test
    void checkIfUserMustReceiveTheCardUsingGroupsOnly() {

        JSONObject messageBodyWithGroupOfTheUser = createJSONObjectFromString(
                "{" + processStateInPerimeter + ", \"groupRecipients\":[\"testgroup1\", \"testgroup4\"]}}"); // true
        JSONObject messageBodyWithGroupOfTheUserButStateNotInPerimeter = createJSONObjectFromString(
                "{" + processStateNotInPerimeter + ", \"groupRecipients\":[\"testgroup1\", \"testgroup4\"]}}"); // true
        JSONObject messageBodyWithNoGroupOfTheUser = createJSONObjectFromString(
                "{" + processStateInPerimeter + ", \"groupRecipients\":[\"testgroup3\", \"testgroup4\"]}}"); // false
        JSONObject messageBodyWithGroupOfTheUserAndEmptyEntitiesList = createJSONObjectFromString(
                "{" + processStateInPerimeter
                        + ", \"groupRecipients\":[\"testgroup1\", \"testgroup4\"], \"entityRecipients\":[]}}"); // true
        JSONObject messageBodyWithNoGroupOfTheUserAndEmptyEntitiesList = createJSONObjectFromString(
                "{" + processStateInPerimeter
                        + ", \"groupRecipients\":[\"testgroup3\", \"testgroup4\"], \"entityRecipients\":[]}}"); // false
        JSONObject messageBodyWithNoGroupOfTheUserAndEmptyEntitiesListButPublisherIsTheEntityOfUser = createJSONObjectFromString(
                "{" + processStateInPerimeterAndPublisherIsTheEntityOfTheUser
                        + ", \"groupRecipients\":[\"testgroup3\", \"testgroup4\"], \"entityRecipients\":[]}}"); // true

        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithGroupOfTheUser,
                currentUserWithPerimeters, Collections.emptyList())).isTrue();
        Assertions
                .assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                        messageBodyWithGroupOfTheUserButStateNotInPerimeter, currentUserWithPerimeters,
                        Collections.emptyList()))
                .isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithNoGroupOfTheUser,
                currentUserWithPerimeters, Collections.emptyList())).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                messageBodyWithGroupOfTheUserAndEmptyEntitiesList, currentUserWithPerimeters, Collections.emptyList()))
                .isTrue();
        Assertions
                .assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                        messageBodyWithNoGroupOfTheUserAndEmptyEntitiesList, currentUserWithPerimeters,
                        Collections.emptyList()))
                .isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                messageBodyWithNoGroupOfTheUserAndEmptyEntitiesListButPublisherIsTheEntityOfUser,
                currentUserWithPerimeters, Collections.emptyList())).isTrue();
    }

    @Test
    void checkIfUserMustReceiveTheCardUsingEntitiesOnly() {

        JSONObject messageBodyWithEntityOfTheUser = createJSONObjectFromString(
                "{" + processStateInPerimeter + ", \"entityRecipients\":[\"testentity1\", \"testentity4\"]}}"); // true
        JSONObject messageBodyWithEntityOfTheUserButStateNotInPerimeter = createJSONObjectFromString(
                "{" + processStateNotInPerimeter + ", \"entityRecipients\":[\"testentity1\", \"testentity4\"]}}"); // false
        JSONObject messageBodyWithNoEntityOfTheUser = createJSONObjectFromString(
                "{" + processStateInPerimeter + ", \"entityRecipients\":[\"testentity3\", \"testentity4\"]}}"); // false
        JSONObject messageBodyWithEntityOfTheUserAndEmptyGroupsList = createJSONObjectFromString(
                "{" + processStateInPerimeter
                        + ", \"groupRecipients\":[], \"entityRecipients\":[\"testentity1\", \"testentity4\"]}}"); // true
        JSONObject messageBodyWithNoEntityOfTheUserAndEmptyGroupsList = createJSONObjectFromString(
                "{" + processStateInPerimeter
                        + ", \"groupRecipients\":[], \"entityRecipients\":[\"testentity3\", \"testentity4\"]}}"); // false
        JSONObject messageBodyWithNoEntityOfTheUserAndEmptyGroupsListButPublisherIsTheEntityOfUser = createJSONObjectFromString(
                "{" + processStateInPerimeterAndPublisherIsTheEntityOfTheUser
                        + ", \"groupRecipients\":[], \"entityRecipients\":[\"testentity3\", \"testentity4\"]}}"); // true

        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEntityOfTheUser,
                currentUserWithPerimeters, Collections.emptyList())).isTrue();
        Assertions
                .assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                        messageBodyWithEntityOfTheUserButStateNotInPerimeter, currentUserWithPerimeters,
                        Collections.emptyList()))
                .isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithNoEntityOfTheUser,
                currentUserWithPerimeters, Collections.emptyList())).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                messageBodyWithEntityOfTheUserAndEmptyGroupsList, currentUserWithPerimeters, Collections.emptyList()))
                .isTrue();
        Assertions
                .assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                        messageBodyWithNoEntityOfTheUserAndEmptyGroupsList, currentUserWithPerimeters,
                        Collections.emptyList()))
                .isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                messageBodyWithNoEntityOfTheUserAndEmptyGroupsListButPublisherIsTheEntityOfUser,
                currentUserWithPerimeters, Collections.emptyList())).isTrue();
    }

    @Test
    void checkIfUserMustReceiveTheCardUsingEntitiesOnlyAndProcessStateNotNotified() {

        JSONObject messageBodyWithProcessStateNotNotified = createJSONObjectFromString(
                "{" + processStateInPerimeterNotNotified
                        + ", \"entityRecipients\":[\"testentity1\", \"testentity4\"]}}"); // true

        // if process state in list of process state not notified,
        // the user should not receive the card
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithProcessStateNotNotified,
                currentUserWithPerimeters, Collections.emptyList())).isFalse();

        // if process state in list of process state not notified
        // but we want to get not notified light cards for this process state,
        // the user should receive the card
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithProcessStateNotNotified,
                currentUserWithPerimeters, Arrays.asList("ProcessNotNotified.StateNotNotified"))).isTrue();

        // if process state not in list of process state not notified,
        // even if we want to get not notified light card for this process state,
        // the user should receive the card
        JSONObject messageBodyWithProcessStateNotified = createJSONObjectFromString(
                "{" + processStateInPerimeter + ", \"entityRecipients\":[\"testentity1\", \"testentity4\"]}}");
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithProcessStateNotified,
                currentUserWithPerimeters, Arrays.asList("ProcessNotNotified.StateNotNotified"))).isTrue();

    }

    @Test
    void checkIfUserMustReceiveTheCardUsingGroupsAndEntities() {

        JSONObject messageBodyWithEntityAndGroupOfTheUser = createJSONObjectFromString("{" + processStateInPerimeter
                + ", \"groupRecipients\":[\"testgroup1\", \"testgroup4\"], \"entityRecipients\":[\"testentity1\", \"testentity4\"]}}"); // true
        JSONObject messageBodyWithEntityAndGroupOfTheUser2 = createJSONObjectFromString("{" + processStateInPerimeter
                + ", \"groupRecipients\":[\"testgroup2\", \"testgroup4\"], \"entityRecipients\":[\"testentity2\", \"testentity4\"]}}"); // true
        JSONObject messageBodyWithEntityAndGroupOfTheUserButStateNotInPerimeter = createJSONObjectFromString("{"
                + processStateNotInPerimeter
                + ", \"groupRecipients\":[\"testgroup1\", \"testgroup4\"], \"entityRecipients\":[\"testentity1\", \"testentity4\"]}}"); // false
        JSONObject messageBodyWithGroupOfTheUserButNotEntity = createJSONObjectFromString("{" + processStateInPerimeter
                + ", \"groupRecipients\":[\"testgroup1\", \"testgroup4\"], \"entityRecipients\":[\"testentity3\", \"testentity4\"]}}"); // false
                                                                                                                                        // (in
                                                                                                                                        // group
                                                                                                                                        // but
                                                                                                                                        // not
                                                                                                                                        // in
                                                                                                                                        // entity)
        JSONObject messageBodyWithEntityOfTheUserButNotGroup = createJSONObjectFromString("{" + processStateInPerimeter
                + ", \"groupRecipients\":[\"testgroup3\", \"testgroup4\"], \"entityRecipients\":[\"testentity1\", \"testentity4\"]}}"); // false
                                                                                                                                        // (in
                                                                                                                                        // entity
                                                                                                                                        // but
                                                                                                                                        // not
                                                                                                                                        // in
                                                                                                                                        // group)
        JSONObject messageBodyWithNoGroupAndNoEntityOfTheUser = createJSONObjectFromString("{" + processStateInPerimeter
                + ", \"groupRecipients\":[\"testgroup3\", \"testgroup4\"], \"entityRecipients\":[\"testentity3\", \"testentity4\"]}}"); // false
                                                                                                                                        // (not
                                                                                                                                        // in
                                                                                                                                        // group
                                                                                                                                        // and
                                                                                                                                        // not
                                                                                                                                        // in
                                                                                                                                        // entity)
        JSONObject messageBodyWithNoGroupAndNoEntityOfTheUserButPublisherIsTheEntityOfUser = createJSONObjectFromString(
                "{" + processStateInPerimeterAndPublisherIsTheEntityOfTheUser
                        + ", \"groupRecipients\":[\"testgroup3\", \"testgroup4\"], \"entityRecipients\":[\"testentity3\", \"testentity4\"]}}"); // true

        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEntityAndGroupOfTheUser,
                currentUserWithPerimeters, Collections.emptyList())).isTrue();
        Assertions
                .assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEntityAndGroupOfTheUser2,
                        currentUserWithPerimeters, Collections.emptyList()))
                .isTrue();
        Assertions
                .assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                        messageBodyWithEntityAndGroupOfTheUserButStateNotInPerimeter, currentUserWithPerimeters,
                        Collections.emptyList()))
                .isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                messageBodyWithGroupOfTheUserButNotEntity, currentUserWithPerimeters, Collections.emptyList()))
                .isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                messageBodyWithEntityOfTheUserButNotGroup, currentUserWithPerimeters, Collections.emptyList()))
                .isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                messageBodyWithNoGroupAndNoEntityOfTheUser, currentUserWithPerimeters, Collections.emptyList()))
                .isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                messageBodyWithNoGroupAndNoEntityOfTheUserButPublisherIsTheEntityOfUser, currentUserWithPerimeters,
                Collections.emptyList())).isTrue();
    }

    @Test
    void checkIfUserMustReceiveTheCardUsingNoGroupsAndNoEntities() {

        JSONObject messageBodyWithEmptyRecipientAndGroup = createJSONObjectFromString(
                "{" + processStateInPerimeter + ", \"groupRecipients\":[], \"entityRecipients\":[]}}"); // false
        JSONObject messageBodyWithNoRecipients = createJSONObjectFromString("{" + processStateInPerimeter + "}}"); // false
        JSONObject messageBodyWithEmptyRecipientAndGroupButPublisherIsTheEntityOfUser = createJSONObjectFromString(
                "{" + processStateInPerimeterAndPublisherIsTheEntityOfTheUser
                        + ", \"groupRecipients\":[], \"entityRecipients\":[]}}"); // true

        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithEmptyRecipientAndGroup,
                currentUserWithPerimeters, Collections.emptyList())).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithNoRecipients,
                currentUserWithPerimeters, Collections.emptyList())).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                messageBodyWithEmptyRecipientAndGroupButPublisherIsTheEntityOfUser, currentUserWithPerimeters,
                Collections.emptyList()))
                .isTrue();
    }

    @Test
    void checkIfUserMustReceiveTheCardUsingUserOnly() {

        JSONObject messageBodyWithTheUser = createJSONObjectFromString(
                "{" + processStateInPerimeter + ",\"userRecipients\":[\"testuser\", \"noexistantuser2\"]}}"); // true
        JSONObject messageBodyWithTheUserAndEntity = createJSONObjectFromString("{" + processStateInPerimeter
                + ",\"userRecipients\":[\"testuser\", \"noexistantuser2\"],\"entityRecipients\":[\"testentity3\", \"testentity4\"]}}"); // true
        JSONObject messageBodyWithTheUserAndGroup = createJSONObjectFromString("{" + processStateInPerimeter
                + ",\"userRecipients\":[\"testuser\", \"noexistantuser2\"], \"groupRecipients\":[\"testgroup3\", \"testgroup4\"]}}"); // true
        JSONObject messageBodyWithTheUserButStateNotInPerimeter = createJSONObjectFromString(
                "{" + processStateNotInPerimeter + ",\"userRecipients\":[\"testuser\", \"noexistantuser2\"]}}"); // false
        JSONObject messageBodyWithoutTheUser = createJSONObjectFromString(
                "{" + processStateInPerimeter + ",\"userRecipients\":[\"noexistantuser1\", \"noexistantuser2\"]}}"); // false
        JSONObject messageBodyWithTheUserAndPublisherIsTheEntityOfUserButStateNotInPerimeter = createJSONObjectFromString(
                "{" + processStateNotInPerimeterAndPublisherIsTheEntityOfTheUser
                        + ",\"userRecipients\":[\"testuser\", \"noexistantuser2\"]}}"); // false
        JSONObject messageBodyWithoutTheUserButPublisherIsTheEntityOfUser = createJSONObjectFromString(
                "{" + processStateInPerimeterAndPublisherIsTheEntityOfTheUser
                        + ",\"userRecipients\":[\"noexistantuser1\", \"noexistantuser2\"]}}"); // true

        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithTheUser,
                currentUserWithPerimeters, Collections.emptyList())).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithTheUserAndEntity,
                currentUserWithPerimeters, Collections.emptyList())).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithTheUserAndGroup,
                currentUserWithPerimeters, Collections.emptyList())).isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                messageBodyWithTheUserButStateNotInPerimeter, currentUserWithPerimeters, Collections.emptyList()))
                .isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(messageBodyWithoutTheUser,
                currentUserWithPerimeters, Collections.emptyList())).isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                messageBodyWithTheUserAndPublisherIsTheEntityOfUserButStateNotInPerimeter, currentUserWithPerimeters,
                Collections.emptyList())).isFalse();
        Assertions
                .assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                        messageBodyWithoutTheUserButPublisherIsTheEntityOfUser, currentUserWithPerimeters,
                        Collections.emptyList()))
                .isTrue();
    }

    @Test
    void checkIfUserNeedToReceiveADeleteCardOperation() {
        JSONObject messageBodyWithUdpateAndProcessStateInPerimeter = createJSONObjectFromString(
                "{" + processStateInPerimeter + "}, \"type\":\"UPDATE\"}");
        JSONObject messageBodyWithUpdateButProcessStateNotInPerimeter = createJSONObjectFromString(
                "{" + processStateNotInPerimeter + "}, \"type\":\"UPDATE\"}");
        JSONObject messageBodyWithAddAndProcessStateInPerimeter = createJSONObjectFromString(
                "{" + processStateInPerimeter + "}, \"type\":\"ADD\"}");
        JSONObject messageBodyWithProcessStateNotNotified = createJSONObjectFromString(
                "{" + processStateInPerimeterNotNotified + "}, \"type\":\"UPDATE\"}");

        Assertions.assertThat(CardRoutingUtilities.checkIfUserNeedToReceiveADeleteCardOperation(
                messageBodyWithUdpateAndProcessStateInPerimeter, currentUserWithPerimeters, Collections.emptyList()))
                .isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserNeedToReceiveADeleteCardOperation(
                messageBodyWithUpdateButProcessStateNotInPerimeter, currentUserWithPerimeters, Collections.emptyList()))
                .isFalse();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserNeedToReceiveADeleteCardOperation(
                messageBodyWithAddAndProcessStateInPerimeter, currentUserWithPerimeters, Collections.emptyList()))
                .isFalse();

        // if process state in list of process state not notified,
        // the user should not receive the card delete operation
        Assertions.assertThat(CardRoutingUtilities.checkIfUserNeedToReceiveADeleteCardOperation(
                messageBodyWithProcessStateNotNotified,
                currentUserWithPerimeters, Collections.emptyList())).isFalse();

        // if process state in list of process state not notified,
        // but we want to get not notified light cards,
        // the user should receive the card delete operation
        Assertions.assertThat(CardRoutingUtilities.checkIfUserNeedToReceiveADeleteCardOperation(
                messageBodyWithProcessStateNotNotified,
                currentUserWithPerimeters, Arrays.asList("ProcessNotNotified.StateNotNotified"))).isTrue();
    }

    @Test
    void checkInCaseOfCardSentByAUser() {
        JSONObject messageBodyWithEmptyRecipientAndGroupAndPublisherIsTheUser = createJSONObjectFromString(
                "{" + processStateInPerimeterAndPublisherIsTheUser
                        + ", \"groupRecipients\":[], \"entityRecipients\":[]}}"); // true
        JSONObject messageBodyWithNoRecipientsAndPublisherIsTheUser = createJSONObjectFromString(
                "{" + processStateInPerimeterAndPublisherIsTheUser + "}}"); // true

        JSONObject messageBodyWithEmptyRecipientAndGroupAndPublisherIsAnotherUser = createJSONObjectFromString(
                "{" + processStateInPerimeterAndPublisherIsAnotherUser
                        + ", \"groupRecipients\":[], \"entityRecipients\":[]}}"); // false
        JSONObject messageBodyWithNoRecipientsAndPublisherIsAnotherUser = createJSONObjectFromString(
                "{" + processStateInPerimeterAndPublisherIsAnotherUser + "}}"); // false

        Assertions
                .assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                        messageBodyWithEmptyRecipientAndGroupAndPublisherIsTheUser, currentUserWithPerimeters,
                        Collections.emptyList()))
                .isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                messageBodyWithNoRecipientsAndPublisherIsTheUser, currentUserWithPerimeters, Collections.emptyList()))
                .isTrue();
        Assertions.assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                messageBodyWithEmptyRecipientAndGroupAndPublisherIsAnotherUser, currentUserWithPerimeters,
                Collections.emptyList()))
                .isFalse();
        Assertions
                .assertThat(CardRoutingUtilities.checkIfUserMustReceiveTheCard(
                        messageBodyWithNoRecipientsAndPublisherIsAnotherUser, currentUserWithPerimeters,
                        Collections.emptyList()))
                .isFalse();
    }
}
