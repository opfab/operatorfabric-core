/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.publication.controllers;

import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.jeasy.random.EasyRandom;
import org.jeasy.random.EasyRandomParameters;
import org.jeasy.random.FieldPredicates;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.lfenergy.operatorfabric.cards.publication.CardPublicationApplication;
import org.lfenergy.operatorfabric.cards.publication.model.CardCreationReportData;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.model.I18nPublicationData;
import org.lfenergy.operatorfabric.cards.publication.model.RecipientPublicationData;
import org.lfenergy.operatorfabric.cards.publication.repositories.ArchivedCardRepository;
import org.lfenergy.operatorfabric.cards.publication.repositories.CardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static java.nio.charset.Charset.forName;
import static org.awaitility.Awaitility.await;
import static org.hamcrest.Matchers.hasProperty;
import static org.hamcrest.Matchers.is;
import static org.lfenergy.operatorfabric.cards.model.RecipientEnum.DEADEND;

/**
 * <p></p>
 * Created on 26/10/18
 *
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = CardPublicationApplication.class)
@AutoConfigureWebTestClient
@ActiveProfiles(profiles = {"native", "test"})
@Slf4j
@Tag("end-to-end")
@Tag("mongo")
class CardControllerShould {

    @Autowired
    private CardRepository cardRepository;
    @Autowired
    private ArchivedCardRepository archiveRepository;
    @Autowired
    private WebTestClient webTestClient;



    @AfterEach
    public void cleanAfter() {
        cardRepository.deleteAll().subscribe();
        archiveRepository.deleteAll().subscribe();
    }

    @Test
    void createSyncCards() {
        this.webTestClient.post().uri("/cards").accept(MediaType.APPLICATION_JSON)
                .body(generateCards(), CardPublicationData.class)
                .exchange()
                .expectBody(CardCreationReportData.class)
                .value(hasProperty("count", is(5)));
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> Assertions.assertThat(cardRepository.count().block()).isEqualTo(4));

        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> Assertions.assertThat(archiveRepository.count().block()).isEqualTo(5));
    }

    private Flux<CardPublicationData> generateCards() {
        return Flux.just(
                getCardPublicationData()
        );
    }

    @NotNull
    private CardPublicationData[] getCardPublicationData() {
        return new CardPublicationData[]{
                CardPublicationData.builder()
                        .publisher("PUBLISHER_1")
                        .publisherVersion("O")
                        .processId("PROCESS_1")
                        .severity(SeverityEnum.ALARM)
                        .title(I18nPublicationData.builder().key("title").build())
                        .summary(I18nPublicationData.builder().key("summary").build())
                        .startDate(Instant.now())
                        .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                        .build(),
                CardPublicationData.builder()
                        .publisher("PUBLISHER_2")
                        .publisherVersion("O")
                        .processId("PROCESS_1")
                        .severity(SeverityEnum.INFORMATION)
                        .title(I18nPublicationData.builder().key("title").build())
                        .summary(I18nPublicationData.builder().key("summary").build())
                        .startDate(Instant.now())
                        .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                        .build(),
                CardPublicationData.builder()
                        .publisher("PUBLISHER_2")
                        .publisherVersion("O")
                        .processId("PROCESS_2")
                        .severity(SeverityEnum.COMPLIANT)
                        .title(I18nPublicationData.builder().key("title").build())
                        .summary(I18nPublicationData.builder().key("summary").build())
                        .startDate(Instant.now())
                        .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                        .build(),
                CardPublicationData.builder()
                        .publisher("PUBLISHER_1")
                        .publisherVersion("O")
                        .processId("PROCESS_2")
                        .severity(SeverityEnum.INFORMATION)
                        .title(I18nPublicationData.builder().key("title").build())
                        .summary(I18nPublicationData.builder().key("summary").build())
                        .startDate(Instant.now())
                        .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                        .build(),
                CardPublicationData.builder()
                        .publisher("PUBLISHER_1")
                        .publisherVersion("O")
                        .processId("PROCESS_1")
                        .severity(SeverityEnum.INFORMATION)
                        .title(I18nPublicationData.builder().key("title").build())
                        .summary(I18nPublicationData.builder().key("summary").build())
                        .startDate(Instant.now())
                        .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                        .build()};
    }

    // removes cards
    @Test
    void deleteSynchronously_An_ExistingCard_whenT_ItSProcessIdIsProvided() {

        EasyRandom randomGenerator = instantiateEasyRandom();

        int numberOfCards = 10;
        List<CardPublicationData> cardsInRepository = instantiateCardPublicationData(randomGenerator, numberOfCards);

        cardRepository.saveAll(cardsInRepository).subscribe();


        String existingId = cardsInRepository.get(0).getId();


        String testedId = existingId;
        this.webTestClient.delete().uri("/cards/" + testedId).accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk();

        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> Assertions.assertThat(cardRepository.count().block()).isEqualTo(numberOfCards - 1));

    }

    @Test
    void keepTheCardRepository_Untouched_when_ARandomProcessId_isGiven() {

        EasyRandom randomGenerator = instantiateEasyRandom();

        int cardNumber = 10;
        List<CardPublicationData> cardsInRepository = instantiateCardPublicationData(randomGenerator, cardNumber);

        cardRepository.saveAll(cardsInRepository).subscribe();

        await().atMost(5, TimeUnit.SECONDS).untilAsserted(
                () -> {
                    Long block = cardRepository.count().block();
                    Assertions.assertThat(block)
                            .withFailMessage("The number of registered cards should be %d but is %d"
                                    , cardNumber
                                    , block)
                            .isEqualTo(cardNumber);
                }
        );

        String testedId = randomGenerator.nextObject(String.class);
        this.webTestClient.delete().uri("/cards/" + testedId).accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk();

        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> Assertions.assertThat(cardRepository.count().block()).isEqualTo(
                cardNumber

        ));

    }

    private List<CardPublicationData> instantiateCardPublicationData(EasyRandom randomGenerator, int cardNumber) {
        return randomGenerator.objects(CardPublicationData.class, cardNumber).collect(Collectors.toList());
    }

    @NotNull
    private EasyRandom instantiateEasyRandom() {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plus(1, ChronoUnit.DAYS);

        LocalTime nine = LocalTime.of(9, 0);
        LocalTime fifteen = LocalTime.of(17, 0);

        EasyRandomParameters parameters = new EasyRandomParameters()
                .seed(5467L)
                .objectPoolSize(100)
                .randomizationDepth(3)
                .charset(forName("UTF-8"))
                .timeRange(nine, fifteen)
                .dateRange(today, tomorrow)
                .stringLengthRange(5, 50)
                .collectionSizeRange(1, 10)
                .excludeField(FieldPredicates.named("data"))
                .scanClasspathForConcreteTypes(true)
                .overrideDefaultInitialization(false)
                .ignoreRandomizationErrors(true);

        return new EasyRandom(parameters);
    }
}
