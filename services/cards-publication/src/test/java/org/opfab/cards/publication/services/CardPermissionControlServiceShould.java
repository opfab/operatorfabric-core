/* Copyright (c) 2022-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.services;

import org.junit.jupiter.api.Test;
import org.opfab.cards.publication.model.*;
import org.opfab.users.model.ComputedPerimeter;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.RightEnum;
import org.opfab.users.model.User;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CardPermissionControlServiceShould {

    private CardPermissionControlService cardPermissionControlService;
    private User user;
    private CurrentUserWithPerimeters currentUserWithPerimeters;

    public CardPermissionControlServiceShould() {
        cardPermissionControlService = new CardPermissionControlService();

        user = new User();
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
        currentUserWithPerimeters = new CurrentUserWithPerimeters();
        currentUserWithPerimeters.setUserData(user);
        ComputedPerimeter c1 = new ComputedPerimeter();
        ComputedPerimeter c2 = new ComputedPerimeter();
        ComputedPerimeter c3 = new ComputedPerimeter();
        c1.setProcess("PROCESS_CARD_USER");
        c1.setState("STATE1");
        c1.setRights(RightEnum.ReceiveAndWrite);
        c2.setProcess("PROCESS_CARD_USER");
        c2.setState("STATE2");
        c2.setRights(RightEnum.Receive);
        c3.setProcess("PROCESS_CARD_USER");
        c3.setState("STATE3");
        c3.setRights(RightEnum.ReceiveAndWrite);
        List<ComputedPerimeter> list = new ArrayList<>();
        list.add(c1);
        list.add(c2);
        list.add(c3);
        currentUserWithPerimeters.setComputedPerimeters(list);
    }

    @Test
    void isUserAllowedToDeleteThisCard() {
        Card cardExternal1 = new Card();
        cardExternal1.publisher = "PUBLISHER_1";
        cardExternal1.processVersion = "O";
        cardExternal1.processInstanceId = "PROCESS_1";
        cardExternal1.severity = SeverityEnum.ALARM;
        cardExternal1.title = new I18n("title", null);
        cardExternal1.summary = new I18n("summary", null);
        cardExternal1.startDate = Instant.now();
        cardExternal1.timeSpans = Arrays.asList(new TimeSpan(Instant.ofEpochMilli(123l), null));
        cardExternal1.process = "process1";
        cardExternal1.state = "state1";

        Card cardExternal2 = new Card();
        cardExternal2.publisher = "entity2";
        cardExternal2.processVersion = "O";
        cardExternal2.processInstanceId = "PROCESS_1";
        cardExternal2.severity = SeverityEnum.ALARM;
        cardExternal2.title = new I18n("title", null);
        cardExternal2.summary = new I18n("summary", null);
        cardExternal2.startDate = Instant.now();
        cardExternal2.timeSpans = Arrays.asList(new TimeSpan(Instant.ofEpochMilli(123l), null));
        cardExternal2.process = "process1";
        cardExternal2.state = "state1";

        Card cardFromAnEntity1 = new Card();
        cardFromAnEntity1.publisher = "entity3";
        cardFromAnEntity1.publisherType = PublisherTypeEnum.ENTITY;
        cardFromAnEntity1.processVersion = "O";
        cardFromAnEntity1.processInstanceId = "PROCESS_1";
        cardFromAnEntity1.severity = SeverityEnum.ALARM;
        cardFromAnEntity1.title = new I18n("title", null);
        cardFromAnEntity1.summary = new I18n("summary", null);
        cardFromAnEntity1.startDate = Instant.now();
        cardFromAnEntity1.timeSpans = Arrays.asList(new TimeSpan(Instant.ofEpochMilli(123l), null));
        cardFromAnEntity1.process = "process1";
        cardFromAnEntity1.state = "state1";

        Card cardFromAnEntity2 = new Card();
        cardFromAnEntity2.publisher = "entity2";
        cardFromAnEntity2.publisherType = PublisherTypeEnum.ENTITY;
        cardFromAnEntity2.processVersion = "O";
        cardFromAnEntity2.processInstanceId = "PROCESS_1";
        cardFromAnEntity2.severity = SeverityEnum.ALARM;
        cardFromAnEntity2.title = new I18n("title", null);
        cardFromAnEntity2.summary = new I18n("summary", null);
        cardFromAnEntity2.startDate = Instant.now();
        cardFromAnEntity2.timeSpans = Arrays.asList(new TimeSpan(Instant.ofEpochMilli(123l), null));
        cardFromAnEntity2.process = "PROCESS_NOT_IN_PERIMETER";
        cardFromAnEntity2.state = "STATE_NOT_IN_PERIMETER";

        Card cardFromAnEntity3 = new Card();
        cardFromAnEntity3.publisher = "entity2";
        cardFromAnEntity3.publisherType = PublisherTypeEnum.ENTITY;
        cardFromAnEntity3.processVersion = "O";
        cardFromAnEntity3.processInstanceId = "PROCESS_1";
        cardFromAnEntity3.severity = SeverityEnum.ALARM;
        cardFromAnEntity3.title = new I18n("title", null);
        cardFromAnEntity3.summary = new I18n("summary", null);
        cardFromAnEntity3.startDate = Instant.now();
        cardFromAnEntity3.timeSpans = Arrays.asList(new TimeSpan(Instant.ofEpochMilli(123l), null));
        cardFromAnEntity3.process = "PROCESS_CARD_USER";
        cardFromAnEntity3.state = "STATE2";

        Card cardFromAnEntity4 = new Card();
        cardFromAnEntity4.publisher = "entity2";
        cardFromAnEntity4.publisherType = PublisherTypeEnum.ENTITY;
        cardFromAnEntity4.processVersion = "O";
        cardFromAnEntity4.processInstanceId = "PROCESS_1";
        cardFromAnEntity4.severity = SeverityEnum.ALARM;
        cardFromAnEntity4.title = new I18n("title", null);
        cardFromAnEntity4.summary = new I18n("summary", null);
        cardFromAnEntity4.startDate = Instant.now();
        cardFromAnEntity4.timeSpans = Arrays.asList(new TimeSpan(Instant.ofEpochMilli(123l), null));
        cardFromAnEntity4.process = "PROCESS_CARD_USER";
        cardFromAnEntity4.state = "STATE1";

        Card cardFromAnEntity5 = new Card();
        cardFromAnEntity5.publisher = "entity2";
        cardFromAnEntity5.publisherType = PublisherTypeEnum.ENTITY;
        cardFromAnEntity5.processVersion = "O";
        cardFromAnEntity5.processInstanceId = "PROCESS_1";
        cardFromAnEntity5.severity = SeverityEnum.ALARM;
        cardFromAnEntity5.title = new I18n("title", null);
        cardFromAnEntity5.summary = new I18n("summary", null);
        cardFromAnEntity5.startDate = Instant.now();
        cardFromAnEntity5.timeSpans = Arrays.asList(new TimeSpan(Instant.ofEpochMilli(123l), null));
        cardFromAnEntity5.process = "PROCESS_CARD_USER";
        cardFromAnEntity5.state = "STATE3";

        assertThat(cardPermissionControlService.isUserAllowedToDeleteThisCard(cardExternal1, currentUserWithPerimeters))
                .isFalse();
        assertThat(cardPermissionControlService.isUserAllowedToDeleteThisCard(cardExternal2, currentUserWithPerimeters))
                .isFalse();
        assertThat(cardPermissionControlService.isUserAllowedToDeleteThisCard(cardFromAnEntity1,
                currentUserWithPerimeters)).isFalse();
        assertThat(cardPermissionControlService.isUserAllowedToDeleteThisCard(cardFromAnEntity2,
                currentUserWithPerimeters)).isFalse();
        assertThat(cardPermissionControlService.isUserAllowedToDeleteThisCard(cardFromAnEntity3,
                currentUserWithPerimeters)).isFalse();
        assertThat(cardPermissionControlService.isUserAllowedToDeleteThisCard(cardFromAnEntity4,
                currentUserWithPerimeters)).isTrue();
        assertThat(cardPermissionControlService.isUserAllowedToDeleteThisCard(cardFromAnEntity5,
                currentUserWithPerimeters)).isTrue();
    }
}
