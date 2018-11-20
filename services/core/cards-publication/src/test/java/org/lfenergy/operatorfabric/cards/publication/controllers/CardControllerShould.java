/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.publication.controllers;

import lombok.extern.slf4j.Slf4j;
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
import java.util.concurrent.TimeUnit;

import static org.awaitility.Awaitility.await;
import static org.hamcrest.Matchers.hasProperty;
import static org.hamcrest.Matchers.is;
import static org.lfenergy.operatorfabric.cards.model.RecipientEnum.DEADEND;

/**
 * <p></p>
 * Created on 26/10/18
 *
 * @author David Binder
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
           .value(hasProperty("count",is(5)));
        await().atMost(5, TimeUnit.SECONDS).until(() -> checkCardCount(4));
        await().atMost(5, TimeUnit.SECONDS).until(() -> checkArchiveCount(5));
    }

    private boolean checkCardCount(long expectedCount) {
        Long count = cardRepository.count().block();
        if (count == expectedCount)
            return true;
        else {
            log.warn("Expected card count " + expectedCount + " but was " + count);
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

    private Flux<CardPublicationData> generateCards() {
        return Flux.just(
           CardPublicationData.builder()
              .publisher("PUBLISHER_1")
              .publisherVersion("O")
              .processId("PROCESS_1")
              .severity(SeverityEnum.ALARM)
              .title(I18nPublicationData.builder().key("title").build())
              .summary(I18nPublicationData.builder().key("summary").build())
              .startDate(Instant.now().toEpochMilli())
              .recipient(RecipientPublicationData.builder().type(DEADEND).build())
              .build(),
           CardPublicationData.builder()
              .publisher("PUBLISHER_2")
              .publisherVersion("O")
              .processId("PROCESS_1")
              .severity(SeverityEnum.NOTIFICATION)
              .title(I18nPublicationData.builder().key("title").build())
              .summary(I18nPublicationData.builder().key("summary").build())
              .startDate(Instant.now().toEpochMilli())
              .recipient(RecipientPublicationData.builder().type(DEADEND).build())
              .build(),
           CardPublicationData.builder()
              .publisher("PUBLISHER_2")
              .publisherVersion("O")
              .processId("PROCESS_2")
              .severity(SeverityEnum.QUESTION)
              .title(I18nPublicationData.builder().key("title").build())
              .summary(I18nPublicationData.builder().key("summary").build())
              .startDate(Instant.now().toEpochMilli())
              .recipient(RecipientPublicationData.builder().type(DEADEND).build())
              .build(),
           CardPublicationData.builder()
              .publisher("PUBLISHER_1")
              .publisherVersion("O")
              .processId("PROCESS_2")
              .severity(SeverityEnum.NOTIFICATION)
              .title(I18nPublicationData.builder().key("title").build())
              .summary(I18nPublicationData.builder().key("summary").build())
              .startDate(Instant.now().toEpochMilli())
              .recipient(RecipientPublicationData.builder().type(DEADEND).build())
              .build(),
           CardPublicationData.builder()
              .publisher("PUBLISHER_1")
              .publisherVersion("O")
              .processId("PROCESS_1")
              .severity(SeverityEnum.NOTIFICATION)
              .title(I18nPublicationData.builder().key("title").build())
              .summary(I18nPublicationData.builder().key("summary").build())
              .startDate(Instant.now().toEpochMilli())
              .recipient(RecipientPublicationData.builder().type(DEADEND).build())
              .build()
        );
    }
}