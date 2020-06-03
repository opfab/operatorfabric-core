/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
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
import org.lfenergy.operatorfabric.cards.model.RecipientEnum;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.lfenergy.operatorfabric.cards.publication.CardPublicationApplication;
import org.lfenergy.operatorfabric.cards.publication.configuration.TestCardReceiver;
import org.lfenergy.operatorfabric.cards.publication.model.*;
import org.lfenergy.operatorfabric.cards.publication.repositories.ArchivedCardRepositoryForTest;
import org.lfenergy.operatorfabric.cards.publication.repositories.CardRepositoryForTest;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

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

/**
 * <p>
 * </p>
 * Created on 30/07/18
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = CardPublicationApplication.class)
@ActiveProfiles(profiles = { "native", "test" })
@Slf4j
@Tag("end-to-end")
@Tag("mongo")
class CardProcessServiceShould {

        @Autowired
        private CardProcessingService cardProcessingService;

        @Autowired
        private CardRepositoryForTest cardRepository;

        @Autowired
        private ArchivedCardRepositoryForTest archiveRepository;

        @Autowired
        private TestCardReceiver testCardReceiver;

        @Autowired
        private CardRepositoryService cardRepositoryService;

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

        private User user;


        public  CardProcessServiceShould(){
                user = new User();
                user.setLogin("ret-operator");
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
        }

        private Flux<CardPublicationData> generateCards() {
                return Flux.just(
                                CardPublicationData.builder().publisher("PUBLISHER_1").publisherVersion("O")
                                                .processId("PROCESS_1").severity(SeverityEnum.ALARM)
                                                .title(I18nPublicationData.builder().key("title").build())
                                                .summary(I18nPublicationData.builder().key("summary").build())
                                                .startDate(Instant.now())
                                                .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                                                .timeSpan(TimeSpanPublicationData.builder()
                                                                .start(Instant.ofEpochMilli(123l)).build())
                                                .build(),
                                CardPublicationData.builder().publisher("PUBLISHER_2").publisherVersion("O")
                                                .processId("PROCESS_1").severity(SeverityEnum.INFORMATION)
                                                .title(I18nPublicationData.builder().key("title").build())
                                                .summary(I18nPublicationData.builder().key("summary").build())
                                                .startDate(Instant.now())
                                                .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                                                .build(),
                                CardPublicationData.builder().publisher("PUBLISHER_2").publisherVersion("O")
                                                .processId("PROCESS_2").severity(SeverityEnum.COMPLIANT)
                                                .title(I18nPublicationData.builder().key("title").build())
                                                .summary(I18nPublicationData.builder().key("summary").build())
                                                .startDate(Instant.now())
                                                .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                                                .build(),
                                CardPublicationData.builder().publisher("PUBLISHER_1").publisherVersion("O")
                                                .processId("PROCESS_2").severity(SeverityEnum.INFORMATION)
                                                .title(I18nPublicationData.builder().key("title").build())
                                                .summary(I18nPublicationData.builder().key("summary").build())
                                                .startDate(Instant.now())
                                                .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                                                .build(),
                                CardPublicationData.builder().publisher("PUBLISHER_1").publisherVersion("O")
                                                .processId("PROCESS_1").severity(SeverityEnum.INFORMATION)
                                                .title(I18nPublicationData.builder().key("title").build())
                                                .summary(I18nPublicationData.builder().key("summary").build())
                                                .startDate(Instant.now())
                                                .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                                                .build());
        }

        private CardPublicationData generateCardData(String publisher, String process) {
                return CardPublicationData.builder().publisher(publisher).publisherVersion("O").processId(process)
                                .severity(SeverityEnum.INFORMATION)
                                .title(I18nPublicationData.builder().key("title").build())
                                .summary(I18nPublicationData.builder().key("summary").build()).startDate(Instant.now())
                                .recipient(RecipientPublicationData.builder().type(DEADEND).build()).build();
        }

        private CardPublicationData generateWrongCardData(String publisher, String process) {
                return CardPublicationData.builder().publisher(publisher).publisherVersion("O").processId(process)
                                .build();
        }

        @Test
        void createCards() {
                StepVerifier.create(cardProcessingService.processCards(generateCards()))
                                .expectNextMatches(r -> r.getCount().equals(5)).verifyComplete();
                checkCardCount(4);
                checkArchiveCount(5);
        }

        @Test
        void createUserCards() {
                CardPublicationData card=CardPublicationData.builder().publisher("PUBLISHER_1").publisherVersion("O")
                        .processId("PROCESS_CARD_USER").severity(SeverityEnum.INFORMATION)
                        .title(I18nPublicationData.builder().key("title").build())
                        .summary(I18nPublicationData.builder().key("summary").build())
                        .startDate(Instant.now())
                        .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                        .build();
                StepVerifier.create(cardProcessingService.processUserCards(Flux.just(card),user))
                        .expectNextMatches(r -> r.getCount().equals(1)).verifyComplete();
                checkCardPublisherId(card);
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
                entityRecipients.add("TSO1");
                entityRecipients.add("TSO2");
                CardPublicationData newCard = CardPublicationData.builder().publisher("PUBLISHER_1")
                                .publisherVersion("0.0.1").processId("PROCESS_1").severity(SeverityEnum.ALARM)
                                .startDate(start).title(I18nPublicationData.builder().key("title").build())
                                .summary(I18nPublicationData.builder().key("summary").parameter("arg1", "value1")
                                                .build())
                                .endDate(start.plusSeconds(60)).lttd(start.minusSeconds(600))
                                .deletionDate(start.plusSeconds(3600)).tag("tag1").tag("tag2").data(data)
                                .recipient(RecipientPublicationData.builder().type(RecipientEnum.UNION)
                                                .recipient(RecipientPublicationData.builder().type(RecipientEnum.USER)
                                                                .identity("graham").build())
                                                .recipient(RecipientPublicationData.builder().type(RecipientEnum.USER)
                                                                .identity("eric").build())
                                                .build())
                                .entityRecipients(entityRecipients)
                                .timeSpan(TimeSpanPublicationData.builder().start(Instant.ofEpochMilli(123l)).build())
                                .build();
                cardProcessingService.processCards(Flux.just(newCard)).subscribe();
                await().atMost(5, TimeUnit.SECONDS).until(() -> !newCard.getOrphanedUsers().isEmpty());
                await().atMost(5, TimeUnit.SECONDS).until(() -> testCardReceiver.getEricQueue().size() >= 1);
                CardPublicationData persistedCard = cardRepository.findById(newCard.getId()).block();
                assertThat(persistedCard).isEqualToIgnoringGivenFields(newCard, "orphanedUsers");

                ArchivedCardPublicationData archivedPersistedCard = archiveRepository.findById(newCard.getUid())
                                .block();
                assertThat(archivedPersistedCard).isEqualToIgnoringGivenFields(newCard, "uid", "id", "deletionDate",
                                "actions", "timeSpans");
                assertThat(archivedPersistedCard.getId()).isEqualTo(newCard.getUid());
                assertThat(testCardReceiver.getEricQueue().size()).isEqualTo(1);
                assertThat(testCardReceiver.getGroupQueue().size()).isEqualTo(1);
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

                CardPublicationData c = cardRepository.findByProcessId(card.getProcessId()).block();
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
        void deleteOneCard_with_it_s_ProcessId() {

                EasyRandom easyRandom = instantiateRandomCardGenerator();
                int numberOfCards = 13;
                List<CardPublicationData> cards = instantiateSeveralRandomCards(easyRandom, numberOfCards);

                cardProcessingService.processCards(Flux.just(cards.toArray(new CardPublicationData[numberOfCards])))
                                .subscribe();

                Long block = cardRepository.count().block();
                Assertions.assertThat(block).withFailMessage(
                                "The number of registered cards should be '%d' but is " + "'%d' actually",
                                numberOfCards, block).isEqualTo(numberOfCards);
       
                CardPublicationData firstCard = cards.get(0);
                String processId = firstCard.getId();
                ;
                cardProcessingService.deleteCard(processId);

                /* one card should be deleted(the first one) */
                int thereShouldBeOneCardLess = numberOfCards - 1;

                Assertions.assertThat(cardRepository.count().block())
                                        .withFailMessage("The number of registered cards should be '%d' but is '%d' "
                                                        + "when first added card is deleted(processId:'%s').",
                                                        thereShouldBeOneCardLess, block, processId)
                                        .isEqualTo(thereShouldBeOneCardLess);
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
        void deleteCards_Non_existentProcessId() {
                EasyRandom easyRandom = instantiateRandomCardGenerator();
                int numberOfCards = 13;
                List<CardPublicationData> cards = instantiateSeveralRandomCards(easyRandom, numberOfCards);

                cardProcessingService.processCards(Flux.just(cards.toArray(new CardPublicationData[numberOfCards])))
                                .subscribe();

                Long block = cardRepository.count().block();
                Assertions.assertThat(block).withFailMessage(
                                "The number of registered cards should be '%d' but is " + "'%d' actually",
                                numberOfCards, block).isEqualTo(numberOfCards);

                final String processId = generateIdNotInCardRepository();
                cardProcessingService.deleteCard(processId);

                int expectedNumberOfCards = numberOfCards;/* no card should be deleted */

                block = cardRepository.count().block();
                Assertions.assertThat(block)
                                .withFailMessage(
                                                "The number of registered cards should remain '%d' but is '%d' "
                                                                + "when an non-existing processId('%s') is used.",
                                                expectedNumberOfCards, block, processId)
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
                publishedCard.setData(fakeDataContent);

                cardProcessingService.processCards(Flux.just(card.toArray(new CardPublicationData[1]))).subscribe();

                Long block = cardRepository.count().block();
                Assertions.assertThat(block)
                                .withFailMessage("The number of registered cards should be '%d' but is '%d", 1, block)
                                .isEqualTo(1);

                String computedCardId = publishedCard.getPublisher() + "_" + publishedCard.getProcessId();
                CardPublicationData cardToDelete = cardRepositoryService.findCardToDelete(computedCardId);

                Assertions.assertThat(cardToDelete).isNotNull();

                Object resultingData = cardToDelete.getData();
                Assertions.assertThat(resultingData).isNotEqualTo(fakeDataContent);
                Assertions.assertThat(resultingData).isNull();

        }

}
