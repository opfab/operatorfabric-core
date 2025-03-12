/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
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
import org.opfab.cards.publication.model.ArchivedCard;
import org.opfab.cards.publication.model.Card;
import org.opfab.cards.publication.model.CardActionEnum;
import org.opfab.cards.publication.model.I18n;
import org.opfab.cards.publication.model.PublisherTypeEnum;
import org.opfab.cards.publication.model.SeverityEnum;
import org.opfab.cards.publication.model.TimeSpan;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.test.EventBusSpy;
import org.opfab.users.model.ComputedPerimeter;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.RightEnum;
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
class CardProcessServiceShould {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CardProcessServiceShould.class);

    private static final String API_TEST_EXTERNAL_RECIPIENT_1 = "api_test_externalRecipient1";
    private static final String EXTERNALAPP_URL = "http://localhost:8090/test";

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ExternalAppService externalAppService;

    private CardProcessingService cardProcessingService;
    private CardReadAndAckService cardReadAndAckService;
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
        cardNotificationService = new CardNotificationService(eventBusSpy, objectMapper, null);
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
        cardReadAndAckService = new CardReadAndAckService(cardNotificationService, cardRepositoryMock);
        user = TestHelpers.getCurrentUser();
        currentUserWithPerimeters = TestHelpers.getCurrentUserWithPerimeter(user);
        cardRepositoryMock.clear();
        eventBusSpy.clearMessageSent();
        mockServer = MockRestServiceServer.createServer(restTemplate);
    }

    private boolean checkCardPublisherId(Card card) {
        if (user.getEntities().contains(card.publisher)) {
            return true;
        } else {
            log.warn("Expected card publisher id is " + user.getEntities().get(0) + " but it was "
                    + card.publisher);
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

        Card patchCard = new Card();
        patchCard.severity = SeverityEnum.ALARM;
        cardProcessingService.patchCard(initialCard.id, patchCard, Optional.empty(), Optional.empty());

        Card persistedCard = cardRepositoryMock.findCardById(initialCard.id, false);
        assertThat(persistedCard.severity).isEqualTo(SeverityEnum.ALARM);
        assertThat(persistedCard.startDate).isEqualTo(initialCard.startDate);
        assertThat(persistedCard.title).isEqualTo(initialCard.title);
        assertThat(persistedCard.publisher).isEqualTo(initialCard.publisher);
        assertThat(persistedCard.process).isEqualTo(initialCard.process);
        assertThat(persistedCard.processInstanceId).isEqualTo(initialCard.processInstanceId);

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

        Card patchCard = new Card();
        patchCard.severity = SeverityEnum.ALARM;

        Assertions.assertThatThrownBy(() -> cardProcessingService.patchCard("nonexistentId",
                patchCard, emptyForUser, emptyForJwt))
                .isInstanceOf(ApiErrorException.class)
                .hasMessageContaining("Card with id nonexistentId not found");
        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
        Assertions.assertThat(checkArchiveCount(1)).isTrue();
    }

    @Test
    void GIVEN_a_publisher_WHEN_sending_a_new_card_THEN_card_event_ADD_is_sent_to_eventBus() {

        cardProcessingService.processCard(TestHelpers.generateOneCard());
        Assertions.assertThat(eventBusSpy.getMessagesSent().get(0)[1]).contains("{\"type\":\"ADD\"");
    }

    @Test
    void GIVEN_a_publisher_WHEN_sending_an_updated_card_THEN_card_event_UPDATE_is_sent_to_eventBus() {

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
    void GIVEN_a_card_with_external_recipient_WHEN_sending_the_card_THEN_card_is_sent_to_external_recipient()
            throws URISyntaxException {
        ArrayList<String> externalRecipients = new ArrayList<>();
        externalRecipients.add(API_TEST_EXTERNAL_RECIPIENT_1);
        Card card = TestHelpers.generateOneCard("newPublisherId");
        card.externalRecipients = externalRecipients;
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

        Card childCard = new Card();
        childCard.publisher = "newPublisherId";
        childCard.processVersion = "0";
        childCard.processInstanceId = "PROCESS_CARD_USER";
        childCard.severity = SeverityEnum.INFORMATION;
        childCard.process = "PROCESS_CARD_USER";
        childCard.parentCardId = card.id;
        childCard.initialParentCardUid = card.uid;
        childCard.title = new I18n("title", null);
        childCard.summary = new I18n("summary", null);
        childCard.startDate = Instant.now();
        childCard.externalRecipients = externalRecipients;
        childCard.state = "state1";

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

        Card wrongCard = new Card();
        wrongCard.publisher = "PUBLISHER_1";
        wrongCard.processVersion = "0";
        wrongCard.processInstanceId = "PROCESS_1";
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
            card.startDate = Instant.now().minus(1, ChronoUnit.DAYS);
            cardProcessingService.processCard(card);

            ArrayList<String> externalRecipients = new ArrayList<>();
            externalRecipients.add(API_TEST_EXTERNAL_RECIPIENT_1);

            childCard = new Card();
            childCard.publisher = "newPublisherId";
            childCard.processVersion = "0";
            childCard.processInstanceId = "PROCESS_CARD_USER";
            childCard.severity = SeverityEnum.INFORMATION;
            childCard.process = "PROCESS_CARD_USER";
            childCard.parentCardId = card.id;
            childCard.initialParentCardUid = card.uid;
            childCard.title = new I18n("title", null);
            childCard.summary = new I18n("summary", null);
            childCard.startDate = Instant.now();
            childCard.state = "state1";

        }

        @Test
        void GIVEN_a_parent_card_WHEN_sending_a_child_card_THEN_card_has_startDate_and_endDate_correctly_set() {
            Assertions.assertThatCode(
                    () -> cardProcessingService.processUserCard(childCard,
                            currentUserWithPerimeters,
                            token))
                    .doesNotThrowAnyException();

            Assertions.assertThat(childCard.startDate).isEqualTo(card.startDate);
            Assertions.assertThat(childCard.endDate).isEqualTo(card.publishDate);
        }

        @Test
        void GIVEN_a_child_card_WHEN_updating_parent_card_with_KEEP_CHILD_CARDS_action_THEN_child_card_has_startDate_and_endDate_correctly_updated() {
            Assertions.assertThatCode(
                    () -> cardProcessingService.processUserCard(childCard,
                            currentUserWithPerimeters,
                            token))
                    .doesNotThrowAnyException();
            Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 2)).isTrue();

            card.actions = List.of(CardActionEnum.KEEP_CHILD_CARDS);
            card.startDate = Instant.now().plus(1, ChronoUnit.DAYS);
            card.endDate = Instant.now().plus(5, ChronoUnit.DAYS);
            cardProcessingService.processCard(card);

            Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 2)).isTrue();
            Assertions.assertThat(childCard.startDate).isEqualTo(card.startDate);
            Assertions.assertThat(childCard.endDate).isEqualTo(card.endDate);
        }

    }

    @Test
    void GIVEN_a_card_with_forbidden_characters_in_processInstanceId_WHEN_sending_card_THEN_card_is_rejected() {
        Card card = TestHelpers.generateOneCard("entity2");
        card.processInstanceId = "processinstance" + "#123";

        Assertions.assertThatThrownBy(() -> cardProcessingService.processCard(card))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessage(
                        "constraint violation : forbidden characters ('#','?','/') in process or processInstanceId");

        card.processInstanceId = "processinstance" + "?123";

        Assertions.assertThatThrownBy(() -> cardProcessingService.processCard(card))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessage(
                        "constraint violation : forbidden characters ('#','?','/') in process or processInstanceId");

        card.processInstanceId = "processinstance" + "/123";

        Assertions.assertThatThrownBy(() -> cardProcessingService.processCard(card))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessage(
                        "constraint violation : forbidden characters ('#','?','/') in process or processInstanceId");

        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 0)).isTrue();
        Assertions.assertThat(checkArchiveCount(0)).isTrue();
    }

    @Test
    void GIVEN_a_card_with_forbidden_characters_in_process_WHEN_sending_card_THEN_card_is_rejected() {
        Card card = TestHelpers.generateOneCard("entity2");
        card.process = "process" + "#123";

        Assertions.assertThatThrownBy(() -> cardProcessingService.processCard(card))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessage(
                        "constraint violation : forbidden characters ('#','?','/') in process or processInstanceId");

        card.process = "process" + "?123";

        Assertions.assertThatThrownBy(() -> cardProcessingService.processCard(card))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessage(
                        "constraint violation : forbidden characters ('#','?','/') in process or processInstanceId");

        card.process = "process" + "/123";

        Assertions.assertThatThrownBy(() -> cardProcessingService.processCard(card))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessage(
                        "constraint violation : forbidden characters ('#','?','/') in process or processInstanceId");

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

        HashMap<String, String> parameters = new HashMap<>();
        parameters.put("arg1", "value1");
        Card newCard = new Card();
        newCard.publisher = "publisher(";
        newCard.processVersion = "0";
        newCard.processInstanceId = "PROCESS_1";
        newCard.severity = SeverityEnum.ALARM;
        newCard.startDate = start;
        newCard.title = new I18n("title", null);
        newCard.summary = new I18n("summary", parameters);
        newCard.endDate = start.plusSeconds(60);
        newCard.lttd = start.minusSeconds(600);
        newCard.tags = new ArrayList<>();
        newCard.tags.add("tag1");
        newCard.tags.add("tag2");
        newCard.data = data;
        newCard.entityRecipients = entityRecipients;
        newCard.timeSpans = Arrays.asList(new TimeSpan(Instant.ofEpochMilli(123L), null));
        newCard.process = "process1";
        newCard.state = "state1";
        newCard.publisherType = PublisherTypeEnum.EXTERNAL;
        newCard.representative = "ENTITY1";
        newCard.representativeType = PublisherTypeEnum.ENTITY;
        newCard.wktGeometry = "POINT (6.530 53.221)";
        newCard.wktProjection = "EPSG:4326";
        newCard.secondsBeforeTimeSpanForReminder = 1000;

        cardProcessingService.processCard(newCard);
        Card persistedCard = cardRepositoryMock.findCardById(newCard.id, false);
        assertThat(persistedCard).isEqualTo(newCard);
        assertThat(persistedCard.titleTranslated).isEqualTo("Title translated");
        assertThat(persistedCard.summaryTranslated).isEqualTo("Summary translated value1");

        ArchivedCard archivedPersistedCard = cardRepositoryMock
                .findArchivedCardByUid(newCard.uid)
                .get();
        assertThat(archivedPersistedCard).usingRecursiveComparison().ignoringFields("uid", "id",
                "actions", "timeSpans", "deletionDate", "entitiesAcks").isEqualTo(newCard);
        assertThat(archivedPersistedCard.id()).isEqualTo(newCard.uid);
        assertThat(archivedPersistedCard.titleTranslated()).isEqualTo("Title translated");
        assertThat(archivedPersistedCard.summaryTranslated()).isEqualTo("Summary translated value1");
        assertThat(eventBusSpy.getMessagesSent()).hasSize(1);
    }

    @Test
    void GIVEN_a_child_card_with_none_existent_parentCardId_WHEN_sending_card_THEN_card_is_rejected() {

        Card childCard = new Card();
        childCard.parentCardId = "id_1";
        childCard.publisher = "PUBLISHER_1";
        childCard.processVersion = "0";
        childCard.process = "PROCESS_1";
        childCard.processInstanceId = "PROCESS_1";
        childCard.severity = SeverityEnum.ALARM;
        childCard.title = new I18n("title", null);
        childCard.summary = new I18n("summary", null);
        childCard.startDate = Instant.now();
        childCard.timeSpans = Arrays.asList(new TimeSpan(Instant.ofEpochSecond(123l), null));

        Assertions.assertThatThrownBy(
                () -> cardProcessingService.processUserCard(childCard, currentUserWithPerimeters,
                        token))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessage("The parentCardId " + childCard.parentCardId
                        + " is not the id of any card");
    }

    @Test
    void GIVEN_a_child_card_with_none_existent_initialParentCardUid_WHEN_sending_card_THEN_card_is_rejected() {

        Card card = new Card();
        card.uid = "uid_1";
        card.publisher = "PUBLISHER_1";
        card.processVersion = "0";
        card.process = "process1";
        card.processInstanceId = "PROCESS_1";
        card.severity = SeverityEnum.ALARM;
        card.title = new I18n("title", null);
        card.summary = new I18n("summary", null);
        card.startDate = Instant.now();
        card.timeSpans = Arrays.asList(new TimeSpan(Instant.ofEpochSecond(123l), null));
        card.state = "state1";

        cardProcessingService.processCard(card);

        Card childCard = new Card();
        childCard.parentCardId = "process1.PROCESS_1";
        childCard.initialParentCardUid = "initialParentCardUidNotExisting";
        childCard.publisher = "PUBLISHER_1";
        childCard.processVersion = "0";
        childCard.process = "process2";
        childCard.processInstanceId = "PROCESS_1";
        childCard.severity = SeverityEnum.ALARM;
        childCard.title = new I18n("title", null);
        childCard.summary = new I18n("summary", null);
        childCard.startDate = Instant.now();
        childCard.timeSpans = Arrays.asList(new TimeSpan(Instant.ofEpochSecond(123l), null));
        childCard.state = "state2";
        Assertions.assertThatThrownBy(
                () -> cardProcessingService.processUserCard(childCard, currentUserWithPerimeters,
                        token))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessage("The initialParentCardUid " + childCard.initialParentCardUid
                        + " is not the uid of any card");

    }

    @Test
    void GIVEN_a_card_WHEN_card_is_sent_with_a_login_different_than_publisher_THEN_card_is_rejected() {

        User anotherUser = new User();
        anotherUser.setLogin("wrongUser");
        anotherUser.setFirstName("Test");
        anotherUser.setLastName("User");
        CurrentUserWithPerimeters wrongUser = new CurrentUserWithPerimeters();
        wrongUser.setUserData(anotherUser);

        Card card = TestHelpers.generateOneCard(currentUserWithPerimeters.getUserData().getLogin());
        card.publisherType = PublisherTypeEnum.EXTERNAL;
        Optional<CurrentUserWithPerimeters> optionalWrongUser = Optional.of(wrongUser);
        Assertions.assertThatThrownBy(
                () -> cardProcessingService.processCard(card, optionalWrongUser, token, false))
                .isInstanceOf(ApiErrorException.class).hasMessage(
                        "Card publisher is set to dummyUser and account login is wrongUser, the card cannot be sent");
        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 0)).isTrue();
    }

    @Test
    void GIVEN_a_card_WHEN_card_is_sent_with_a_login_case_different_than_publisher_THEN_card_is_accepted() {
        User anotherUser = new User();
        anotherUser.setLogin("DUMMYUSER");
        CurrentUserWithPerimeters caseDifferentUser = new CurrentUserWithPerimeters();
        caseDifferentUser.setUserData(anotherUser);

        ComputedPerimeter cp = new ComputedPerimeter();
        cp.setProcess("PROCESS_CARD_USER");
        cp.setState("state1");
        cp.setRights(RightEnum.ReceiveAndWrite);
        List<ComputedPerimeter> list = new ArrayList<>();
        list.add(cp);
        caseDifferentUser.setComputedPerimeters(list);

        Card card = TestHelpers.generateOneCard(currentUserWithPerimeters.getUserData().getLogin());
        card.publisherType = PublisherTypeEnum.EXTERNAL;
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
        card.publisherType = PublisherTypeEnum.EXTERNAL;
        card.representativeType = PublisherTypeEnum.EXTERNAL;
        card.representative = currentUserWithPerimeters.getUserData().getLogin();
        Optional<CurrentUserWithPerimeters> optionalWrongUser = Optional.of(wrongUser);
        Assertions.assertThatThrownBy(
                () -> cardProcessingService.processCard(card, optionalWrongUser, token, false))
                .isInstanceOf(ApiErrorException.class).hasMessage(
                        "Card representative is set to dummyUser and account login is wrongUser, the card cannot be sent");
        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 0)).isTrue();
    }

    @Test
    void GIVEN_a_card_with_representative_dummyUser_WHEN_card_is_sent_with_a_login_case_different_than_representative_THEN_card_is_accepted() {

        User anotherUser = new User();
        anotherUser.setLogin("DUMMYUSER");
        CurrentUserWithPerimeters caseDifferentUser = new CurrentUserWithPerimeters();
        caseDifferentUser.setUserData(anotherUser);

        ComputedPerimeter cp = new ComputedPerimeter();
        cp.setProcess("PROCESS_CARD_USER");
        cp.setState("state1");
        cp.setRights(RightEnum.ReceiveAndWrite);
        List<ComputedPerimeter> list = new ArrayList<>();
        list.add(cp);
        caseDifferentUser.setComputedPerimeters(list);

        Card card = TestHelpers.generateOneCard("IGNORED_PUBLISHER");
        card.publisherType = PublisherTypeEnum.EXTERNAL;
        card.representativeType = PublisherTypeEnum.EXTERNAL;
        card.representative = currentUserWithPerimeters.getUserData().getLogin();
        Optional<CurrentUserWithPerimeters> optionalCaseDifferentUser = Optional.of(caseDifferentUser);

        cardProcessingService.processCard(card, optionalCaseDifferentUser, token, false);
        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
    }

    @Test
    void GIVEN_an_existing_card_WHEN_update_with_another_publisher_of_the_same_entity_THEN_card_is_updated() {

        Card card = TestHelpers.generateOneCard("entity2");

        List<String> entitiesAllowedToEdit = new ArrayList<>();
        entitiesAllowedToEdit.add("entityAllowed");
        card.entitiesAllowedToEdit = entitiesAllowedToEdit;

        currentUserWithPerimeters.getUserData().setEntities(Arrays.asList("entity2"));
        cardProcessingService.processUserCard(card, currentUserWithPerimeters, token);
        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();

        Card newCard = TestHelpers.generateOneCard("newPublisherId");
        currentUserWithPerimeters.getUserData().setEntities(Arrays.asList("entity2", "newPublisherId"));

        cardProcessingService.processUserCard(newCard, currentUserWithPerimeters, token);
        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
        Assertions.assertThat(cardRepositoryMock.findCardById("PROCESS_CARD_USER.PROCESS_1", false).publisher)
                .isEqualTo("newPublisherId");
    }

    @Test
    void GIVEN_an_existing_card_WHEN_update_with_another_entity_allowed_to_edit_THEN_card_is_updated() {

        Card card = TestHelpers.generateOneCard("entity2");
        List<String> entitiesAllowedToEdit = new ArrayList<>();
        entitiesAllowedToEdit.add("entityAllowed");
        card.entitiesAllowedToEdit = entitiesAllowedToEdit;
        cardProcessingService.processUserCard(card, currentUserWithPerimeters, token);
        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();

        Card newCard = TestHelpers.generateOneCard("entityAllowed");
        currentUserWithPerimeters.getUserData().setEntities(Arrays.asList("entityAllowed"));

        cardProcessingService.processUserCard(newCard, currentUserWithPerimeters, token);
        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
        Assertions.assertThat(cardRepositoryMock.findCardById("PROCESS_CARD_USER.PROCESS_1", false).publisher)
                .isEqualTo("entityAllowed");

    }

    @Test
    void GIVEN_an_existing_card_WHEN_update_with_another_entity_not_allowed_to_edit_THEN_card_is_not_updated() {

        Card card = TestHelpers.generateOneCard("entity2");
        List<String> entitiesAllowedToEdit = new ArrayList<>();
        entitiesAllowedToEdit.add("entityAllowed");
        card.entitiesAllowedToEdit = entitiesAllowedToEdit;
        cardProcessingService.processUserCard(card, currentUserWithPerimeters, token);
        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();

        Card newCard = TestHelpers.generateOneCard("entityNotAllowed");
        currentUserWithPerimeters.getUserData().setEntities(Arrays.asList("entityNotAllowed"));

        Assertions.assertThatThrownBy(
                () -> cardProcessingService.processUserCard(newCard, currentUserWithPerimeters, token))
                .isInstanceOf(ApiErrorException.class)
                .hasMessage(
                        "User is not the sender of the original card or user is not part of entities allowed to edit card. Card is rejected");
        Assertions.assertThat(cardRepositoryMock.findCardById("PROCESS_CARD_USER.PROCESS_1", false).publisher)
                .isEqualTo("entity2");
    }

    @Test
    void GIVEN_a_card_with_an_nonexistent_process__WHEN_sending_card_THEN_card_is_rejected() {
        Card card = TestHelpers.generateOneCard("entity2");
        card.process = "dummyProcess";
        Assertions.assertThatThrownBy(
                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                .isInstanceOf(ApiErrorException.class)
                .hasMessage(
                        "Impossible to publish card because process and/or state does not exist (process=dummyProcess, state=state1, processVersion=0, processInstanceId=PROCESS_1)");

    }

    @Test
    void GIVEN_a_card_with_an_nonexistent_state_WHEN_sending_card_THEN_card_is_rejected() {
        Card card = TestHelpers.generateOneCard("entity2");
        card.state = "dummyState";
        Assertions.assertThatThrownBy(
                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                .isInstanceOf(ApiErrorException.class)
                .hasMessage(
                        "Impossible to publish card because process and/or state does not exist (process=PROCESS_CARD_USER, state=dummyState, processVersion=0, processInstanceId=PROCESS_1)");

    }

    @Test
    void GIVEN_a_card_with_an_nonexistent_process_version_WHEN_sending_card_THEN_card_is_rejected() {
        Card card = TestHelpers.generateOneCard("entity2");
        card.processVersion = "99";
        Assertions.assertThatThrownBy(
                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                .isInstanceOf(ApiErrorException.class)
                .hasMessage(
                        "Impossible to publish card because process and/or state does not exist (process=PROCESS_CARD_USER, state=state1, processVersion=99, processInstanceId=PROCESS_1)");

    }

    @Test
    void GIVEN_a_card_with_no_publisher_WHEN_sending_card_THEN_card_is_rejected() {
        Card card = TestHelpers.generateOneCard("entity2");
        card.publisher = null;
        Assertions.assertThatThrownBy(
                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessage("Impossible to publish card because there is no publisher");

    }

    @Test
    void GIVEN_a_card_with_no_process_WHEN_sending_card_THEN_card_is_rejected() {
        Card card = TestHelpers.generateOneCard("entity2");
        card.process = null;
        Assertions.assertThatThrownBy(
                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessage("Impossible to publish card because there is no process");

    }

    @Test
    void GIVEN_a_card_with_no_processVersion_WHEN_sending_card_THEN_card_is_rejected() {
        Card card = TestHelpers.generateOneCard("entity2");
        card.processVersion = null;
        Assertions.assertThatThrownBy(
                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessage("Impossible to publish card because there is no processVersion");

    }

    @Test
    void GIVEN_a_card_with_no_state_WHEN_sending_card_THEN_card_is_rejected() {
        Card card = TestHelpers.generateOneCard("entity2");
        card.state = null;
        Assertions.assertThatThrownBy(
                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessage("Impossible to publish card because there is no state");

    }

    @Test
    void GIVEN_a_card_with_no_processInstanceId_WHEN_sending_card_THEN_card_is_rejected() {
        Card card = TestHelpers.generateOneCard("entity2");
        card.processInstanceId = null;
        Assertions.assertThatThrownBy(
                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessage("Impossible to publish card because there is no processInstanceId");

    }

    @Test
    void GIVEN_a_card_with_no_severity_WHEN_sending_card_THEN_card_is_rejected() {
        Card card = TestHelpers.generateOneCard("entity2");
        card.severity = null;
        Assertions.assertThatThrownBy(
                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessage("Impossible to publish card because there is no severity");

    }

    @Test
    void GIVEN_a_card_with_no_title_WHEN_sending_card_THEN_card_is_rejected() {
        Card card = TestHelpers.generateOneCard("entity2");
        card.title = null;
        Assertions.assertThatThrownBy(
                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessage("Impossible to publish card because there is no title");

    }

    @Test
    void GIVEN_a_card_with_no_summary_WHEN_sending_card_THEN_card_is_rejected() {
        Card card = TestHelpers.generateOneCard("entity2");
        card.summary = null;
        Assertions.assertThatThrownBy(
                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                .isInstanceOf(ConstraintViolationException.class)
                .hasMessage("Impossible to publish card because there is no summary");

    }

    @Test
    void GIVEN_a_card_with_no_startDate_WHEN_sending_card_THEN_card_is_rejected() {
        Card card = TestHelpers.generateOneCard("entity2");
        card.startDate = null;
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
        c1.setRights(RightEnum.Receive);

        Card card = TestHelpers.generateOneCard("dummyUser");
        List<ComputedPerimeter> list = new ArrayList<>();
        list.add(c1);
        testCurrentUserWithPerimeters.setComputedPerimeters(list);
        Optional<CurrentUserWithPerimeters> user = Optional.of(testCurrentUserWithPerimeters);

        Assertions.assertThatThrownBy(() -> cardProcessingService.processCard(card, user, token, false))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage(
                        "user not authorized to send card with process PROCESS_CARD_USER and state state1 as it is not permitted by his perimeters, the card is rejected");
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
        cp.setRights(RightEnum.ReceiveAndWrite);

        Card card = TestHelpers.generateOneCard("dummyUser");
        List<ComputedPerimeter> list = new ArrayList<>();
        list.add(cp);
        testCurrentUserWithPerimeters.setComputedPerimeters(list);
        Optional<CurrentUserWithPerimeters> user = Optional.of(testCurrentUserWithPerimeters);
        cardProcessingService.processCard(card, user, token, false);

        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
    }

    @Test
    void GIVEN_an_existing_card_WHEN_update_card_CONTAINS_KEEP_EXISTING_ACKS_AND_READS_THEN_acks_and_reads_are_kept() {
        Card card = TestHelpers.generateOneCard("entity2");
        cardProcessingService.processUserCard(card, currentUserWithPerimeters, token);
        cardReadAndAckService.processUserRead(card.uid,
                currentUserWithPerimeters.getUserData().getLogin());
        cardReadAndAckService.processUserRead(card.uid, "user2");

        List<String> entitiesAcks = List.of("entity2");
        cardReadAndAckService.processUserAcknowledgement(card.uid, currentUserWithPerimeters,
                entitiesAcks);
        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();

        Card newCard = TestHelpers.generateOneCard("entity2");
        newCard.actions = List.of(CardActionEnum.KEEP_EXISTING_ACKS_AND_READS);
        cardProcessingService.processUserCard(newCard, currentUserWithPerimeters, token);

        Card updated = cardRepositoryMock.findCardById("PROCESS_CARD_USER.PROCESS_1", false);
        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
        Assertions.assertThat(updated.usersReads).isEqualTo(List.of("dummyUser", "user2"));
        Assertions.assertThat(updated.usersAcks).isEqualTo(List.of("dummyUser"));
        Assertions.assertThat(updated.entitiesAcks).isEqualTo(entitiesAcks);
    }

    @Test
    void GIVEN_an_existing_card_WHEN_update_card_CONTAINS_KEEP_EXISTING_PUBLISH_DATE_publishDate_is_kept() {
        Card card = TestHelpers.generateOneCard("entity2");
        cardProcessingService.processUserCard(card, currentUserWithPerimeters, token);

        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
        Card original = cardRepositoryMock.findCardById("PROCESS_CARD_USER.PROCESS_1", false);

        Card newCard = TestHelpers.generateOneCard("entity2");
        newCard.actions = List.of(CardActionEnum.KEEP_EXISTING_PUBLISH_DATE);
        cardProcessingService.processUserCard(newCard, currentUserWithPerimeters, token);

        Card updated = cardRepositoryMock.findCardById("PROCESS_CARD_USER.PROCESS_1", false);
        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
        Assertions.assertThat(updated.uid).isNotEqualTo(original.uid);
        Assertions.assertThat(updated.publishDate).isEqualTo(original.publishDate);
    }

    @Test
    void GIVEN_an_existing_card_WHEN_update_card_CONTAINS_STORE_ONLY_IN_ARCHIVES_AND_KEEP_EXISTING_PUBLISH_DATE_archived_card_publishDate_is_kept() {
        Card card = TestHelpers.generateOneCard("entity2");
        cardProcessingService.processUserCard(card, currentUserWithPerimeters, token);

        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
        Card original = cardRepositoryMock.findCardById("PROCESS_CARD_USER.PROCESS_1", false);

        Card newCard = TestHelpers.generateOneCard("entity2");
        newCard.actions = List.of(CardActionEnum.STORE_ONLY_IN_ARCHIVES, CardActionEnum.KEEP_EXISTING_PUBLISH_DATE);
        cardProcessingService.processUserCard(newCard, currentUserWithPerimeters, token);

        Card updatedCard = cardRepositoryMock.findCardById("PROCESS_CARD_USER.PROCESS_1", false);
        Assertions.assertThat(updatedCard).isNull();
        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 0)).isTrue();

        Optional<ArchivedCard> updatedArchivedCard = cardRepositoryMock.findArchivedCardByUid(newCard.uid);
        Assertions.assertThat(updatedArchivedCard.get().publishDate()).isEqualTo(original.publishDate);
    }

    @Test
    void GIVEN_a_card_with_publisherType_is_user_and_publisher_is_the_user_WHEN_sending_card_THEN_card_is_sent() {
        Card card = TestHelpers.generateOneCard(currentUserWithPerimeters.getUserData().getLogin());
        card.publisherType = PublisherTypeEnum.USER;

        cardProcessingService.processCard(card, Optional.of(currentUserWithPerimeters), token, false);
        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 1)).isTrue();
        Assertions.assertThat(checkArchiveCount(1)).isTrue();
    }

    @Test
    void GIVEN_a_card_with_publisherType_is_user_and_publisher_is_another_user_WHEN_sending_card_THEN_card_is_rejected() {
        Card card = TestHelpers.generateOneCard("anotherUser");
        card.publisherType = PublisherTypeEnum.USER;
        Optional<CurrentUserWithPerimeters> optionalUser = Optional.of(currentUserWithPerimeters);

        Assertions.assertThatThrownBy(
                () -> cardProcessingService.processCard(card, optionalUser,
                        token, false))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Publisher is not valid, the card is rejected");
        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 0)).isTrue();
        Assertions.assertThat(checkArchiveCount(0)).isTrue();
    }

    @Test
    void GIVEN_a_card_with_publisherType_is_user_and_publisher_is_a_user_entity_WHEN_sending_card_THEN_card_is_rejected() {
        Card card = TestHelpers.generateOneCard("entity2");
        card.publisherType = PublisherTypeEnum.USER;
        Optional<CurrentUserWithPerimeters> optionalUser = Optional.of(currentUserWithPerimeters);

        Assertions.assertThatThrownBy(
                () -> cardProcessingService.processCard(card, optionalUser,
                        token, false))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Publisher is not valid, the card is rejected");
        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 0)).isTrue();
        Assertions.assertThat(checkArchiveCount(0)).isTrue();
    }

    @Test
    void GIVEN_a_card_with_publisherType_is_entity_and_wrong_publisher_WHEN_sending_card_THEN_card_is_rejected() {

        Card card = TestHelpers.generateOneCard("PUBLISHER_X");
        card.publisherType = PublisherTypeEnum.ENTITY;
        Assertions.assertThatThrownBy(
                () -> cardProcessingService.processUserCard(card, currentUserWithPerimeters, token))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Publisher is not valid, the card is rejected");
        Assertions.assertThat(TestHelpers.checkCardCount(cardRepositoryMock, 0)).isTrue();
        Assertions.assertThat(checkArchiveCount(0)).isTrue();
    }
}
