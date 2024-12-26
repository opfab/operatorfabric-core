/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.services;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.opfab.cards.publication.mocks.CardRepositoryMock;
import org.opfab.cards.publication.model.Card;
import org.opfab.cards.publication.model.I18n;
import org.opfab.cards.publication.model.SeverityEnum;
import org.opfab.cards.publication.model.TimeSpan;
import org.opfab.users.model.ComputedPerimeter;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.RightEnum;
import org.opfab.users.model.User;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class TestHelpers {

    public static User getCurrentUser() {

        User user = new User();
        user.setLogin("dummyUser");
        user.setFirstName("Test");
        user.setLastName("User");
        List<String> groups = new ArrayList<>();
        groups.add("rte");
        groups.add("operator");
        user.setGroups(groups);
        List<String> entities = new ArrayList<>();
        entities.add("newPublisherId");
        entities.add("entity2");
        user.setEntities(entities);
        return user;
    }

    public static CurrentUserWithPerimeters getCurrentUserWithPerimeter(User user) {
        CurrentUserWithPerimeters currentUserWithPerimeters = new CurrentUserWithPerimeters();
        currentUserWithPerimeters.setUserData(user);
        ComputedPerimeter c1 = new ComputedPerimeter();
        ComputedPerimeter c2 = new ComputedPerimeter();
        ComputedPerimeter c3 = new ComputedPerimeter();
        c1.setProcess("PROCESS_CARD_USER");
        c1.setState("state1");
        c1.setRights(RightEnum.ReceiveAndWrite);
        c2.setProcess("PROCESS_CARD_USER");
        c2.setState("state2");
        c2.setRights(RightEnum.Receive);
        c3.setProcess("PROCESS_CARD_USER");
        c3.setState("state3");
        c3.setRights(RightEnum.ReceiveAndWrite);
        List<ComputedPerimeter> list = new ArrayList<>();
        list.add(c1);
        list.add(c2);
        list.add(c3);
        currentUserWithPerimeters.setComputedPerimeters(list);
        return currentUserWithPerimeters;
    }

    public static boolean checkCardCount(CardRepositoryMock cardRepositoryMock, long expectedCount) {
        int count = cardRepositoryMock.count();
        if (count == expectedCount) {
            return true;
        } else {
            log.warn("Expected card count " + expectedCount + " but was " + count);
            return false;
        }
    }

    public static Card generateOneCard() {
        return TestHelpers.generateOneCard("entity2");
    }

    public static Card generateOneCard(String publisher) {
        return Card.builder().publisher(publisher).processVersion("0")
                .processInstanceId("PROCESS_1").severity(SeverityEnum.ALARM)
                .title(new I18n("title", null))
                .summary(new I18n("summary", null))
                .startDate(Instant.now())
                .timeSpan(new TimeSpan(Instant.ofEpochMilli(123l), null, null))
                .process("PROCESS_CARD_USER")
                .state("state1")
                .build();
    }

    public static List<Card> generateFiveCards() {
        ArrayList<Card> cards = new ArrayList<>();
        cards.add(
                Card.builder().publisher("PUBLISHER_1").processVersion("0")
                        .processInstanceId("PROCESS_1").severity(SeverityEnum.ALARM)
                        .title(new I18n("title", null))
                        .summary(new I18n("summary", null))
                        .startDate(Instant.now())
                        .timeSpan(new TimeSpan(Instant.ofEpochMilli(123l), null, null))
                        .process("process1")
                        .state("state1")
                        .build());
        cards.add(
                Card.builder().publisher("PUBLISHER_2").processVersion("0")
                        .processInstanceId("PROCESS_1").severity(SeverityEnum.INFORMATION)
                        .title(new I18n("title", null))
                        .summary(new I18n("summary", null))
                        .startDate(Instant.now())
                        .process("process2")
                        .state("state2")
                        .build());
        cards.add(
                Card.builder().publisher("PUBLISHER_2").processVersion("0")
                        .processInstanceId("PROCESS_2").severity(SeverityEnum.COMPLIANT)
                        .title(new I18n("title", null))
                        .summary(new I18n("summary", null))
                        .startDate(Instant.now())
                        .process("process3")
                        .state("state3")
                        .build());
        cards.add(
                Card.builder().publisher("PUBLISHER_1").processVersion("0")
                        .processInstanceId("PROCESS_2").severity(SeverityEnum.INFORMATION)
                        .title(new I18n("title", null))
                        .summary(new I18n("summary", null))
                        .startDate(Instant.now())
                        .process("process4")
                        .state("state4")
                        .build());
        cards.add(
                Card.builder().publisher("PUBLISHER_1").processVersion("0")
                        .processInstanceId("PROCESS_1").severity(SeverityEnum.INFORMATION)
                        .title(new I18n("title", null))
                        .summary(new I18n("summary", null))
                        .startDate(Instant.now())
                        .process("process5")
                        .state("state5")
                        .build());
        return cards;
    }

}
