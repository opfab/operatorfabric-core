/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.publication.services;

import lombok.extern.slf4j.Slf4j;
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
import org.lfenergy.operatorfabric.cards.publication.repositories.ArchivedCardRepository;
import org.lfenergy.operatorfabric.cards.publication.repositories.CardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.lfenergy.operatorfabric.cards.model.RecipientEnum.DEADEND;

/**
 * <p></p>
 * Created on 30/07/18
 *
 * @author David Binder
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = CardPublicationApplication.class)
@ActiveProfiles(profiles = {"native", "test"})
@Slf4j
@Tag("end-to-end")
@Tag("mongo")
class CardWriteServiceShould {

    @Autowired
    private CardWriteService cardWriteService;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private ArchivedCardRepository archiveRepository;

    @Autowired
    private TestCardReceiver testCardReceiver;

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

    private Flux<CardPublicationData> generateCards() {
        return Flux.just(
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
                .severity(SeverityEnum.NOTIFICATION)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                .build(),
            CardPublicationData.builder()
                .publisher("PUBLISHER_2")
                .publisherVersion("O")
                .processId("PROCESS_2")
                .severity(SeverityEnum.QUESTION)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                .build(),
            CardPublicationData.builder()
                .publisher("PUBLISHER_1")
                .publisherVersion("O")
                .processId("PROCESS_2")
                .severity(SeverityEnum.NOTIFICATION)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                .build(),
            CardPublicationData.builder()
                .publisher("PUBLISHER_1")
                .publisherVersion("O")
                .processId("PROCESS_1")
                .severity(SeverityEnum.NOTIFICATION)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                .build()
        );
    }

    private CardPublicationData generateCardData(String publisher, String process) {
        return CardPublicationData.builder()
                .publisher(publisher)
                .publisherVersion("O")
                .processId(process)
                .severity(SeverityEnum.NOTIFICATION)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                .build();
    }

    private CardPublicationData generateWrongCardData(String publisher, String process) {
        return CardPublicationData.builder()
                .publisher(publisher)
                .publisherVersion("O")
                .processId(process)
                .build();
    }

    @Test
    void createAsyncCards() {
        cardWriteService.pushCardsAsyncParallel(generateCards());
        await().atMost(5, TimeUnit.SECONDS).until(() -> checkCardCount(4));
        await().atMost(5, TimeUnit.SECONDS).until(() -> checkArchiveCount(5));
    }

    @Test
    void createAsyncCardsWithError() {
        String publisher = "PUBLISHER_1";
        String process = "PROCESS_1";
        cardWriteService.pushCardsAsyncParallel(Flux.concat(Flux.just(generateWrongCardData(publisher, process)), generateCards()));
        await().atMost(5, TimeUnit.SECONDS).until(() -> checkCardCount(4));
        await().atMost(5, TimeUnit.SECONDS).until(() -> checkArchiveCount(5));
    }

    @Test
    void createSyncCards() {
        StepVerifier.create(cardWriteService.createCardsWithResult(generateCards()))
                .expectNextMatches(r -> r.getCount().equals(5)).verifyComplete();
        await().atMost(5, TimeUnit.SECONDS).until(() -> checkCardCount(4));
        await().atMost(5, TimeUnit.SECONDS).until(() -> checkArchiveCount(5));
    }

    @Test
    void createSyncCardsWithError() {
        StepVerifier.create(cardWriteService.createCardsWithResult(Flux.concat(Flux.just(generateWrongCardData("PUBLISHER_1", "PROCESS_1")), generateCards())))
                .expectNextMatches(r -> r.getCount().equals(0)).verifyComplete();
        await().atMost(5, TimeUnit.SECONDS).until(() -> checkCardCount(0));
        await().atMost(5, TimeUnit.SECONDS).until(() -> checkArchiveCount(0));
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
        CardPublicationData newCard = CardPublicationData.builder()
                .publisher("PUBLISHER_1")
                .publisherVersion("0.0.1")
                .processId("PROCESS_1")
                .severity(SeverityEnum.ALARM)
                .startDate(start)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").parameter("arg1", "value1").build())
                .endDate(start.plusSeconds(60))
                .lttd(start.minusSeconds(600))
                .deletionDate(start.plusSeconds(3600))
                .tag("tag1").tag("tag2")
                .media("SOUND")
                .data(data)
                .detail(
                        DetailPublicationData.builder()
                                .style("style1")
                                .title(I18nPublicationData.builder().key("detail.title").build())
                                .templateName("testTemplate")
                                .titleStyle("titleStyle")
                                .build()
                )
                .recipient(
                        RecipientPublicationData.builder()
                                .type(RecipientEnum.UNION)
                                .recipient(
                                        RecipientPublicationData.builder()
                                                .type(RecipientEnum.USER)
                                                .identity("graham")
                                                .build()
                                )
                                .recipient(
                                        RecipientPublicationData.builder()
                                                .type(RecipientEnum.USER)
                                                .identity("eric")
                                                .build()
                                )
                                .build())
                // FIXME move this to thirds
//                .actions("act1",
//                        ActionPublicationData.builder()
//                                .type(ActionEnum.URI)
//                                .label(I18nPublicationData.builder().key("actions.one").build())
//                                .build())
//                .actions("act2",
//                        ActionPublicationData.builder()
//                                .type(ActionEnum.URI)
//                                .label(I18nPublicationData.builder().key("actions.two").build())
//                                .input(
//                                        InputPublicationData.builder()
//                                                .type(InputEnum.BOOLEAN)
//                                                .label(I18nPublicationData.builder().key("actions.two.input.one").build())
//                                                .name("input1")
//                                                .build()
//                                )
//                                .input(
//                                        InputPublicationData.builder()
//                                                .type(InputEnum.LIST)
//                                                .label(I18nPublicationData.builder().key("actions.two.input.two").build())
//                                                .name("input2")
//                                                .value(
//                                                        ParameterListItemPublicationData.builder()
//                                                                .label(I18nPublicationData.builder().key("value.one").build())
//                                                                .value("one")
//                                                                .build())
//                                                .value(
//                                                        ParameterListItemPublicationData.builder()
//                                                                .label(I18nPublicationData.builder().key("value.two").build())
//                                                                .value("two")
//                                                                .build())
//                                                .build()
//                                )
//                                .build())
                .timeSpan(TimeSpanPublicationData.builder()
                        .start(Instant.ofEpochMilli(123l))
                        .build()
                )
                .build();
        cardWriteService.pushCardsAsyncParallel(Flux.just(newCard));
        await().atMost(5, TimeUnit.SECONDS).until(() -> checkCardCount(1));
        await().atMost(5, TimeUnit.SECONDS).until(() -> checkArchiveCount(1));
        await().atMost(5, TimeUnit.SECONDS).until(() -> !newCard.getOrphanedUsers().isEmpty());
        await().atMost(5, TimeUnit.SECONDS).until(() -> testCardReceiver.getEricQueue().size() >= 1);
        CardPublicationData persistedCard = cardRepository.findById(newCard.getId()).block();
        assertThat(persistedCard).isEqualToIgnoringGivenFields(newCard, "orphanedUsers");

        ArchivedCardPublicationData archivedPersistedCard = archiveRepository.findById(newCard.getUid()).block();
        assertThat(archivedPersistedCard).isEqualToIgnoringGivenFields(
                newCard, "uid","id", "deletionDate", "actions", "timeSpans");
        assertThat(archivedPersistedCard.getId()).isEqualTo(newCard.getUid());
        assertThat(testCardReceiver.getEricQueue().size()).isEqualTo(1);
        assertThat(testCardReceiver.getAdminQueue().size()).isEqualTo(0);
        assertThat(testCardReceiver.getTsoQueue().size()).isEqualTo(0);
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

}
