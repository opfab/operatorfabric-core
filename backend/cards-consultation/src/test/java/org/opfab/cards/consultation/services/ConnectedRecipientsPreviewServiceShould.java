/* Copyright (c) 2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.services;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opfab.cards.consultation.model.Card;
import org.opfab.cards.consultation.model.PublisherTypeEnum;
import org.opfab.common.users.ComputedPerimeter;
import org.opfab.common.users.CurrentUserWithPerimeters;
import org.opfab.common.users.RightEnum;
import org.opfab.common.users.User;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ConnectedRecipientsPreviewServiceShould {

    @Mock
    private CardSubscriptionService cardSubscriptionService;

    private ConnectedRecipientsPreviewService connectedRecipientsPreviewService;

    @BeforeEach
    void setUp() {
        connectedRecipientsPreviewService = new ConnectedRecipientsPreviewService(cardSubscriptionService);
    }

    @Test
    void returnEmptyListWhenNoSubscriptions() {
        Card card = createCard();
        card.entityRecipients = Arrays.asList("entity1", "entity2");

        when(cardSubscriptionService.getSubscriptions()).thenReturn(new ArrayList<>());

        List<String> result = connectedRecipientsPreviewService.getConnectedRecipients(card);

        Assertions.assertThat(result).isEmpty();
    }

    @Test
    void returnConnectedRecipientsWhenUserMatchesCardCriteria() {
        Card card = createCard();
        card.entityRecipients = Arrays.asList("entity1", "entity2");
        card.groupRecipients = Arrays.asList("group1");

        CurrentUserWithPerimeters user1 = createUserWithPerimeters(
                "user1",
                Arrays.asList("entity1", "entity3"),
                Arrays.asList("group1"),
                createPerimeter("Process1", "State1", RightEnum.Receive));

        CardSubscription subscription1 = createCardSubscription(user1);

        when(cardSubscriptionService.getSubscriptions()).thenReturn(Arrays.asList(subscription1));

        List<String> result = connectedRecipientsPreviewService.getConnectedRecipients(card);

        Assertions.assertThat(result).containsExactly("entity1");
    }

    @Test
    void returnMultipleConnectedRecipientsWhenMultipleUsersMatch() {
        Card card = createCard();
        card.entityRecipients = Arrays.asList("entity1", "entity2", "entity3");
        card.groupRecipients = Arrays.asList("group1");

        CurrentUserWithPerimeters user1 = createUserWithPerimeters(
                "user1",
                Arrays.asList("entity1", "entity4"),
                Arrays.asList("group1"),
                createPerimeter("Process1", "State1", RightEnum.Receive));

        CurrentUserWithPerimeters user2 = createUserWithPerimeters(
                "user2",
                Arrays.asList("entity2", "entity5"),
                Arrays.asList("group1"),
                createPerimeter("Process1", "State1", RightEnum.Receive));

        CardSubscription subscription1 = createCardSubscription(user1);
        CardSubscription subscription2 = createCardSubscription(user2);

        when(cardSubscriptionService.getSubscriptions()).thenReturn(Arrays.asList(subscription1, subscription2));

        List<String> result = connectedRecipientsPreviewService.getConnectedRecipients(card);

        Assertions.assertThat(result).containsExactlyInAnyOrder("entity1", "entity2");
    }

    @Test
    void returnConnectedRecipientsFromEntityRecipientsForInformation() {
        Card card = createCard();
        card.entityRecipients = Arrays.asList("entity1");
        card.entityRecipientsForInformation = Arrays.asList("entity2", "entity3");
        card.groupRecipients = Arrays.asList("group1");

        CurrentUserWithPerimeters user1 = createUserWithPerimeters(
                "user1",
                Arrays.asList("entity2", "entity4"),
                Arrays.asList("group1"),
                createPerimeter("Process1", "State1", RightEnum.Receive));

        CardSubscription subscription1 = createCardSubscription(user1);

        when(cardSubscriptionService.getSubscriptions()).thenReturn(Arrays.asList(subscription1));

        List<String> result = connectedRecipientsPreviewService.getConnectedRecipients(card);

        Assertions.assertThat(result).containsExactly("entity2");
    }

    @Test
    void returnConnectedRecipientsFromBothEntityRecipientsAndEntityRecipientsForInformation() {
        Card card = createCard();
        card.entityRecipients = Arrays.asList("entity1", "entity2");
        card.entityRecipientsForInformation = Arrays.asList("entity3", "entity4");
        card.groupRecipients = Arrays.asList("group1");

        CurrentUserWithPerimeters user1 = createUserWithPerimeters(
                "user1",
                Arrays.asList("entity1", "entity3", "entity5"),
                Arrays.asList("group1"),
                createPerimeter("Process1", "State1", RightEnum.Receive));

        CardSubscription subscription1 = createCardSubscription(user1);

        when(cardSubscriptionService.getSubscriptions()).thenReturn(Arrays.asList(subscription1));

        List<String> result = connectedRecipientsPreviewService.getConnectedRecipients(card);

        Assertions.assertThat(result).containsExactlyInAnyOrder("entity1", "entity3");
    }

    @Test
    void excludeEntityWhenUserDoesNotHaveRequiredPerimeter() {
        Card card = createCard();
        card.entityRecipients = Arrays.asList("entity1", "entity2");
        card.groupRecipients = Arrays.asList("group1");

        // User has correct entity and group but wrong perimeter (wrong state)
        CurrentUserWithPerimeters user1 = createUserWithPerimeters(
                "user1",
                Arrays.asList("entity1", "entity3"),
                Arrays.asList("group1"),
                createPerimeter("Process1", "State2", RightEnum.Receive));

        CardSubscription subscription1 = createCardSubscription(user1);

        when(cardSubscriptionService.getSubscriptions()).thenReturn(Arrays.asList(subscription1));

        List<String> result = connectedRecipientsPreviewService.getConnectedRecipients(card);

        Assertions.assertThat(result).isEmpty();
    }

    @Test
    void handleMultipleEntitiesForSingleUser() {
        Card card = createCard();
        card.entityRecipients = Arrays.asList("entity1", "entity2", "entity3");
        card.groupRecipients = Arrays.asList("group1");

        // User belongs to multiple entities that are card recipients
        CurrentUserWithPerimeters user1 = createUserWithPerimeters(
                "user1",
                Arrays.asList("entity1", "entity2", "entity4"),
                Arrays.asList("group1"),
                createPerimeter("Process1", "State1", RightEnum.Receive));

        CardSubscription subscription1 = createCardSubscription(user1);

        when(cardSubscriptionService.getSubscriptions()).thenReturn(Arrays.asList(subscription1));

        List<String> result = connectedRecipientsPreviewService.getConnectedRecipients(card);

        Assertions.assertThat(result).containsExactlyInAnyOrder("entity1", "entity2");
    }

    @Test
    void returnEmptyListWhenCardHasNoEntityRecipients() {
        Card card = createCard();
        card.entityRecipients = new ArrayList<>();
        card.entityRecipientsForInformation = new ArrayList<>();
        card.groupRecipients = Arrays.asList("group1");

        CurrentUserWithPerimeters user1 = createUserWithPerimeters(
                "user1",
                Arrays.asList("entity1", "entity2"),
                Arrays.asList("group1"),
                createPerimeter("Process1", "State1", RightEnum.Receive));

        CardSubscription subscription1 = createCardSubscription(user1);

        when(cardSubscriptionService.getSubscriptions()).thenReturn(Arrays.asList(subscription1));

        List<String> result = connectedRecipientsPreviewService.getConnectedRecipients(card);

        Assertions.assertThat(result).isEmpty();
    }

    @Test
    void returnEmptyListWhenCardHasNullEntityRecipients() {
        Card card = createCard();
        card.entityRecipients = null;
        card.entityRecipientsForInformation = null;
        card.groupRecipients = Arrays.asList("group1");

        CurrentUserWithPerimeters user1 = createUserWithPerimeters(
                "user1",
                Arrays.asList("entity1", "entity2"),
                Arrays.asList("group1"),
                createPerimeter("Process1", "State1", RightEnum.Receive));

        CardSubscription subscription1 = createCardSubscription(user1);

        when(cardSubscriptionService.getSubscriptions()).thenReturn(Arrays.asList(subscription1));

        List<String> result = connectedRecipientsPreviewService.getConnectedRecipients(card);

        Assertions.assertThat(result).isEmpty();
    }

    @Test
    void handleNullEntityRecipientsForInformation() {
        Card card = createCard();
        card.entityRecipients = Arrays.asList("entity1", "entity2");
        card.entityRecipientsForInformation = null;
        card.groupRecipients = Arrays.asList("group1");

        CurrentUserWithPerimeters user1 = createUserWithPerimeters(
                "user1",
                Arrays.asList("entity1", "entity3"),
                Arrays.asList("group1"),
                createPerimeter("Process1", "State1", RightEnum.Receive));

        CardSubscription subscription1 = createCardSubscription(user1);

        when(cardSubscriptionService.getSubscriptions()).thenReturn(Arrays.asList(subscription1));

        List<String> result = connectedRecipientsPreviewService.getConnectedRecipients(card);

        Assertions.assertThat(result).containsExactly("entity1");
    }

    // Helper methods

    private Card createCard() {
        Card card = new Card();
        card.id = "card1";
        card.process = "Process1";
        card.state = "State1";
        card.publisher = "publisher_test";
        card.publisherType = PublisherTypeEnum.EXTERNAL;
        card.entityRecipients = new ArrayList<>();
        card.entityRecipientsForInformation = new ArrayList<>();
        card.groupRecipients = new ArrayList<>();
        card.userRecipients = new ArrayList<>();
        return card;
    }

    private CurrentUserWithPerimeters createUserWithPerimeters(String login, List<String> entities,
            List<String> groups, ComputedPerimeter perimeter) {
        User user = new User();
        user.setLogin(login);
        user.setFirstName("Test");
        user.setLastName("User");
        user.setEntities(entities);
        user.setGroups(groups);

        CurrentUserWithPerimeters currentUserWithPerimeters = new CurrentUserWithPerimeters();
        currentUserWithPerimeters.setUserData(user);
        currentUserWithPerimeters.setComputedPerimeters(Arrays.asList(perimeter));

        return currentUserWithPerimeters;
    }

    private ComputedPerimeter createPerimeter(String process, String state, RightEnum right) {
        ComputedPerimeter perimeter = new ComputedPerimeter();
        perimeter.setProcess(process);
        perimeter.setState(state);
        perimeter.setRights(right);
        return perimeter;
    }

    private CardSubscription createCardSubscription(CurrentUserWithPerimeters currentUserWithPerimeters) {
        return new CardSubscription(null, currentUserWithPerimeters, "client1");
    }
}
