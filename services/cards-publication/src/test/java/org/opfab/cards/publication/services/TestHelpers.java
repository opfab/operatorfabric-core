/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
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
import java.util.Arrays;
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

public class TestHelpers {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(TestHelpers.class);

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
        Card card = new Card();
        card.publisher = publisher;
        card.processVersion = "0";
        card.processInstanceId = "PROCESS_1";
        card.severity = SeverityEnum.ALARM;
        card.title = new I18n("title", null);
        card.summary = new I18n("summary", null);
        card.startDate = Instant.now();
        card.timeSpans = Arrays.asList(new TimeSpan(Instant.ofEpochMilli(123l), null));
        card.process = "PROCESS_CARD_USER";
        card.state = "state1";

        return card;
    }

    public static List<Card> generateFiveCards() {
        ArrayList<Card> cards = new ArrayList<>();

        Card card1 = new Card();
        card1.publisher = "PUBLISHER_1";
        card1.processVersion = "0";
        card1.processInstanceId = "PROCESS_1";
        card1.severity = SeverityEnum.ALARM;
        card1.title = new I18n("title", null);
        card1.summary = new I18n("summary", null);
        card1.startDate = Instant.now();
        card1.timeSpans = Arrays.asList(new TimeSpan(Instant.ofEpochMilli(123l), null));
        card1.process = "process1";
        card1.state = "state1";
        cards.add(card1);

        Card card2 = new Card();
        card2.publisher = "PUBLISHER_2";
        card2.processVersion = "0";
        card2.processInstanceId = "PROCESS_1";
        card2.severity = SeverityEnum.INFORMATION;
        card2.title = new I18n("title", null);
        card2.summary = new I18n("summary", null);
        card2.startDate = Instant.now();
        card2.process = "process2";
        card2.state = "state2";
        cards.add(card2);

        Card card3 = new Card();
        card3.publisher = "PUBLISHER_2";
        card3.processVersion = "0";
        card3.processInstanceId = "PROCESS_2";
        card3.severity = SeverityEnum.COMPLIANT;
        card3.title = new I18n("title", null);
        card3.summary = new I18n("summary", null);
        card3.startDate = Instant.now();
        card3.process = "process3";
        card3.state = "state3";
        cards.add(card3);

        Card card4 = new Card();
        card4.publisher = "PUBLISHER_1";
        card4.processVersion = "0";
        card4.processInstanceId = "PROCESS_2";
        card4.severity = SeverityEnum.INFORMATION;
        card4.title = new I18n("title", null);
        card4.summary = new I18n("summary", null);
        card4.startDate = Instant.now();
        card4.process = "process4";
        card4.state = "state4";
        cards.add(card4);

        Card card5 = new Card();
        card5.publisher = "PUBLISHER_1";
        card5.processVersion = "0";
        card5.processInstanceId = "PROCESS_1";
        card5.severity = SeverityEnum.INFORMATION;
        card5.title = new I18n("title", null);
        card5.summary = new I18n("summary", null);
        card5.startDate = Instant.now();
        card5.process = "process5";
        card5.state = "state5";
        cards.add(card5);

        return cards;
    }

}
