/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.lfenergy.operatorfabric.cards.publication.services;

import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.jeasy.random.EasyRandom;
import org.jeasy.random.EasyRandomParameters;
import org.jeasy.random.FieldPredicates;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.aop.process.mongo.models.UserActionTraceData;
import org.lfenergy.operatorfabric.cards.model.RecipientEnum;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.lfenergy.operatorfabric.cards.publication.CardPublicationApplication;
import org.lfenergy.operatorfabric.cards.publication.configuration.TestCardReceiver;
import org.lfenergy.operatorfabric.cards.publication.model.*;
import org.lfenergy.operatorfabric.cards.publication.repositories.ArchivedCardRepositoryForTest;
import org.lfenergy.operatorfabric.cards.publication.repositories.CardRepositoryForTest;
import org.lfenergy.operatorfabric.cards.publication.repositories.TraceReposioryForTest;
import org.lfenergy.operatorfabric.users.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.client.ExpectedCount;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import javax.validation.ConstraintViolationException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static java.nio.charset.Charset.forName;
import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.jeasy.random.FieldPredicates.named;
import static org.lfenergy.operatorfabric.cards.model.RecipientEnum.DEADEND;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

/**
 * <p>
 * </p>
 * Created on 30/07/18
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = CardPublicationApplication.class)
@ActiveProfiles(profiles = {"native", "test"})
@Import({RestTemplate.class})
@Slf4j
@Tag("end-to-end")
@Tag("mongo")
class CardProcessServiceShould {

    @Autowired
    private CardProcessingService cardProcessingService;

    @Autowired
    private CardRepositoryForTest cardRepository;

    @Autowired
    private TraceReposioryForTest traceRepository;

    @Autowired
    private ArchivedCardRepositoryForTest archiveRepository;

    @Autowired
    private TestCardReceiver testCardReceiver;

    @Autowired
    private CardRepositoryService cardRepositoryService;


    @Autowired
    RestTemplate restTemplate;

    private MockRestServiceServer mockServer;

    @AfterEach
    public void cleanAfter() {
        cardRepository.deleteAll().subscribe();
        archiveRepository.deleteAll().subscribe();
        testCardReceiver.clear();
    }

    @BeforeEach
    public void cleanBefore() {
        testCardReceiver.clear();
    }

        @BeforeEach
        public void init() {
                mockServer = MockRestServiceServer.createServer(restTemplate);
        }


        private User user;
        private CurrentUserWithPerimeters currentUserWithPerimeters;

    public CardProcessServiceShould() {

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
        List list=new ArrayList<ComputedPerimeter>();
        list.add(c1);
        list.add(c2);
        list.add(c3);
        currentUserWithPerimeters.setComputedPerimeters(list);
    }

    private Flux<CardPublicationData> generateCards() {
        return Flux.just(
                CardPublicationData.builder().publisher("PUBLISHER_1").processVersion("O")
                        .processInstanceId("PROCESS_1").severity(SeverityEnum.ALARM)
                        .title(I18nPublicationData.builder().key("title").build())
                        .summary(I18nPublicationData.builder().key("summary").build())
                        .startDate(Instant.now())
                        .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                        .timeSpan(TimeSpanPublicationData.builder()
                                .start(Instant.ofEpochMilli(123l)).build())
                        .process("process1")
                        .state("state1")
                        .build(),
                CardPublicationData.builder().publisher("PUBLISHER_2").processVersion("O")
                        .processInstanceId("PROCESS_1").severity(SeverityEnum.INFORMATION)
                        .title(I18nPublicationData.builder().key("title").build())
                        .summary(I18nPublicationData.builder().key("summary").build())
                        .startDate(Instant.now())
                        .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                        .process("process2")
                        .state("state2")
                        .build(),
                CardPublicationData.builder().publisher("PUBLISHER_2").processVersion("O")
                        .processInstanceId("PROCESS_2").severity(SeverityEnum.COMPLIANT)
                        .title(I18nPublicationData.builder().key("title").build())
                        .summary(I18nPublicationData.builder().key("summary").build())
                        .startDate(Instant.now())
                        .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                        .process("process3")
                        .state("state3")
                        .build(),
                CardPublicationData.builder().publisher("PUBLISHER_1").processVersion("O")
                        .processInstanceId("PROCESS_2").severity(SeverityEnum.INFORMATION)
                        .title(I18nPublicationData.builder().key("title").build())
                        .summary(I18nPublicationData.builder().key("summary").build())
                        .startDate(Instant.now())
                        .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                        .process("process4")
                        .state("state4")
                        .build(),
                CardPublicationData.builder().publisher("PUBLISHER_1").processVersion("O")
                        .processInstanceId("PROCESS_1").severity(SeverityEnum.INFORMATION)
                        .title(I18nPublicationData.builder().key("title").build())
                        .summary(I18nPublicationData.builder().key("summary").build())
                        .startDate(Instant.now())
                        .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                        .process("process5")
                        .state("state5")
                        .build());
    }

    private CardPublicationData generateWrongCardData(String publisher, String process) {
        return CardPublicationData.builder().publisher(publisher).processVersion("O").processInstanceId(process)
                .build();
    }

    @Test
    void createCards() {
        StepVerifier.create(cardProcessingService.processCards(generateCards()))
                .expectNextMatches(r -> r.getCount().equals(5)).verifyComplete();
        checkCardCount(4);
        checkArchiveCount(5);
    }

    private static final String EXTERNALAPP_URL = "http://localhost:8090/test";

    @Test
    void createUserCards() throws URISyntaxException {
        ArrayList<String> externalRecipients = new ArrayList<>();
        externalRecipients.add("api_test_externalRecipient1");

        CardPublicationData card = CardPublicationData.builder().publisher("PUBLISHER_1").processVersion("O")
                .processInstanceId("PROCESS_CARD_USER").severity(SeverityEnum.INFORMATION)
                .process("PROCESS_CARD_USER")
                .state("STATE1")
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .externalRecipients(externalRecipients)
                .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                .state("state1")
                .build();

        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXTERNALAPP_URL)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.ACCEPTED)
                );

        StepVerifier.create(cardProcessingService.processUserCards(Flux.just(card), currentUserWithPerimeters))
                .expectNextMatches(r -> r.getCount().equals(1)).verifyComplete();
        checkCardPublisherId(card);

    }


    @Test
    void childCards() throws URISyntaxException {
        EasyRandom easyRandom = instantiateRandomCardGenerator();
        int numberOfCards = 1;
        List<CardPublicationData> cards = instantiateSeveralRandomCards(easyRandom, numberOfCards);
        cards.forEach(c -> {
            c.setParentCardId(null);
            c.setInitialParentCardUid(null);
        });

        cardProcessingService.processCards(Flux.just(cards.toArray(new CardPublicationData[numberOfCards])))
                .subscribe();

        Long block = cardRepository.count().block();
        Assertions.assertThat(block).withFailMessage(
                "The number of registered cards should be '%d' but is " + "'%d' actually",
                numberOfCards, block).isEqualTo(numberOfCards);

        CardPublicationData firstCard = cards.get(0);
        String id = firstCard.getId();

        ArrayList<String> externalRecipients = new ArrayList<>();
        externalRecipients.add("api_test_externalRecipient1");

        CardPublicationData card = CardPublicationData.builder().publisher("PUBLISHER_1").processVersion("O")
                .processInstanceId("PROCESS_CARD_USER").severity(SeverityEnum.INFORMATION)
                .process("PROCESS_CARD_USER")
                .parentCardId(cards.get(0).getId())
                .initialParentCardUid(cards.get(0).getUid())
                .state("STATE1")
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .externalRecipients(externalRecipients)
                .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                .state("state1")
                .build();

        mockServer.expect(ExpectedCount.once(),
                requestTo(new URI(EXTERNALAPP_URL)))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.ACCEPTED)
                );

        StepVerifier.create(cardProcessingService.processUserCards(Flux.just(card), currentUserWithPerimeters))
                .expectNextMatches(r -> r.getCount().equals(1)).verifyComplete();
        checkCardPublisherId(card);



        Assertions.assertThat(cardRepository.count().block())
                .withFailMessage("The number of registered cards should be '%d' but is '%d' ",
                        2, block)
                .isEqualTo(2);

        cardProcessingService.deleteCard(cards.get(0).getId());

        Assertions.assertThat(cardRepository.count().block())
                .withFailMessage("The number of registered cards should be '%d' but is '%d' "
                                + "when first parent card is deleted(processInstanceId:'%s').",
                        0, block, id)
                .isEqualTo(0);
    }

    @Test
    void createCardsWithError() {
        StepVerifier.create(cardProcessingService.processCards(Flux
                .concat(Flux.just(generateWrongCardData("PUBLISHER_1", "PROCESS_1")), generateCards())))
                .expectNextMatches(r -> r.getCount().equals(0)).verifyComplete();
        checkCardCount(0);
        checkArchiveCount(0);
    }

    @Test
    void preserveData() {
        Instant start = Instant.now().plusSeconds(3600);
        LinkedHashMap data = new LinkedHashMap();
        data.put("int", 123);
        data.put("string", "test");
        LinkedHashMap subdata = new LinkedHashMap();
        subdata.put("int", 456);
        subdata.put("string", "test2");
        data.put("object", subdata);
        ArrayList<String> entityRecipients = new ArrayList<>();
        entityRecipients.add("Dispatcher");
        entityRecipients.add("Planner");

        List<Integer> daysOfWeek = new ArrayList<>();
        daysOfWeek.add(new Integer(2));
        daysOfWeek.add(new Integer(3));
        List<HoursAndMinutes> hoursAndMinutes = new ArrayList<>();
        hoursAndMinutes.add(new HoursAndMinutesPublicationData(2,10));
        hoursAndMinutes.add(new HoursAndMinutesPublicationData(8,52));
        RecurrencePublicationData recurrence = new RecurrencePublicationData("timezone",daysOfWeek,hoursAndMinutes);

        CardPublicationData newCard = CardPublicationData.builder().publisher("PUBLISHER_1")
                .processVersion("0.0.1").processInstanceId("PROCESS_1").severity(SeverityEnum.ALARM)
                .startDate(start).title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").parameter("arg1", "value1")
                        .build())
                .endDate(start.plusSeconds(60)).lttd(start.minusSeconds(600))
                .tag("tag1").tag("tag2").data(data)
                .recipient(RecipientPublicationData.builder().type(RecipientEnum.UNION)
                        .recipient(RecipientPublicationData.builder().type(RecipientEnum.USER)
                                .identity("graham").build())
                        .recipient(RecipientPublicationData.builder().type(RecipientEnum.USER)
                                .identity("eric").build())
                        .build())
                .entityRecipients(entityRecipients)
                .timeSpan(TimeSpanPublicationData.builder().start(Instant.ofEpochMilli(123l)).recurrence(recurrence).build())
                .process("process1")
                .state("state1")
                .publisherType(PublisherTypeEnum.EXTERNAL)
                .secondsBeforeTimeSpanForReminder(new Integer(1000))
                .build();
        cardProcessingService.processCards(Flux.just(newCard)).subscribe();
        CardPublicationData persistedCard = cardRepository.findById(newCard.getId()).block();
        assertThat(persistedCard).isEqualToIgnoringGivenFields(newCard);

        ArchivedCardPublicationData archivedPersistedCard = archiveRepository.findById(newCard.getUid())
                .block();
        assertThat(archivedPersistedCard).isEqualToIgnoringGivenFields(newCard, "uid", "id",
                "actions", "timeSpans");
        assertThat(archivedPersistedCard.getId()).isEqualTo(newCard.getUid());
        assertThat(testCardReceiver.getCardQueue().size()).isEqualTo(1);
    }

    private boolean checkCardCount(long expectedCount) {
        Long count = cardRepository.count().block();
        if (count == expectedCount) {
            return true;
        } else {
            log.warn("Expected card count " + expectedCount + " but was " + count);
            return false;
        }
    }

    private boolean checkCardPublisherId(CardPublicationData card) {
        if (user.getEntities().get(0).equals(card.getPublisher())) {
            return true;
        } else {
            log.warn("Expected card publisher id is " + user.getEntities().get(0) + " but it was " + card.getPublisher());
            return false;
        }
    }

    private boolean checkArchiveCount(long expectedCount) {
        Long count = archiveRepository.count().block();
        if (count == expectedCount)
            return true;
        else {
            log.warn("Expected card count " + expectedCount + " but was " + count);
            return false;
        }
    }

    @Test
    void deleteOneCard_with_it_s_Id() {

        EasyRandom easyRandom = instantiateRandomCardGenerator();
        int numberOfCards = 13;
        List<CardPublicationData> cards = instantiateSeveralRandomCards(easyRandom, numberOfCards);
        cards.forEach(c -> {
            c.setParentCardId(null);
            c.setInitialParentCardUid(null);
        });

        StepVerifier.create(cardProcessingService.processCards(Flux.just(cards.toArray(new CardPublicationData[numberOfCards]))))
                .expectNextMatches(r -> r.getCount().equals(numberOfCards)).verifyComplete();

        CardPublicationData firstCard = cards.get(0);
        String id = firstCard.getId();
        cardProcessingService.deleteCard(id);

        /* one card should be deleted(the first one) */
        int thereShouldBeOneCardLess = numberOfCards - 1;

        StepVerifier.create(cardRepository.count())
                .expectNextMatches(r -> r.intValue()==thereShouldBeOneCardLess).verifyComplete();
    }

    // FIXME unify way test cards are created throughout tests
    private List<CardPublicationData> instantiateSeveralRandomCards(EasyRandom randomGenerator, int cardNumber) {

        List<CardPublicationData> cardsList = randomGenerator.objects(CardPublicationData.class, cardNumber)
                .collect(Collectors.toList());

        // endDate must be after startDate
        if (cardsList != null) {
            for (CardPublicationData cardPublicationData : cardsList) {
                if (cardPublicationData != null) {
                    Instant startDateInstant = cardPublicationData.getStartDate();
                    if (startDateInstant != null && startDateInstant
                            .compareTo(cardPublicationData.getEndDate()) >= 0) {
                        cardPublicationData.setEndDate(startDateInstant.plusSeconds(86400));
                    }
                }
            }
        }
        return cardsList;
    }

    @NotNull
    private EasyRandom instantiateRandomCardGenerator() {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plus(1, ChronoUnit.DAYS);

        LocalTime nine = LocalTime.of(9, 0);
        LocalTime fifteen = LocalTime.of(17, 0);

        EasyRandomParameters parameters = new EasyRandomParameters().seed(5467L).objectPoolSize(100)
                .randomizationDepth(3).charset(forName("UTF-8")).timeRange(nine, fifteen)
                .dateRange(today, tomorrow).stringLengthRange(5, 50).collectionSizeRange(1, 10)
                .excludeField(named("data")).excludeField(named("parameters"))
                .excludeField(named("shardKey"))
                .randomize(named("recipient").and(FieldPredicates.ofType(Recipient.class))
                                .and(FieldPredicates.inClass(CardPublicationData.class)),
                        () -> RecipientPublicationData.builder().type(DEADEND).build())
                .scanClasspathForConcreteTypes(true).overrideDefaultInitialization(false)
                .ignoreRandomizationErrors(true);

        return new EasyRandom(parameters);
    }

    @Test
    void deleteCards_Non_existentId() {
        EasyRandom easyRandom = instantiateRandomCardGenerator();
        int numberOfCards = 13;
        List<CardPublicationData> cards = instantiateSeveralRandomCards(easyRandom, numberOfCards);
        cards.forEach(c -> {
            c.setParentCardId(null);
            c.setInitialParentCardUid(null);
        });

        cardProcessingService.processCards(Flux.just(cards.toArray(new CardPublicationData[numberOfCards])))
                .subscribe();

        Long block = cardRepository.count().block();
        Assertions.assertThat(block).withFailMessage(
                "The number of registered cards should be '%d' but is " + "'%d' actually",
                numberOfCards, block).isEqualTo(numberOfCards);

        final String id = generateIdNotInCardRepository();
        cardProcessingService.deleteCard(id);

        int expectedNumberOfCards = numberOfCards;/* no card should be deleted */

        block = cardRepository.count().block();
        Assertions.assertThat(block)
                .withFailMessage(
                        "The number of registered cards should remain '%d' but is '%d' "
                                + "when an non-existing processInstanceId('%s') is used.",
                        expectedNumberOfCards, block, id)
                .isEqualTo(expectedNumberOfCards);

    }

    private String generateIdNotInCardRepository() {
        Set<String> ids = new HashSet<>();
        cardRepository.findAll().map(card -> card.getId()).subscribe(ids::add);

        EasyRandom easyRandom = instantiateRandomCardGenerator();
        String id = easyRandom.nextObject(String.class);
        while (ids.contains(id)) {
            id = easyRandom.nextObject(String.class);
        }
        return id;
    }

    @Test
    void findCardToDelete_should_Only_return_Card_with_NullData() {
        EasyRandom easyRandom = instantiateRandomCardGenerator();
        List<CardPublicationData> card = instantiateSeveralRandomCards(easyRandom, 1);
        String fakeDataContent = easyRandom.nextObject(String.class);
        CardPublicationData publishedCard = card.get(0);
        publishedCard.setParentCardId(null);
        publishedCard.setInitialParentCardUid(null);
        publishedCard.setData(fakeDataContent);

        cardProcessingService.processCards(Flux.just(card.toArray(new CardPublicationData[1]))).subscribe();

        Long block = cardRepository.count().block();
        Assertions.assertThat(block)
                .withFailMessage("The number of registered cards should be '%d' but is '%d", 1, block)
                .isEqualTo(1);

        String computedCardId = publishedCard.getProcess() + "." + publishedCard.getProcessInstanceId();
        CardPublicationData cardToDelete = cardRepositoryService.findCardById(computedCardId);

        Assertions.assertThat(cardToDelete).isNotNull();

        Object resultingData = cardToDelete.getData();
        Assertions.assertThat(resultingData).isNotEqualTo(fakeDataContent);
        Assertions.assertThat(resultingData).isNull();

    }
        
    @Test
    void processAddUserAcknowledgement() {
        EasyRandom easyRandom = instantiateRandomCardGenerator();
        int numberOfCards = 1;
        List<CardPublicationData> cards = instantiateSeveralRandomCards(easyRandom, numberOfCards);
        cards.get(0).setUsersAcks(null);
        cards.get(0).setParentCardId(null);
        cards.get(0).setInitialParentCardUid(null);
        cardProcessingService.processCards(Flux.just(cards.toArray(new CardPublicationData[numberOfCards])))
                        .subscribe();

        Long block = cardRepository.count().block();
        Assertions.assertThat(block).withFailMessage(
                        "The number of registered cards should be '%d' but is " + "'%d' actually",
                        numberOfCards, block).isEqualTo(numberOfCards);

        CardPublicationData firstCard = cardRepository.findById(cards.get(0).getId()).block();
        Assertions.assertThat(firstCard.getUsersAcks()).as("Expecting Card doesn't contain any ack at the beginning").isNullOrEmpty();
        
        String cardUid = firstCard.getUid();
        user.setLogin("aaa");

        UserBasedOperationResult res = cardProcessingService.processUserAcknowledgement(Mono.just(cardUid), user).block();
        Assertions.assertThat(res.isCardFound() && res.getOperationDone()).as("Expecting one successful addition").isTrue();
        
        CardPublicationData cardReloaded = cardRepository.findByUid(cardUid).block();
        Assertions.assertThat(cardReloaded.getUsersAcks()).as("Expecting Card after ack processing contains exactly an ack by user aaa").containsExactly("aaa");

        user.setLogin("bbb");
        res = cardProcessingService.processUserAcknowledgement(Mono.just(cardUid), user).block();
        Assertions.assertThat(res.isCardFound() && res.getOperationDone()).as("Expecting one successful addition").isTrue();
        
        cardReloaded = cardRepository.findByUid(cardUid).block();
        Assertions.assertThat(cardReloaded.getUsersAcks()).as("Expecting Card after ack processing contains exactly two acks by users aaa and bbb").containsExactly("aaa","bbb");
        //try to insert aaa again
        user.setLogin("aaa");
        res = cardProcessingService.processUserAcknowledgement(Mono.just(cardUid), user).block();
        Assertions.assertThat(res.isCardFound() && !res.getOperationDone()).as("Expecting no addition because already done").isTrue();
        
        cardReloaded = cardRepository.findByUid(cardUid).block();
        Assertions.assertThat(cardReloaded.getUsersAcks()).as("Expecting  Card after ack processing contains exactly two acks by users aaa(only once) and bbb").containsExactly("aaa","bbb");
    }


    @Test
    void processAddTraceAcknowledgement() {
        EasyRandom easyRandom = instantiateRandomCardGenerator();
        int numberOfCards = 1;
        List<CardPublicationData> cards = instantiateSeveralRandomCards(easyRandom, numberOfCards);
        cards.get(0).setUsersAcks(null);
        cards.get(0).setParentCardId(null);
        cards.get(0).setInitialParentCardUid(null);
        cardProcessingService.processCards(Flux.just(cards.toArray(new CardPublicationData[numberOfCards])))
                .subscribe();

        Long block = cardRepository.count().block();
        Assertions.assertThat(block).withFailMessage(
                "The number of registered cards should be '%d' but is " + "'%d' actually",
                numberOfCards, block).isEqualTo(numberOfCards);

        CardPublicationData firstCard = cardRepository.findById(cards.get(0).getId()).block();
        Assertions.assertThat(firstCard.getUsersAcks()).as("Expecting Card doesn't contain any ack at the beginning").isNullOrEmpty();

        String cardUid = firstCard.getUid();
        user.setLogin("aaa");
        UserBasedOperationResult res = cardProcessingService.processUserAcknowledgement(Mono.just(cardUid), user).block();
        Assertions.assertThat(UserBasedOperationResult.cardFound().operationDone(true).equals(res));
        UserActionTraceData trace= cardProcessingService.findTraceByCardUid("aaa",cardUid).block();

        Assertions.assertThat(trace.getAction()).as("Expecting Acknowledgment trace after ack ").isEqualToIgnoringCase("Acknowledgment");
        Assertions.assertThat(trace.getUserName()).as("Expecting  Acknowledgment trace after ack with user name").isEqualTo("aaa");


    }

    @Test
    void processDeleteUserAcknowledgement() {
        EasyRandom easyRandom = instantiateRandomCardGenerator();
        int numberOfCards = 2;
        List<CardPublicationData> cards = instantiateSeveralRandomCards(easyRandom, numberOfCards);
        cards.get(0).setUsersAcks(Arrays.asList("someUser","someOtherUser"));
        cards.get(1).setUsersAcks(null);
        cards.get(0).setParentCardId(null);
        cards.get(0).setInitialParentCardUid(null);
        cards.get(1).setParentCardId(null);
        cards.get(1).setInitialParentCardUid(null);
        cardProcessingService.processCards(Flux.just(cards.toArray(new CardPublicationData[numberOfCards])))
                        .subscribe();

        Long block = cardRepository.count().block();
        Assertions.assertThat(block).withFailMessage(
                        "The number of registered cards should be '%d' but is " + "'%d' actually",
                        numberOfCards, block).isEqualTo(numberOfCards);

        CardPublicationData firstCard = cardRepository.findById(cards.get(0).getId()).block();
        Assertions.assertThat(firstCard.getUsersAcks()).as("Expecting Card contains exactly 2 user acks").hasSize(2);
        
        String cardUid = firstCard.getUid();

        UserBasedOperationResult res = cardProcessingService.deleteUserAcknowledgement(Mono.just(cardUid), "someUser").block();
        firstCard = cardRepository.findByUid(cardUid).block();
        Assertions.assertThat(firstCard.getUsersAcks()).as("Expecting Card1 doesn't contain someUser's card acknowledgement").containsExactly("someOtherUser");
        Assertions.assertThat(res.isCardFound() && res.getOperationDone()).isTrue();
        
        res = cardProcessingService.deleteUserAcknowledgement(Mono.just(cardUid), "someUser").block();
        firstCard = cardRepository.findByUid(cardUid).block();
        Assertions.assertThat(firstCard.getUsersAcks()).as("Expecting Card1 doesn't contain someUser card acknowledgement").containsExactly("someOtherUser");
        Assertions.assertThat(res.isCardFound() && !res.getOperationDone()).isTrue();
        
        CardPublicationData secondCard = cardRepository.findById(cards.get(1).getId()).block();;
        String secondCardUid = secondCard.getUid();
        res = cardProcessingService.deleteUserAcknowledgement(Mono.just(secondCardUid), "someUser").block();
        secondCard = cardRepository.findByUid(secondCardUid).block();
        Assertions.assertThat(secondCard.getUsersAcks()).as("Expecting no errors from deleting unexisting user ack from a card(card2) not having any user ack").isNullOrEmpty();
        Assertions.assertThat(res.isCardFound() && !res.getOperationDone()).isTrue();
    }

    @Test
    void processAddUserRead() {
        EasyRandom easyRandom = instantiateRandomCardGenerator();
        int numberOfCards = 1;
        List<CardPublicationData> cards = instantiateSeveralRandomCards(easyRandom, numberOfCards);
        cards.get(0).setUsersReads(null);
        cards.get(0).setParentCardId(null);
        cards.get(0).setInitialParentCardUid(null);
        cardProcessingService.processCards(Flux.just(cards.toArray(new CardPublicationData[numberOfCards])))
                        .subscribe();

        Long block = cardRepository.count().block();
        Assertions.assertThat(block).withFailMessage(
                        "The number of registered cards should be '%d' but is " + "'%d' actually",
                        numberOfCards, block).isEqualTo(numberOfCards);

        CardPublicationData firstCard = cardRepository.findById(cards.get(0).getId()).block();
        Assertions.assertThat(firstCard.getUsersReads()).as("Expecting Card doesn't contain any read at the beginning").isNullOrEmpty();

        String cardUid = firstCard.getUid();

        UserBasedOperationResult res = cardProcessingService.processUserRead(Mono.just(cardUid), "aaa").block();
        Assertions.assertThat(res.isCardFound() && res.getOperationDone()).as("Expecting one successful addition").isTrue();

        CardPublicationData cardReloaded = cardRepository.findByUid(cardUid).block();
        Assertions.assertThat(cardReloaded.getUsersReads()).as("Expecting Card after read processing contains exactly an read by user aaa").containsExactly("aaa");

        res = cardProcessingService.processUserRead(Mono.just(cardUid), "bbb").block();
        Assertions.assertThat(res.isCardFound() && res.getOperationDone()).as("Expecting one successful addition").isTrue();

        cardReloaded = cardRepository.findByUid(cardUid).block();
        Assertions.assertThat(cardReloaded.getUsersReads()).as("Expecting Card after read processing contains exactly two read by users aaa and bbb").containsExactly("aaa","bbb");
        //try to insert aaa again
        res = cardProcessingService.processUserRead(Mono.just(cardUid), "aaa").block();
        Assertions.assertThat(res.isCardFound() && !res.getOperationDone()).as("Expecting no addition because already done").isTrue();

        cardReloaded = cardRepository.findByUid(cardUid).block();
        Assertions.assertThat(cardReloaded.getUsersReads()).as("Expecting  Card after read processing contains exactly two read by users aaa(only once) and bbb").containsExactly("aaa","bbb");
    }

    @Test
    void processDeleteUserRead() {
        EasyRandom easyRandom = instantiateRandomCardGenerator();
        int numberOfCards = 2;
        List<CardPublicationData> cards = instantiateSeveralRandomCards(easyRandom, numberOfCards);
        cards.get(0).setUsersReads(Arrays.asList("someUser","someOtherUser"));
        cards.get(1).setUsersReads(null);
        cards.get(0).setParentCardId(null);
        cards.get(0).setInitialParentCardUid(null);
        cards.get(1).setParentCardId(null);
        cards.get(1).setInitialParentCardUid(null);
        cardProcessingService.processCards(Flux.just(cards.toArray(new CardPublicationData[numberOfCards])))
                        .subscribe();

        Long block = cardRepository.count().block();
        Assertions.assertThat(block).withFailMessage(
                        "The number of registered cards should be '%d' but is " + "'%d' actually",
                        numberOfCards, block).isEqualTo(numberOfCards);

        CardPublicationData firstCard = cardRepository.findById(cards.get(0).getId()).block();
        Assertions.assertThat(firstCard.getUsersReads()).as("Expecting Card contains exactly 2 user reads").hasSize(2);
        
        String cardUid = firstCard.getUid();

        UserBasedOperationResult res = cardProcessingService.deleteUserRead(Mono.just(cardUid), "someUser").block();
        firstCard = cardRepository.findByUid(cardUid).block();
        Assertions.assertThat(firstCard.getUsersReads()).as("Expecting Card1 doesn't contain someUser's card read").containsExactly("someOtherUser");
        Assertions.assertThat(res.isCardFound() && res.getOperationDone()).isTrue();
        
        res = cardProcessingService.deleteUserRead(Mono.just(cardUid), "someUser").block();
        firstCard = cardRepository.findByUid(cardUid).block();
        Assertions.assertThat(firstCard.getUsersReads()).as("Expecting Card1 doesn't contain someUser card read").containsExactly("someOtherUser");
        Assertions.assertThat(res.isCardFound() && !res.getOperationDone()).isTrue();
        
        CardPublicationData secondCard = cardRepository.findById(cards.get(1).getId()).block();;
        String secondCardUid = secondCard.getUid();
        res = cardProcessingService.deleteUserRead(Mono.just(secondCardUid), "someUser").block();
        secondCard = cardRepository.findByUid(secondCardUid).block();
        Assertions.assertThat(secondCard.getUsersReads()).as("Expecting no errors from deleting unexisting user read from a card(card2) not having any user read").isNullOrEmpty();
        Assertions.assertThat(res.isCardFound() && !res.getOperationDone()).isTrue();
    }

    @Test
    void validate_processOk() {

        StepVerifier.create(cardProcessingService.processCards(Flux.just(
                CardPublicationData.builder()
                        .uid("uid_1")
                        .publisher("PUBLISHER_1").processVersion("O")
                        .processInstanceId("PROCESS_1").severity(SeverityEnum.ALARM)
                        .title(I18nPublicationData.builder().key("title").build())
                        .summary(I18nPublicationData.builder().key("summary").build())
                        .startDate(Instant.now())
                        .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                        .timeSpan(TimeSpanPublicationData.builder()
                                .start(Instant.ofEpochMilli(123l)).build())
                        .process("process1")
                        .state("state1")
                        .build()))).expectNextMatches(r -> r.getCount().equals(1)).verifyComplete();

        CardPublicationData childCard = CardPublicationData.builder()
                .parentCardId("process1.PROCESS_1")
                .initialParentCardUid("uid_1")
                .publisher("PUBLISHER_1").processVersion("O")
                .processInstanceId("PROCESS_1").severity(SeverityEnum.ALARM)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                .timeSpan(TimeSpanPublicationData.builder()
                        .start(Instant.ofEpochMilli(123l)).build())
                .process("process2")
                .state("state2")
                .build();

        cardProcessingService.validate(childCard);
    }

    @Test
    void validate_parentCardId_NotIdPresentInDb() {

        CardPublicationData card = CardPublicationData.builder()
                .parentCardId("id_1")
                .publisher("PUBLISHER_1").processVersion("O")
                .process("PROCESS_1")
                .processInstanceId("PROCESS_1").severity(SeverityEnum.ALARM)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                .timeSpan(TimeSpanPublicationData.builder()
                        .start(Instant.ofEpochMilli(123l)).build())
                .build();
        try {
            cardProcessingService.validate(card);
        } catch (ConstraintViolationException e) {
            Assertions.assertThat(e.getMessage()).isEqualTo("The parentCardId " + card.getParentCardId() + " is not the id of any card");
        }
    }

    @Test
    void validate_initialParentCardUid_NotPresentInDb() {

        StepVerifier.create(cardProcessingService.processCards(Flux.just(
                CardPublicationData.builder()
                        .uid("uid_1")
                        .publisher("PUBLISHER_1").processVersion("O")
                        .processInstanceId("PROCESS_1").severity(SeverityEnum.ALARM)
                        .title(I18nPublicationData.builder().key("title").build())
                        .summary(I18nPublicationData.builder().key("summary").build())
                        .startDate(Instant.now())
                        .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                        .timeSpan(TimeSpanPublicationData.builder()
                                .start(Instant.ofEpochMilli(123l)).build())
                        .process("process1")
                        .state("state1")
                        .build()))).expectNextMatches(r -> r.getCount().equals(1)).verifyComplete();

        CardPublicationData childCard = CardPublicationData.builder()
                .parentCardId("process1.PROCESS_1")
                .initialParentCardUid("initialParentCardUidNotExisting")
                .publisher("PUBLISHER_1").processVersion("O")
                .processInstanceId("PROCESS_1").severity(SeverityEnum.ALARM)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                .timeSpan(TimeSpanPublicationData.builder()
                        .start(Instant.ofEpochMilli(123l)).build())
                .process("process2")
                .state("state2")
                .build();

        try {
            cardProcessingService.validate(childCard);
        } catch (ConstraintViolationException e) {
            Assertions.assertThat(e.getMessage()).isEqualTo("The initialParentCardUid " +
                    childCard.getInitialParentCardUid() + " is not the uid of any card");
        }
    }

    @Test
    void validate_noParentCardId_processOk() {

        CardPublicationData card = CardPublicationData.builder()
                .publisher("PUBLISHER_1").processVersion("O")
                .processInstanceId("PROCESS_1").severity(SeverityEnum.ALARM)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                .timeSpan(TimeSpanPublicationData.builder()
                        .start(Instant.ofEpochMilli(123l)).build())
                .process("process1")
                .state("state1")
                .build();

        cardProcessingService.validate(card);
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

        assertThat(cardProcessingService.isUserAllowedToDeleteThisCard(cardExternal1, currentUserWithPerimeters)).isFalse();
        assertThat(cardProcessingService.isUserAllowedToDeleteThisCard(cardExternal2, currentUserWithPerimeters)).isFalse();
        assertThat(cardProcessingService.isUserAllowedToDeleteThisCard(cardFromAnEntity1, currentUserWithPerimeters)).isFalse();
        assertThat(cardProcessingService.isUserAllowedToDeleteThisCard(cardFromAnEntity2, currentUserWithPerimeters)).isFalse();
        assertThat(cardProcessingService.isUserAllowedToDeleteThisCard(cardFromAnEntity3, currentUserWithPerimeters)).isFalse();
        assertThat(cardProcessingService.isUserAllowedToDeleteThisCard(cardFromAnEntity4, currentUserWithPerimeters)).isTrue();
        assertThat(cardProcessingService.isUserAllowedToDeleteThisCard(cardFromAnEntity5, currentUserWithPerimeters)).isTrue();
    }
}
