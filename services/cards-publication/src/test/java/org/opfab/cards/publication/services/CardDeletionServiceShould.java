/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.services;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.cards.publication.application.UnitTestApplication;
import org.opfab.cards.publication.mocks.CardRepositoryMock;
import org.opfab.cards.publication.mocks.I18NRepositoryMock;
import org.opfab.cards.publication.mocks.ProcessRepositoryMock;
import org.opfab.cards.publication.model.Card;
import org.opfab.cards.publication.model.I18n;
import org.opfab.cards.publication.model.PublisherTypeEnum;
import org.opfab.cards.publication.model.SeverityEnum;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.test.EventBusSpy;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.client.ExpectedCount;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = { UnitTestApplication.class })
@Import({ RestTemplate.class })
class CardDeletionServiceShould {

        private static final String API_TEST_EXTERNAL_RECIPIENT_1 = "api_test_externalRecipient1";
        private static final String EXTERNALAPP_URL = "http://localhost:8090/test";

        @Autowired
        private RestTemplate restTemplate;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private ExternalAppService externalAppService;

        private CardProcessingService cardProcessingService;
        private CardDeletionService cardDeletionService;

        private CardTranslationService cardTranslationService;
        private EventBusSpy eventBusSpy;
        private CardNotificationService cardNotificationService;

        @Autowired
        private CardRepositoryMock cardRepositoryMock;

        private I18NRepositoryMock i18NRepositoryMock = new I18NRepositoryMock();
        private ProcessRepositoryMock processRepositoryMock = new ProcessRepositoryMock();

        private MockRestServiceServer mockServer;

        private User user;
        private CurrentUserWithPerimeters currentUserWithPerimeters;
        private Optional<Jwt> token = Optional.empty();

        @BeforeEach
        public void init() {
                eventBusSpy = new EventBusSpy();
                cardNotificationService = new CardNotificationService(eventBusSpy, objectMapper);
                cardTranslationService = new CardTranslationService(i18NRepositoryMock);
                CardValidationService cardValidationService = new CardValidationService(cardRepositoryMock,
                                processRepositoryMock);
                cardDeletionService = new CardDeletionService(cardNotificationService, cardRepositoryMock,
                                externalAppService, true);
                cardProcessingService = new CardProcessingService(cardDeletionService,
                                cardNotificationService,
                                cardRepositoryMock, externalAppService,
                                cardTranslationService, cardValidationService, true, true,
                                false, 1000, 3600, true);
                user = TestHelpers.getCurrentUser();
                currentUserWithPerimeters = TestHelpers.getCurrentUserWithPerimeter(user);
                cardRepositoryMock.clear();
                eventBusSpy.clearMessageSent();
                mockServer = MockRestServiceServer.createServer(restTemplate);
        }

        @Test
        void GIVEN_a_parent_card_and_a_child_card_WHEN_deleting_the_parent_card_THEN_child_card_is_deleted() {
                Card card = TestHelpers.generateOneCard();
                cardProcessingService.processCard(card);
                Card childCard = Card.builder().publisher("newPublisherId")
                                .processVersion("0")
                                .processInstanceId("PROCESS_CARD_USER").severity(SeverityEnum.INFORMATION)
                                .process("PROCESS_CARD_USER")
                                .parentCardId(card.getId())
                                .initialParentCardUid(card.getUid())
                                .title(new I18n("title", null))
                                .summary(new I18n("summary", null))
                                .startDate(Instant.now())
                                .state("state1")
                                .build();
                cardProcessingService.processUserCard(childCard, currentUserWithPerimeters, token);
                Assertions.assertThat(cardRepositoryMock.count()).isEqualTo(2);

                cardDeletionService.deleteCardByIdWithUser(card.getId(), Optional.empty(), token);

                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 0)).isTrue();
        }

        @Test
        void GIVEN_an_existing_card_WHEN_deleting_card_with_id_provided_THEN_card_is_removed_from_database() {

                List<Card> cards = TestHelpers.generateFiveCards();
                cards.forEach(card -> cardProcessingService.processCard(card));

                Card firstCard = cards.get(0);
                String id = firstCard.getId();
                cardDeletionService.deleteCardByIdWithUser(id, Optional.empty(), token);

                // one card should be deleted(the first one)
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 4)).isTrue();
        }

        @Test
        void GIVEN_an_existing_card_with_external_recipient_WHEN_deleting_the_card_THEN_card_is_deleted_and_delete_is_send_to_external_recipient()
                        throws URISyntaxException {

                Card card = TestHelpers.generateOneCard();
                List<String> externalRecipients = new ArrayList<>();
                externalRecipients.add(API_TEST_EXTERNAL_RECIPIENT_1);
                card.setExternalRecipients(externalRecipients); 
                mockServer.expect(ExpectedCount.once(),
                                requestTo(new URI(EXTERNALAPP_URL)))
                                .andExpect(method(HttpMethod.POST))
                                .andRespond(withStatus(HttpStatus.ACCEPTED));
                mockServer.expect(ExpectedCount.once(),
                                requestTo(new URI(EXTERNALAPP_URL + "/PROCESS_CARD_USER.PROCESS_1")))
                                .andExpect(method(HttpMethod.DELETE))
                                .andRespond(withStatus(HttpStatus.ACCEPTED));
                cardProcessingService.processCard(card);
                cardDeletionService.deleteCardByIdWithUser(card.getId(), Optional.empty(), token);
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 0)).isTrue();
                mockServer.verify();
        }


        @Test
        void GIVEN_existing_cards_WHEN_try_to_delete_card_with_none_existing_id_THEN_no_card_is_delete() {
                List<Card> cards = TestHelpers.generateFiveCards();
                cards.forEach(card -> cardProcessingService.processCard(card));
                cardDeletionService.deleteCardByIdWithUser("dummyID", Optional.empty(), token);
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 5)).isTrue();
        }

        @Test
        void GIVEN_5_cards_with_two_cards_expiration_date_in_the_past_WHEN_delete_cards_by_expirationDate_set_to_now_THEN_2_cards_are_deleted() {
                List<Card> cards = TestHelpers.generateFiveCards();
                Instant ref = Instant.now();
                cards.get(0).setExpirationDate(null);
                cards.get(1).setExpirationDate(null);
                cards.get(2).setExpirationDate(ref.plusSeconds(10000));
                cards.get(3).setStartDate(ref.minusSeconds(20000));
                cards.get(3).setExpirationDate(ref.minusSeconds(10000));
                cards.get(4).setStartDate(ref.minusSeconds(20000));
                cards.get(4).setExpirationDate(ref.minusSeconds(10000));
                cards.forEach(card -> cardProcessingService.processCard(card));

                cardDeletionService.deleteCardsByExpirationDate(Instant.now());

                // 5 add message and 2 delete messages
                Assertions.assertThat(eventBusSpy.getMessagesSent()).hasSize(7);
                // 2 cards should be removed
                Assertions.assertThat(cardRepositoryMock.count()).isEqualTo(3);
        }

        @Test
        void GIVEN_an_existing_card_WHEN_card_is_deleted_with_a_login_different_than_publisher_THEN_card_deletion_is_rejected() {
                User otherUser = new User();
                otherUser.setLogin("wrongUser");
                otherUser.setFirstName("Test");
                otherUser.setLastName("User");
                CurrentUserWithPerimeters wrongUser = new CurrentUserWithPerimeters();
                wrongUser.setUserData(otherUser);
                wrongUser.setComputedPerimeters(currentUserWithPerimeters.getComputedPerimeters());

                Card card = TestHelpers.generateOneCard(currentUserWithPerimeters.getUserData().getLogin());
                card.setPublisherType(PublisherTypeEnum.EXTERNAL);
                Optional<CurrentUserWithPerimeters> optionalWrongUser = Optional.of(wrongUser);

                cardProcessingService.processCard(card, Optional.of(currentUserWithPerimeters), token, false);
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
                String cardId = card.getId();
                Assertions.assertThatThrownBy(
                                () -> cardDeletionService.deleteCardByIdWithUser(cardId, optionalWrongUser, token))
                                .isInstanceOf(ApiErrorException.class).hasMessage(
                                                "Card publisher is set to dummyUser and account login is wrongUser, the card cannot be deleted");
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
        }

        @Test
        void GIVEN_a_card_created_by_dummyUser_WHEN_wrongUser_delete_the_card_with_representative_dummyUser_THEN_card_is_rejected() {

                User dummyUser = new User();
                dummyUser.setLogin("wrongUser");
                dummyUser.setFirstName("Test");
                dummyUser.setLastName("User");
                CurrentUserWithPerimeters wrongUser = new CurrentUserWithPerimeters();
                wrongUser.setUserData(dummyUser);

                Card card = TestHelpers.generateOneCard("IGNORED_PUBLISHER");
                card.setPublisherType(PublisherTypeEnum.EXTERNAL);
                card.setRepresentativeType(PublisherTypeEnum.EXTERNAL);
                card.setRepresentative(currentUserWithPerimeters.getUserData().getLogin());
                Optional<CurrentUserWithPerimeters> optionalWrongUser = Optional.of(wrongUser);

                cardProcessingService.processCard(card, Optional.of(currentUserWithPerimeters), token, false);
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
                String cardId = card.getId();
                Assertions.assertThatThrownBy(
                                () -> cardDeletionService.deleteCardByIdWithUser(cardId, optionalWrongUser, token))
                                .isInstanceOf(ApiErrorException.class).hasMessage(
                                                "Card representative is set to dummyUser and account login is wrongUser, the card cannot be deleted");
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
        }

}
