/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.services;

import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.cards.publication.application.UnitTestApplication;
import org.opfab.cards.publication.mocks.CardRepositoryMock;
import org.opfab.cards.publication.mocks.I18NRepositoryMock;
import org.opfab.cards.publication.mocks.ProcessRepositoryMock;
import org.opfab.cards.publication.model.ArchivedCard;
import org.opfab.cards.publication.model.Card;
import org.opfab.cards.publication.model.CardActionEnum;
import org.opfab.cards.publication.model.HoursAndMinutes;
import org.opfab.cards.publication.model.I18n;
import org.opfab.cards.publication.model.PublisherTypeEnum;
import org.opfab.cards.publication.model.Recurrence;
import org.opfab.cards.publication.model.SeverityEnum;
import org.opfab.cards.publication.model.TimeSpan;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.test.EventBusSpy;
import org.opfab.users.model.ComputedPerimeter;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.RightsEnum;
import org.opfab.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.client.ExpectedCount;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.ConstraintViolationException;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = { UnitTestApplication.class })
@Import({ RestTemplate.class })
@Slf4j
class CardProcessServiceShould {

        private static final String API_TEST_EXTERNAL_RECIPIENT_1 = "api_test_externalRecipient1";
        private static final String EXTERNALAPP_URL = "http://localhost:8090/test";

        @Autowired
        private RestTemplate restTemplate;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private ExternalAppService externalAppService;

        private CardProcessingService cardProcessingService;
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
                CardDeletionService cardDeletionService = new CardDeletionService(cardNotificationService,
                                cardRepositoryMock, externalAppService, true);
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

        private boolean checkCardPublisherId(Card card) {
                if (user.getEntities().contains(card.getPublisher())) {
                        return true;
                } else {
                        log.warn("Expected card publisher id is " + user.getEntities().get(0) + " but it was "
                                        + card.getPublisher());
                        return false;
                }
        }

        private boolean checkArchiveCount(long expectedCount) {
                int count = cardRepositoryMock.countArchivedCard();
                if (count == expectedCount)
                        return true;
                else {
                        log.warn("Expected card count " + expectedCount + " but was " + count);
                        return false;
                }
        }

        @Test
        void GIVEN_a_publisher_WHEN_sending_5_cards_THEN_cards_are_saved() {
                TestHelpers.generateFiveCards().forEach(card -> {
                        cardProcessingService.processCard(card);
                });
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 5)).isTrue();
                Assertions.assertThat(checkArchiveCount(5)).isTrue();
        }

        @Test
        void GIVEN_a_publisher_WHEN_patching_a_card_THEN_card_is_saved() {
                Card initialCard = TestHelpers.generateOneCard();
                cardProcessingService.processCard(initialCard);
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
                Assertions.assertThat(checkArchiveCount(1)).isTrue();

                Card patchCard = Card.builder().severity(SeverityEnum.ALARM).build();
                cardProcessingService.patchCard(initialCard.getId(), patchCard, Optional.empty(), Optional.empty());

                Card persistedCard = cardRepositoryMock.findCardById(initialCard.getId(), false);
                assertThat(persistedCard.getSeverity()).isEqualTo(SeverityEnum.ALARM);
                assertThat(persistedCard.getStartDate()).isEqualTo(initialCard.getStartDate());
                assertThat(persistedCard.getTitle()).isEqualTo(initialCard.getTitle());
                assertThat(persistedCard.getPublisher()).isEqualTo(initialCard.getPublisher());
                assertThat(persistedCard.getProcess()).isEqualTo(initialCard.getProcess());
                assertThat(persistedCard.getProcessInstanceId()).isEqualTo(initialCard.getProcessInstanceId());

                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
                Assertions.assertThat(checkArchiveCount(2)).isTrue();
        }

        @Test
        void GIVEN_a_publisher_WHEN_patching_a_nonexistent_card_THEN_card_is_not_saved() {
                Optional<CurrentUserWithPerimeters> emptyForUser = Optional.empty();
                Optional<Jwt> emptyForJwt = Optional.empty();
                Card initialCard = TestHelpers.generateOneCard();
                cardProcessingService.processCard(initialCard);
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
                Assertions.assertThat(checkArchiveCount(1)).isTrue();

                Card patchCard = Card.builder().severity(SeverityEnum.ALARM).build();
                Assertions.assertThatThrownBy(() -> cardProcessingService.patchCard("nonexistentId",
                                patchCard, emptyForUser, emptyForJwt))
                                .isInstanceOf(ApiErrorException.class)
                                .hasMessageContaining("Card with id nonexistentId not found");
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
                Assertions.assertThat(checkArchiveCount(1)).isTrue();
        }

        @Test
        void GIVEN_a_publisher_WHEN_sending_a_new_card_THEN_card_event_ADD_is_send_to_eventBus() {

                cardProcessingService.processCard(TestHelpers.generateOneCard());
                Assertions.assertThat(eventBusSpy.getMessagesSent().get(0)[1]).contains("{\"type\":\"ADD\"");
        }

        @Test
        void GIVEN_a_publisher_WHEN_sending_an_updated_card_THEN_card_event_UPDATE_is_send_to_eventBus() {

                cardProcessingService.processCard(TestHelpers.generateOneCard());
                cardProcessingService.processCard(TestHelpers.generateOneCard());
                Assertions.assertThat(eventBusSpy.getMessagesSent().get(1)[1]).contains("{\"type\":\"UPDATE\"");
        }

        @Test
        void GIVEN_a_publisher_WHEN_sending_5_cards_THEN_5_cards_events_are_send_to_eventBus() {
                TestHelpers.generateFiveCards().forEach(card -> {
                        cardProcessingService.processCard(card);
                });
                Assertions.assertThat(eventBusSpy.getMessagesSent()).hasSize(5);
        }

        @Test
        void GIVEN_a_card_with_external_recipient_WHEN_sending_the_card_THEN_card_is_send_to_external_recipient()
                        throws URISyntaxException {
                ArrayList<String> externalRecipients = new ArrayList<>();
                externalRecipients.add(API_TEST_EXTERNAL_RECIPIENT_1);
                Card card = TestHelpers.generateOneCard("newPublisherId");
                card.setExternalRecipients(externalRecipients);
                mockServer.expect(ExpectedCount.once(),
                                requestTo(new URI(EXTERNALAPP_URL)))
                                .andExpect(method(HttpMethod.POST))
                                .andRespond(withStatus(HttpStatus.ACCEPTED));

                Assertions.assertThatCode(
                                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                                .doesNotThrowAnyException();
                Assertions.assertThat(checkCardPublisherId(card)).isTrue();

        }

        @Test
        void GIVEN_a_user_card_with_wrong_publisher_WHEN_sending_card_THEN_card_is_rejected() {

                Card card = TestHelpers.generateOneCard("PUBLISHER_X");
                Assertions.assertThatThrownBy(
                                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                                .isInstanceOf(IllegalArgumentException.class)
                                .hasMessageContaining("Publisher is not valid, the card is rejected");
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 0)).isTrue();
                Assertions.assertThat(checkArchiveCount(0)).isTrue();
        }

        @Test
        void GIVEN_a_parent_card_WHEN_sending_a_child_card_THEN_card_is_accepted_and_saved() throws URISyntaxException {

                Card card = TestHelpers.generateOneCard();
                cardProcessingService.processCard(card);

                ArrayList<String> externalRecipients = new ArrayList<>();
                externalRecipients.add(API_TEST_EXTERNAL_RECIPIENT_1);

                Card childCard = Card.builder().publisher("newPublisherId")
                                .processVersion("0")
                                .processInstanceId("PROCESS_CARD_USER").severity(SeverityEnum.INFORMATION)
                                .process("PROCESS_CARD_USER")
                                .parentCardId(card.getId())
                                .initialParentCardUid(card.getUid())
                                .title(new I18n("title", null))
                                .summary(new I18n("summary", null))
                                .startDate(Instant.now())
                                .externalRecipients(externalRecipients)
                                .state("state1")
                                .build();

                mockServer.expect(ExpectedCount.once(),
                                requestTo(new URI(EXTERNALAPP_URL)))
                                .andExpect(method(HttpMethod.POST))
                                .andRespond(withStatus(HttpStatus.ACCEPTED));

                mockServer.expect(ExpectedCount.once(),
                                requestTo(new URI(EXTERNALAPP_URL + "/PROCESS_CARD_USER.PROCESS_CARD_USER")))
                                .andExpect(method(HttpMethod.DELETE))
                                .andRespond(withStatus(HttpStatus.ACCEPTED));

                Assertions.assertThatCode(
                                () -> cardProcessingService.processUserCard(childCard, currentUserWithPerimeters,
                                                token))
                                .doesNotThrowAnyException();
                Assertions.assertThat(checkCardPublisherId(childCard)).isTrue();
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 2)).isTrue();
        }

        @Test
        void GIVEN_an_invalid_card_WHEN_sending_card_THEN_card_is_rejected() {
                Card wrongCard = Card.builder().publisher("PUBLISHER_1")
                                .processVersion("0").processInstanceId("PROCESS_1").build();
                Assertions.assertThatThrownBy(() -> cardProcessingService.processCard(wrongCard))
                                .isInstanceOf(ConstraintViolationException.class);
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 0)).isTrue();
                Assertions.assertThat(checkArchiveCount(0)).isTrue();
        }

        @Nested
        class ChildCardDates {
                Card card;
                Card childCard;

                @BeforeEach
                void setup() {
                        card = TestHelpers.generateOneCard();
                        card.setStartDate(Instant.now().minus(1, ChronoUnit.DAYS));
                        cardProcessingService.processCard(card);

                        ArrayList<String> externalRecipients = new ArrayList<>();
                        externalRecipients.add(API_TEST_EXTERNAL_RECIPIENT_1);

                        childCard = Card.builder().publisher("newPublisherId")
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
                }

                @Test
                void GIVEN_a_parent_card_WHEN_sending_a_child_card_THEN_card_has_startDate_and_endDate_correctly_set() {
                        Assertions.assertThatCode(
                                        () -> cardProcessingService.processUserCard(childCard,
                                                        currentUserWithPerimeters,
                                                        token))
                                        .doesNotThrowAnyException();

                        Assertions.assertThat(childCard.getStartDate()).isEqualTo(card.getStartDate());
                        Assertions.assertThat(childCard.getEndDate()).isEqualTo(card.getPublishDate());
                }

                @Test
                void GIVEN_a_child_card_WHEN_updating_parent_card_with_KEEP_CHILD_CARDS_action_THEN_child_card_has_startDate_and_endDate_correctly_updated() {
                        Assertions.assertThatCode(
                                        () -> cardProcessingService.processUserCard(childCard,
                                                        currentUserWithPerimeters,
                                                        token))
                                        .doesNotThrowAnyException();
                        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 2)).isTrue();

                        card.setActions(List.of(CardActionEnum.KEEP_CHILD_CARDS));
                        card.setStartDate(Instant.now().plus(1, ChronoUnit.DAYS));
                        card.setEndDate(Instant.now().plus(5, ChronoUnit.DAYS));
                        cardProcessingService.processCard(card);

                        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 2)).isTrue();
                        Assertions.assertThat(childCard.getStartDate()).isEqualTo(card.getPublishDate());
                        Assertions.assertThat(childCard.getEndDate()).isEqualTo(card.getEndDate());
                }

                @Test
                void GIVEN_a_child_card_WHEN_updating_parent_card_with_KEEP_CHILD_CARDS_action_and_startDate_before_publishDate_THEN_child_card_has_startDate_and_endDate_correctly_updated() {
                        Assertions.assertThatCode(
                                        () -> cardProcessingService.processUserCard(childCard,
                                                        currentUserWithPerimeters,
                                                        token))
                                        .doesNotThrowAnyException();
                        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 2)).isTrue();

                        card.setActions(List.of(CardActionEnum.KEEP_CHILD_CARDS));
                        card.setStartDate(Instant.now().minus(1, ChronoUnit.DAYS));

                        cardProcessingService.processCard(card);

                        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 2)).isTrue();
                        Assertions.assertThat(childCard.getStartDate()).isEqualTo(card.getStartDate());
                        Assertions.assertThat(childCard.getEndDate()).isEqualTo(card.getPublishDate());
                }
        }

        @Test
        void GIVEN_a_card_with_forbidden_characters_in_processInstanceId_WHEN_sending_card_THEN_card_is_rejected() {
                Card card = TestHelpers.generateOneCard("entity2");
                card.setProcessInstanceId("processinstance" + "#123");

                Assertions.assertThatThrownBy(() -> cardProcessingService.processCard(card))
                                .isInstanceOf(ConstraintViolationException.class)
                                .hasMessage("constraint violation : forbidden characters ('#','?','/') in process or processInstanceId");

                card.setProcessInstanceId("processinstance" + "?123");

                Assertions.assertThatThrownBy(() -> cardProcessingService.processCard(card))
                                .isInstanceOf(ConstraintViolationException.class)
                                .hasMessage("constraint violation : forbidden characters ('#','?','/') in process or processInstanceId");

                card.setProcessInstanceId("processinstance" + "/123");

                Assertions.assertThatThrownBy(() -> cardProcessingService.processCard(card))
                                .isInstanceOf(ConstraintViolationException.class)
                                .hasMessage("constraint violation : forbidden characters ('#','?','/') in process or processInstanceId");

                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 0)).isTrue();
                Assertions.assertThat(checkArchiveCount(0)).isTrue();
        }

        @Test
        void GIVEN_a_card_with_forbidden_characters_in_process_WHEN_sending_card_THEN_card_is_rejected() {
                Card card = TestHelpers.generateOneCard("entity2");
                card.setProcess("process" + "#123");

                Assertions.assertThatThrownBy(() -> cardProcessingService.processCard(card))
                                .isInstanceOf(ConstraintViolationException.class)
                                .hasMessage("constraint violation : forbidden characters ('#','?','/') in process or processInstanceId");

                card.setProcess("process" + "?123");

                Assertions.assertThatThrownBy(() -> cardProcessingService.processCard(card))
                                .isInstanceOf(ConstraintViolationException.class)
                                .hasMessage("constraint violation : forbidden characters ('#','?','/') in process or processInstanceId");

                card.setProcess("process" + "/123");

                Assertions.assertThatThrownBy(() -> cardProcessingService.processCard(card))
                                .isInstanceOf(ConstraintViolationException.class)
                                .hasMessage("constraint violation : forbidden characters ('#','?','/') in process or processInstanceId");

                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 0)).isTrue();
                Assertions.assertThat(checkArchiveCount(0)).isTrue();
        }

        @Test
        void GIVEN_a_valid_card_WHEN_sending_card_THEN_card_is_saved_in_card_database_and_in_archives() {

                Instant start = Instant.ofEpochMilli(Instant.now().toEpochMilli()).plusSeconds(3600);

                LinkedHashMap<String, Object> data = new LinkedHashMap<>();
                data.put("int", 123);
                data.put("string", "test");
                LinkedHashMap<String, Object> subdata = new LinkedHashMap<>();
                subdata.put("int", 456);
                subdata.put("string", "test2");
                data.put("object", subdata);
                ArrayList<String> entityRecipients = new ArrayList<>();
                entityRecipients.add("Dispatcher");
                entityRecipients.add("Planner");

                List<Integer> daysOfWeek = new ArrayList<>();
                List<Integer> months = new ArrayList<>();
                daysOfWeek.add(2);
                daysOfWeek.add(3);
                months.add(2);
                months.add(3);
                Integer duration = 15;
                HoursAndMinutes hoursAndMinutes = new HoursAndMinutes(2, 10);
                Recurrence recurrence = new Recurrence("timezone", daysOfWeek,
                                hoursAndMinutes,
                                duration, months);

                HashMap<String, String> parameters = new HashMap<>();
                parameters.put("arg1", "value1");
                Card newCard = Card.builder().publisher("publisher(")
                                .processVersion("0").processInstanceId("PROCESS_1").severity(SeverityEnum.ALARM)
                                .startDate(start).title(new I18n("title", null))
                                .summary(new I18n("summary", parameters))
                                .endDate(start.plusSeconds(60)).lttd(start.minusSeconds(600))
                                .tag("tag1").tag("tag2").data(data)
                                .entityRecipients(entityRecipients)
                                .timeSpan(new TimeSpan(Instant.ofEpochMilli(123l), null, recurrence))
                                .process("process1")
                                .state("state1")
                                .publisherType(PublisherTypeEnum.EXTERNAL)
                                .representative("ENTITY1")
                                .representativeType(PublisherTypeEnum.ENTITY)
                                .wktGeometry("POINT (6.530 53.221)")
                                .wktProjection("EPSG:4326")
                                .secondsBeforeTimeSpanForReminder(Integer.valueOf(1000))
                                .build();
                cardProcessingService.processCard(newCard);
                Card persistedCard = cardRepositoryMock.findCardById(newCard.getId(), false);
                assertThat(persistedCard).isEqualTo(newCard);
                assertThat(persistedCard.getTitleTranslated()).isEqualTo("Title translated");
                assertThat(persistedCard.getSummaryTranslated()).isEqualTo("Summary translated value1");

                ArchivedCard archivedPersistedCard = cardRepositoryMock
                                .findArchivedCardByUid(newCard.getUid())
                                .get();
                assertThat(archivedPersistedCard).usingRecursiveComparison().ignoringFields("uid", "id",
                                "actions", "timeSpans", "deletionDate", "entitiesAcks").isEqualTo(newCard);
                assertThat(archivedPersistedCard.id()).isEqualTo(newCard.getUid());
                assertThat(archivedPersistedCard.titleTranslated()).isEqualTo("Title translated");
                assertThat(archivedPersistedCard.summaryTranslated()).isEqualTo("Summary translated value1");
                assertThat(eventBusSpy.getMessagesSent()).hasSize(1);
        }

        @Test
        void GIVEN_a_child_card_with_none_existent_parentCardId_WHEN_sending_card_THEN_card_is_rejected() {

                Card childCard = Card.builder()
                                .parentCardId("id_1")
                                .publisher("PUBLISHER_1").processVersion("0")
                                .process("PROCESS_1")
                                .processInstanceId("PROCESS_1").severity(SeverityEnum.ALARM)
                                .title(new I18n("title", null))
                                .summary(new I18n("summary", null))
                                .startDate(Instant.now())
                                .timeSpan(new TimeSpan(Instant.ofEpochSecond(123l), null, null))
                                .build();
                Assertions.assertThatThrownBy(
                                () -> cardProcessingService.processUserCard(childCard, currentUserWithPerimeters,
                                                token))
                                .isInstanceOf(ConstraintViolationException.class)
                                .hasMessage("The parentCardId " + childCard.getParentCardId()
                                                + " is not the id of any card");
        }

        @Test
        void GIVEN_a_child_card_with_none_existent_initialParentCardUid_WHEN_sending_card_THEN_card_is_rejected() {

                cardProcessingService.processCard(
                                Card.builder()
                                                .uid("uid_1")
                                                .publisher("PUBLISHER_1").processVersion("0")
                                                .processInstanceId("PROCESS_1").severity(SeverityEnum.ALARM)
                                                .title(new I18n("title", null))
                                                .summary(new I18n("summary", null))
                                                .startDate(Instant.now())
                                                .timeSpan(new TimeSpan(Instant.ofEpochSecond(123l), null, null))
                                                .process("process1")
                                                .state("state1")
                                                .build());

                Card childCard = Card.builder()
                                .parentCardId("process1.PROCESS_1")
                                .initialParentCardUid("initialParentCardUidNotExisting")
                                .publisher("PUBLISHER_1").processVersion("0")
                                .processInstanceId("PROCESS_1").severity(SeverityEnum.ALARM)
                                .title(new I18n("title", null))
                                .summary(new I18n("summary", null))
                                .startDate(Instant.now())
                                .timeSpan(new TimeSpan(Instant.ofEpochSecond(123l), null, null))
                                .process("process2")
                                .state("state2")
                                .build();
                Assertions.assertThatThrownBy(
                                () -> cardProcessingService.processUserCard(childCard, currentUserWithPerimeters,
                                                token))
                                .isInstanceOf(ConstraintViolationException.class)
                                .hasMessage("The initialParentCardUid " + childCard.getInitialParentCardUid()
                                                + " is not the uid of any card");

        }

        @Test
        void GIVEN_a_card_WHEN_card_is_send_with_a_login_different_than_publisher_THEN_card_is_rejected() {

                User anotherUser = new User();
                anotherUser.setLogin("wrongUser");
                anotherUser.setFirstName("Test");
                anotherUser.setLastName("User");
                CurrentUserWithPerimeters wrongUser = new CurrentUserWithPerimeters();
                wrongUser.setUserData(anotherUser);

                Card card = TestHelpers.generateOneCard(currentUserWithPerimeters.getUserData().getLogin());
                card.setPublisherType(PublisherTypeEnum.EXTERNAL);
                Optional<CurrentUserWithPerimeters> optionalWrongUser = Optional.of(wrongUser);
                Assertions.assertThatThrownBy(
                                () -> cardProcessingService.processCard(card, optionalWrongUser, token, false))
                                .isInstanceOf(ApiErrorException.class).hasMessage(
                                                "Card publisher is set to dummyUser and account login is wrongUser, the card cannot be sent");
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 0)).isTrue();
        }

        @Test
        void GIVEN_a_card_WHEN_card_is_send_with_a_login_case_different_than_publisher_THEN_card_is_accepted() {
                User anotherUser = new User();
                anotherUser.setLogin("DUMMYUSER");
                CurrentUserWithPerimeters caseDifferentUser = new CurrentUserWithPerimeters();
                caseDifferentUser.setUserData(anotherUser);

                ComputedPerimeter cp = new ComputedPerimeter();
                cp.setProcess("PROCESS_CARD_USER");
                cp.setState("state1");
                cp.setRights(RightsEnum.ReceiveAndWrite);
                List<ComputedPerimeter> list = new ArrayList<>();
                list.add(cp);
                caseDifferentUser.setComputedPerimeters(list);

                Card card = TestHelpers.generateOneCard(currentUserWithPerimeters.getUserData().getLogin());
                card.setPublisherType(PublisherTypeEnum.EXTERNAL);
                Optional<CurrentUserWithPerimeters> optionalCaseDifferentUser = Optional.of(caseDifferentUser);

                cardProcessingService.processCard(card, optionalCaseDifferentUser, token, false);
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
        }

        @Test
        void GIVEN_a_card_with_representative_dummyUser_WHEN_wrongUser_send_the_card_THEN_card_is_rejected() {

                User anotherUser = new User();
                anotherUser.setLogin("wrongUser");
                anotherUser.setFirstName("Test");
                anotherUser.setLastName("User");
                CurrentUserWithPerimeters wrongUser = new CurrentUserWithPerimeters();
                wrongUser.setUserData(anotherUser);

                Card card = TestHelpers.generateOneCard("IGNORED_PUBLISHER");
                card.setPublisherType(PublisherTypeEnum.EXTERNAL);
                card.setRepresentativeType(PublisherTypeEnum.EXTERNAL);
                card.setRepresentative(currentUserWithPerimeters.getUserData().getLogin());
                Optional<CurrentUserWithPerimeters> optionalWrongUser = Optional.of(wrongUser);
                Assertions.assertThatThrownBy(
                                () -> cardProcessingService.processCard(card, optionalWrongUser, token, false))
                                .isInstanceOf(ApiErrorException.class).hasMessage(
                                                "Card representative is set to dummyUser and account login is wrongUser, the card cannot be sent");
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 0)).isTrue();
        }

        @Test
        void GIVEN_a_card_with_representative_dummyUser_WHEN_card_is_send_with_a_login_case_different_than_representative_THEN_card_is_accepted() {

                User anotherUser = new User();
                anotherUser.setLogin("DUMMYUSER");
                CurrentUserWithPerimeters caseDifferentUser = new CurrentUserWithPerimeters();
                caseDifferentUser.setUserData(anotherUser);

                ComputedPerimeter cp = new ComputedPerimeter();
                cp.setProcess("PROCESS_CARD_USER");
                cp.setState("state1");
                cp.setRights(RightsEnum.ReceiveAndWrite);
                List<ComputedPerimeter> list = new ArrayList<>();
                list.add(cp);
                caseDifferentUser.setComputedPerimeters(list);

                Card card = TestHelpers.generateOneCard("IGNORED_PUBLISHER");
                card.setPublisherType(PublisherTypeEnum.EXTERNAL);
                card.setRepresentativeType(PublisherTypeEnum.EXTERNAL);
                card.setRepresentative(currentUserWithPerimeters.getUserData().getLogin());
                Optional<CurrentUserWithPerimeters> optionalCaseDifferentUser = Optional.of(caseDifferentUser);

                cardProcessingService.processCard(card, optionalCaseDifferentUser, token, false);
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
        }

        @Test
        void GIVEN_an_existing_card_WHEN_update_with_another_publisher_of_the_same_entity_THEN_card_is_updated() {

                Card card = TestHelpers.generateOneCard("entity2");

                List<String> entitiesAllowedToEdit = new ArrayList<>();
                entitiesAllowedToEdit.add("entityAllowed");
                card.setEntitiesAllowedToEdit(entitiesAllowedToEdit);

                currentUserWithPerimeters.getUserData().setEntities(Arrays.asList("entity2"));
                cardProcessingService.processUserCard(card, currentUserWithPerimeters, token);
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();

                Card newCard = TestHelpers.generateOneCard("newPublisherId");
                currentUserWithPerimeters.getUserData().setEntities(Arrays.asList("entity2", "newPublisherId"));

                cardProcessingService.processUserCard(newCard, currentUserWithPerimeters, token);
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
                Assertions.assertThat(cardRepositoryMock.findCardById("PROCESS_CARD_USER.PROCESS_1", false)
                                .getPublisher()).isEqualTo("newPublisherId");
        }

        @Test
        void GIVEN_an_existing_card_WHEN_update_with_another_entity_allowed_to_edit_THEN_card_is_updated() {

                Card card = TestHelpers.generateOneCard("entity2");
                List<String> entitiesAllowedToEdit = new ArrayList<>();
                entitiesAllowedToEdit.add("entityAllowed");
                card.setEntitiesAllowedToEdit(entitiesAllowedToEdit);
                cardProcessingService.processUserCard(card, currentUserWithPerimeters, token);
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();

                Card newCard = TestHelpers.generateOneCard("entityAllowed");
                currentUserWithPerimeters.getUserData().setEntities(Arrays.asList("entityAllowed"));

                cardProcessingService.processUserCard(newCard, currentUserWithPerimeters, token);
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
                Assertions.assertThat(cardRepositoryMock.findCardById("PROCESS_CARD_USER.PROCESS_1", false)
                                .getPublisher()).isEqualTo("entityAllowed");

        }

        @Test
        void GIVEN_an_existing_card_WHEN_update_with_another_entity_not_allowed_to_edit_THEN_card_is_not_updated() {

                Card card = TestHelpers.generateOneCard("entity2");
                List<String> entitiesAllowedToEdit = new ArrayList<>();
                entitiesAllowedToEdit.add("entityAllowed");
                card.setEntitiesAllowedToEdit(entitiesAllowedToEdit);
                cardProcessingService.processUserCard(card, currentUserWithPerimeters, token);
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();

                Card newCard = TestHelpers.generateOneCard("entityNotAllowed");
                currentUserWithPerimeters.getUserData().setEntities(Arrays.asList("entityNotAllowed"));

                Assertions.assertThatThrownBy(
                                () -> cardProcessingService.processUserCard(newCard, currentUserWithPerimeters, token))
                                .isInstanceOf(ApiErrorException.class)
                                .hasMessage("User is not the sender of the original card or user is not part of entities allowed to edit card. Card is rejected");
                Assertions.assertThat(cardRepositoryMock.findCardById("PROCESS_CARD_USER.PROCESS_1", false)
                                .getPublisher()).isEqualTo("entity2");
        }

        @Test
        void GIVEN_a_card_with_an_nonexistent_process__WHEN_sending_card_THEN_card_is_rejected() {
                Card card = TestHelpers.generateOneCard("entity2");
                card.setProcess("dummyProcess");
                Assertions.assertThatThrownBy(
                                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                                .isInstanceOf(ApiErrorException.class)
                                .hasMessage("Impossible to publish card because process and/or state does not exist (process=dummyProcess, state=state1, processVersion=0, processInstanceId=PROCESS_1)");

        }

        @Test
        void GIVEN_a_card_with_an_nonexistent_state_WHEN_sending_card_THEN_card_is_rejected() {
                Card card = TestHelpers.generateOneCard("entity2");
                card.setState("dummyState");
                Assertions.assertThatThrownBy(
                                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                                .isInstanceOf(ApiErrorException.class)
                                .hasMessage("Impossible to publish card because process and/or state does not exist (process=PROCESS_CARD_USER, state=dummyState, processVersion=0, processInstanceId=PROCESS_1)");

        }

        @Test
        void GIVEN_a_card_with_an_nonexistent_process_version_WHEN_sending_card_THEN_card_is_rejected() {
                Card card = TestHelpers.generateOneCard("entity2");
                card.setProcessVersion("99");
                Assertions.assertThatThrownBy(
                                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                                .isInstanceOf(ApiErrorException.class)
                                .hasMessage("Impossible to publish card because process and/or state does not exist (process=PROCESS_CARD_USER, state=state1, processVersion=99, processInstanceId=PROCESS_1)");

        }

        @Test
        void GIVEN_a_card_with_no_publisher_WHEN_sending_card_THEN_card_is_rejected() {
                Card card = TestHelpers.generateOneCard("entity2");
                card.setPublisher(null);
                Assertions.assertThatThrownBy(
                                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                                .isInstanceOf(ConstraintViolationException.class)
                                .hasMessage("Impossible to publish card because there is no publisher");

        }

        @Test
        void GIVEN_a_card_with_no_process_WHEN_sending_card_THEN_card_is_rejected() {
                Card card = TestHelpers.generateOneCard("entity2");
                card.setProcess(null);
                Assertions.assertThatThrownBy(
                                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                                .isInstanceOf(ConstraintViolationException.class)
                                .hasMessage("Impossible to publish card because there is no process");

        }

        @Test
        void GIVEN_a_card_with_no_processVersion_WHEN_sending_card_THEN_card_is_rejected() {
                Card card = TestHelpers.generateOneCard("entity2");
                card.setProcessVersion(null);
                Assertions.assertThatThrownBy(
                                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                                .isInstanceOf(ConstraintViolationException.class)
                                .hasMessage("Impossible to publish card because there is no processVersion");

        }

        @Test
        void GIVEN_a_card_with_no_state_WHEN_sending_card_THEN_card_is_rejected() {
                Card card = TestHelpers.generateOneCard("entity2");
                card.setState(null);
                Assertions.assertThatThrownBy(
                                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                                .isInstanceOf(ConstraintViolationException.class)
                                .hasMessage("Impossible to publish card because there is no state");

        }

        @Test
        void GIVEN_a_card_with_no_processInstanceId_WHEN_sending_card_THEN_card_is_rejected() {
                Card card = TestHelpers.generateOneCard("entity2");
                card.setProcessInstanceId(null);
                Assertions.assertThatThrownBy(
                                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                                .isInstanceOf(ConstraintViolationException.class)
                                .hasMessage("Impossible to publish card because there is no processInstanceId");

        }

        @Test
        void GIVEN_a_card_with_no_severity_WHEN_sending_card_THEN_card_is_rejected() {
                Card card = TestHelpers.generateOneCard("entity2");
                card.setSeverity(null);
                Assertions.assertThatThrownBy(
                                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                                .isInstanceOf(ConstraintViolationException.class)
                                .hasMessage("Impossible to publish card because there is no severity");

        }

        @Test
        void GIVEN_a_card_with_no_title_WHEN_sending_card_THEN_card_is_rejected() {
                Card card = TestHelpers.generateOneCard("entity2");
                card.setTitle(null);
                Assertions.assertThatThrownBy(
                                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                                .isInstanceOf(ConstraintViolationException.class)
                                .hasMessage("Impossible to publish card because there is no title");

        }

        @Test
        void GIVEN_a_card_with_no_summary_WHEN_sending_card_THEN_card_is_rejected() {
                Card card = TestHelpers.generateOneCard("entity2");
                card.setSummary(null);
                Assertions.assertThatThrownBy(
                                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                                .isInstanceOf(ConstraintViolationException.class)
                                .hasMessage("Impossible to publish card because there is no summary");

        }

        @Test
        void GIVEN_a_card_with_no_startDate_WHEN_sending_card_THEN_card_is_rejected() {
                Card card = TestHelpers.generateOneCard("entity2");
                card.setStartDate(null);
                Assertions.assertThatThrownBy(
                                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                                .isInstanceOf(ConstraintViolationException.class)
                                .hasMessage("Impossible to publish card because there is no startDate");

        }

        @Test
        void GIVEN_a_user_with_not_the_write_right_in_perimeter_for_state1_WHEN_sending_card_with_state1_THEN_card_is_rejected() {

                User testuser = new User();
                testuser.setLogin("dummyUser");
                CurrentUserWithPerimeters testCurrentUserWithPerimeters = new CurrentUserWithPerimeters();
                testCurrentUserWithPerimeters.setUserData(testuser);
                ComputedPerimeter c1 = new ComputedPerimeter();
                c1.setProcess("PROCESS_CARD_USER");
                c1.setState("state1");
                c1.setRights(RightsEnum.Receive);

                Card card = TestHelpers.generateOneCard("dummyUser");
                List<ComputedPerimeter> list = new ArrayList<>();
                list.add(c1);
                testCurrentUserWithPerimeters.setComputedPerimeters(list);
                Optional<CurrentUserWithPerimeters> user = Optional.of(testCurrentUserWithPerimeters);

                Assertions.assertThatThrownBy(() -> cardProcessingService.processCard(card, user, token, false))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessage("user not authorized to send card with process PROCESS_CARD_USER and state state1 as it is not permitted by his perimeters, the card is rejected");
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 0)).isTrue();

        }

        @Test
        void GIVEN_a_user_with_the_write_right_in_perimeter_for_state1_WHEN_sending_card_with_state1_THEN_card_is_accepted() {

                User testuser = new User();
                testuser.setLogin("dummyUser");
                CurrentUserWithPerimeters testCurrentUserWithPerimeters = new CurrentUserWithPerimeters();
                testCurrentUserWithPerimeters.setUserData(testuser);
                ComputedPerimeter cp = new ComputedPerimeter();
                cp.setProcess("PROCESS_CARD_USER");
                cp.setState("state1");
                cp.setRights(RightsEnum.ReceiveAndWrite);

                Card card = TestHelpers.generateOneCard("dummyUser");
                List<ComputedPerimeter> list = new ArrayList<>();
                list.add(cp);
                testCurrentUserWithPerimeters.setComputedPerimeters(list);
                Optional<CurrentUserWithPerimeters> user = Optional.of(testCurrentUserWithPerimeters);
                cardProcessingService.processCard(card, user, token, false);

                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
        }

        @Test
        void GIVEN_a_card_WHEN_reset_reads_and_acks_THEN_card_event_UPDATE_is_sent_to_eventBus() {
                Card card = TestHelpers.generateOneCard();
                cardProcessingService.processCard(card);
                cardProcessingService.resetReadAndAcks(card.getUid());
                Assertions.assertThat(eventBusSpy.getMessagesSent().get(1)[1]).contains("{\"type\":\"UPDATE\"");
        }

        @Test
        void GIVEN_an_existing_card_WHEN_update_card_CONTAINS_KEEP_EXISTING_ACKS_AND_READS_THEN_acks_and_reads_are_kept() {
                Card card = TestHelpers.generateOneCard("entity2");
                cardProcessingService.processUserCard(card, currentUserWithPerimeters, token);
                cardProcessingService.processUserRead(card.getUid(),
                                currentUserWithPerimeters.getUserData().getLogin());
                cardProcessingService.processUserRead(card.getUid(), "user2");

                List<String> entitiesAcks = List.of("entity2");
                cardProcessingService.processUserAcknowledgement(card.getUid(), currentUserWithPerimeters,
                                entitiesAcks);
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();

                Card newCard = TestHelpers.generateOneCard("entity2");
                newCard.setActions(List.of(CardActionEnum.KEEP_EXISTING_ACKS_AND_READS));
                cardProcessingService.processUserCard(newCard, currentUserWithPerimeters, token);

                Card updated = cardRepositoryMock.findCardById("PROCESS_CARD_USER.PROCESS_1", false);
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
                Assertions.assertThat(updated.getUsersReads()).isEqualTo(List.of("dummyUser", "user2"));
                Assertions.assertThat(updated.getUsersAcks()).isEqualTo(List.of("dummyUser"));
                Assertions.assertThat(updated.getEntitiesAcks()).isEqualTo(entitiesAcks);
        }

        @Test
        void GIVEN_an_existing_card_WHEN_update_card_CONTAINS_KEEP_EXISTING_PUBLISH_DATE_publishDate_is_kept() {
                Card card = TestHelpers.generateOneCard("entity2");
                cardProcessingService.processUserCard(card, currentUserWithPerimeters, token);

                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
                Card original = cardRepositoryMock.findCardById("PROCESS_CARD_USER.PROCESS_1", false);

                Card newCard = TestHelpers.generateOneCard("entity2");
                newCard.setActions(List.of(CardActionEnum.KEEP_EXISTING_PUBLISH_DATE));
                cardProcessingService.processUserCard(newCard, currentUserWithPerimeters, token);

                Card updated = cardRepositoryMock.findCardById("PROCESS_CARD_USER.PROCESS_1", false);
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
                Assertions.assertThat(updated.getUid()).isNotEqualTo(original.getUid());
                Assertions.assertThat(updated.getPublishDate()).isEqualTo(original.getPublishDate());
        }

        @Test
        void GIVEN_an_existing_card_WHEN_update_card_CONTAINS_STORE_ONLY_IN_ARCHIVES_AND_KEEP_EXISTING_PUBLISH_DATE_archived_card_publishDate_is_kept() {
                Card card = TestHelpers.generateOneCard("entity2");
                cardProcessingService.processUserCard(card, currentUserWithPerimeters, token);

                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
                Card original = cardRepositoryMock.findCardById("PROCESS_CARD_USER.PROCESS_1", false);

                Card newCard = TestHelpers.generateOneCard("entity2");
                newCard.setActions(List.of(CardActionEnum.STORE_ONLY_IN_ARCHIVES, CardActionEnum.KEEP_EXISTING_PUBLISH_DATE));
                cardProcessingService.processUserCard(newCard, currentUserWithPerimeters, token);

                Card updatedCard = cardRepositoryMock.findCardById("PROCESS_CARD_USER.PROCESS_1", false);
                Assertions.assertThat(updatedCard).isNull();
                Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 0)).isTrue();

                Optional<ArchivedCard> updatedArchivedCard = cardRepositoryMock.findArchivedCardByUid(newCard.getUid());
                Assertions.assertThat(updatedArchivedCard.get().publishDate()).isEqualTo(original.getPublishDate());
        }
}
