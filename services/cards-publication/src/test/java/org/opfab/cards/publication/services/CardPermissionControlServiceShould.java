/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.publication.services;

import org.junit.jupiter.api.Test;
import org.opfab.cards.model.SeverityEnum;
import org.opfab.cards.publication.model.*;
import org.opfab.users.model.ComputedPerimeter;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.RightsEnum;
import org.opfab.users.model.User;
import java.time.Instant;
import java.util.ArrayList;
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
        c1.setProcess("PROCESS_CARD_USER") ;
        c1.setState("STATE1");
        c1.setRights(RightsEnum.RECEIVEANDWRITE);
        c2.setProcess("PROCESS_CARD_USER") ;
        c2.setState("STATE2");
        c2.setRights(RightsEnum.RECEIVE);
        c3.setProcess("PROCESS_CARD_USER") ;
        c3.setState("STATE3");
        c3.setRights(RightsEnum.WRITE);
        List<ComputedPerimeter> list=new ArrayList<>();
        list.add(c1);
        list.add(c2);
        list.add(c3);
        currentUserWithPerimeters.setComputedPerimeters(list);
    }

    @Test
    void isUserAllowedToDeleteThisCard() {
        CardPublicationData cardExternal1 = CardPublicationData.builder()   //false because publisherType not ENTITY
                .publisher("PUBLISHER_1")
                .processVersion("O")
                .processInstanceId("PROCESS_1")
                .severity(SeverityEnum.ALARM)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .timeSpan(TimeSpanPublicationData.builder()
                        .start(Instant.ofEpochMilli(123l)).build())
                .process("process1")
                .state("state1")
                .build();

        CardPublicationData cardExternal2 = CardPublicationData.builder()   //false because publisherType not ENTITY
                .publisher("entity2")
                .processVersion("O")
                .processInstanceId("PROCESS_1")
                .severity(SeverityEnum.ALARM)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .timeSpan(TimeSpanPublicationData.builder()
                        .start(Instant.ofEpochMilli(123l)).build())
                .process("process1")
                .state("state1")
                .build();

        CardPublicationData cardFromAnEntity1 = CardPublicationData.builder() // false because publisher not an entity of the user
                .publisher("entity3")
                .publisherType(PublisherTypeEnum.ENTITY)
                .processVersion("O")
                .processInstanceId("PROCESS_1")
                .severity(SeverityEnum.ALARM)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .timeSpan(TimeSpanPublicationData.builder()
                        .start(Instant.ofEpochMilli(123l)).build())
                .process("process1")
                .state("state1")
                .build();

        CardPublicationData cardFromAnEntity2 = CardPublicationData.builder() // false because not process/state in the perimeter of the user
                .publisher("entity2")
                .publisherType(PublisherTypeEnum.ENTITY)
                .processVersion("O")
                .processInstanceId("PROCESS_1")
                .severity(SeverityEnum.ALARM)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .timeSpan(TimeSpanPublicationData.builder()
                        .start(Instant.ofEpochMilli(123l)).build())
                .process("PROCESS_NOT_IN_PERIMETER")
                .state("STATE_NOT_IN_PERIMETER")
                .build();

        CardPublicationData cardFromAnEntity3 = CardPublicationData.builder() // false because not write access for the user
                .publisher("entity2")
                .publisherType(PublisherTypeEnum.ENTITY)
                .processVersion("O")
                .processInstanceId("PROCESS_1")
                .severity(SeverityEnum.ALARM)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .timeSpan(TimeSpanPublicationData.builder()
                        .start(Instant.ofEpochMilli(123l)).build())
                .process("PROCESS_CARD_USER")
                .state("STATE2")
                .build();

        CardPublicationData cardFromAnEntity4 = CardPublicationData.builder() // true
                .publisher("entity2")
                .publisherType(PublisherTypeEnum.ENTITY)
                .processVersion("O")
                .processInstanceId("PROCESS_1")
                .severity(SeverityEnum.ALARM)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .timeSpan(TimeSpanPublicationData.builder()
                        .start(Instant.ofEpochMilli(123l)).build())
                .process("PROCESS_CARD_USER")
                .state("STATE1")
                .build();

        CardPublicationData cardFromAnEntity5 = CardPublicationData.builder() // true
                .publisher("entity2")
                .publisherType(PublisherTypeEnum.ENTITY)
                .processVersion("O")
                .processInstanceId("PROCESS_1")
                .severity(SeverityEnum.ALARM)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .timeSpan(TimeSpanPublicationData.builder()
                        .start(Instant.ofEpochMilli(123l)).build())
                .process("PROCESS_CARD_USER")
                .state("STATE3")
                .build();

        assertThat(cardPermissionControlService.isUserAllowedToDeleteThisCard(cardExternal1, currentUserWithPerimeters)).isFalse();
        assertThat(cardPermissionControlService.isUserAllowedToDeleteThisCard(cardExternal2, currentUserWithPerimeters)).isFalse();
        assertThat(cardPermissionControlService.isUserAllowedToDeleteThisCard(cardFromAnEntity1, currentUserWithPerimeters)).isFalse();
        assertThat(cardPermissionControlService.isUserAllowedToDeleteThisCard(cardFromAnEntity2, currentUserWithPerimeters)).isFalse();
        assertThat(cardPermissionControlService.isUserAllowedToDeleteThisCard(cardFromAnEntity3, currentUserWithPerimeters)).isFalse();
        assertThat(cardPermissionControlService.isUserAllowedToDeleteThisCard(cardFromAnEntity4, currentUserWithPerimeters)).isTrue();
        assertThat(cardPermissionControlService.isUserAllowedToDeleteThisCard(cardFromAnEntity5, currentUserWithPerimeters)).isTrue();
    }
}
