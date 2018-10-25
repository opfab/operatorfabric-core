/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.publication.services;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.model.ActionEnum;
import org.lfenergy.operatorfabric.cards.model.InputEnum;
import org.lfenergy.operatorfabric.cards.model.RecipientEnum;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.lfenergy.operatorfabric.cards.publication.Application;
import org.lfenergy.operatorfabric.cards.publication.config.TestCardReceiver;
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

/**
 * <p></p>
 * Created on 30/07/18
 *
 * @author davibind
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = Application.class)
@ActiveProfiles(profiles = {"native","test"})
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
    public void cleanAfter(){
        cardRepository.deleteAll().subscribe();
        archiveRepository.deleteAll().subscribe();
        testCardReceiver.clear();
    }

    @BeforeEach
    public void cleanBefore(){
        testCardReceiver.clear();
    }

    private Flux<CardData> generateCards(){
        return Flux.just(
           CardData.builder()
              .publisher("PUBLISHER_1")
              .processId("PROCESS_1")
              .severity(SeverityEnum.ALARM)
              .title(I18nData.builder().key("title").build())
              .summary(I18nData.builder().key("summary").build())
              .startDate(Instant.now().toEpochMilli())
              .build(),
           CardData.builder()
              .publisher("PUBLISHER_2")
              .processId("PROCESS_1")
              .severity(SeverityEnum.NOTIFICATION)
              .title(I18nData.builder().key("title").build())
              .summary(I18nData.builder().key("summary").build())
              .startDate(Instant.now().toEpochMilli())
              .build(),
           CardData.builder()
              .publisher("PUBLISHER_2")
              .processId("PROCESS_2")
              .severity(SeverityEnum.QUESTION)
              .title(I18nData.builder().key("title").build())
              .summary(I18nData.builder().key("summary").build())
              .startDate(Instant.now().toEpochMilli())
              .build(),
           CardData.builder()
              .publisher("PUBLISHER_1")
              .processId("PROCESS_2")
              .severity(SeverityEnum.NOTIFICATION)
              .title(I18nData.builder().key("title").build())
              .summary(I18nData.builder().key("summary").build())
              .startDate(Instant.now().toEpochMilli())
              .build(),
           CardData.builder()
              .publisher("PUBLISHER_1")
              .processId("PROCESS_1")
              .severity(SeverityEnum.NOTIFICATION)
              .title(I18nData.builder().key("title").build())
              .summary(I18nData.builder().key("summary").build())
              .startDate(Instant.now().toEpochMilli())
              .build()
        );
    }

    @Test
    void createAsyncCards() {
        cardWriteService.createCardsAsyncParallel(generateCards());
        await().atMost(5,TimeUnit.SECONDS).until(()-> checkCardCount(4));
        await().atMost(5,TimeUnit.SECONDS).until(()-> checkArchiveCount(5));
    }

    @Test
    void createAsyncCardsWithError() {
        cardWriteService.createCardsAsyncParallel(Flux.concat(Flux.just(CardData.builder()
           .publisher("PUBLISHER_1")
           .processId("PROCESS_1").build()),generateCards()));
        await().atMost(5,TimeUnit.SECONDS).until(()-> checkCardCount(4));
        await().atMost(5,TimeUnit.SECONDS).until(()-> checkArchiveCount(5));
    }

    @Test
    void createSyncCards() {
        StepVerifier.create(cardWriteService.createCardsWithResult(generateCards()))
           .expectNextMatches(r->r.getCount().equals(5)).verifyComplete();
        await().atMost(5,TimeUnit.SECONDS).until(()-> checkCardCount(4));
        await().atMost(5,TimeUnit.SECONDS).until(()-> checkArchiveCount(5));
    }

    @Test
    void createSyncCardsWithError() {
        StepVerifier.create(cardWriteService.createCardsWithResult(Flux.concat(Flux.just(CardData.builder()
           .publisher("PUBLISHER_1")
           .processId("PROCESS_1").build()),generateCards())))
        .expectNextMatches(r->r.getCount().equals(0)).verifyComplete();
        await().atMost(5,TimeUnit.SECONDS).until(()-> checkCardCount(0));
        await().atMost(5,TimeUnit.SECONDS).until(()-> checkArchiveCount(0));
    }

    @Test
    void preserveData(){
        Instant start = Instant.now().plusSeconds(3600);
        LinkedHashMap data = new LinkedHashMap();
        data.put("int",123);
        data.put("string","test");
        LinkedHashMap subdata = new LinkedHashMap();
        subdata.put("int",456);
        subdata.put("string","test2");
        data.put("object",subdata);
        CardData newCard = CardData.builder()
            .publisher("PUBLISHER_1")
            .publisherVersion("0.0.1")
            .processId("PROCESS_1")
            .severity(SeverityEnum.ALARM)
            .startDate(start.toEpochMilli())
            .title(I18nData.builder().key("title").build())
            .summary(I18nData.builder().key("summary").parameter("arg1","value1").build())
            .endDate(start.plusSeconds(60).toEpochMilli())
            .lttd(start.minusSeconds(600).toEpochMilli())
            .deletionDate(start.plusSeconds(3600).toEpochMilli())
            .tag("tag1").tag("tag2")
            .media("SOUND")
            .data(data)
            .detail(
                DetailData.builder()
                .style("style1")
                .title(I18nData.builder().key("detail.title").build())
                .templateName("testTemplate")
                .titleStyle("titleStyle")
                .build()
            )
            .recipient(
                RecipientData.builder()
                    .type(RecipientEnum.UNION)
                    .recipient(
                        RecipientData.builder()
                            .type(RecipientEnum.USER)
                            .identity("graham")
                            .build()
                    )
                    .recipient(
                        RecipientData.builder()
                            .type(RecipientEnum.USER)
                            .identity("eric")
                            .build()
                    )
                .build())
            .action("act1",
               ActionData.builder()
                  .type(ActionEnum.URI)
                  .label(I18nData.builder().key("action.one").build())
                  .build())
           .action("act2",
              ActionData.builder()
                 .type(ActionEnum.URI)
                 .label(I18nData.builder().key("action.two").build())
                 .input(
                     InputData.builder()
                         .type(InputEnum.BOOLEAN)
                         .label(I18nData.builder().key("action.two.input.one").build())
                         .name("input1")
                         .build()
                 )
                 .input(
                    InputData.builder()
                       .type(InputEnum.LIST)
                       .label(I18nData.builder().key("action.two.input.two").build())
                       .name("input2")
                       .value(
                            ParameterListItemData.builder()
                               .label(I18nData.builder().key("value.one").build())
                               .value("one")
                               .build())
                       .value(
                          ParameterListItemData.builder()
                             .label(I18nData.builder().key("value.two").build())
                             .value("two")
                             .build())
                       .build()
                 )
                 .build())
            .build();
        cardWriteService.createCardsAsyncParallel(Flux.just(newCard));
        await().atMost(5,TimeUnit.SECONDS).until(()-> checkCardCount(1));
        await().atMost(5,TimeUnit.SECONDS).until(()-> checkArchiveCount(1));
        await().atMost(5,TimeUnit.SECONDS).until(()-> !newCard.getOrphanedUsers().isEmpty());
        await().atMost(5,TimeUnit.SECONDS).until(()-> testCardReceiver.getEricQueue().size()>=1);
        CardData persistedCard = cardRepository.findById(newCard.getId()).block();
        assertThat(persistedCard).isEqualToIgnoringGivenFields(newCard,"orphanedUsers");

        ArchivedCardData archivedPersistedCard = archiveRepository.findById(newCard.getUid()).block();
        assertThat(archivedPersistedCard).isEqualToIgnoringGivenFields(
                newCard, "id","deletionDate","actions");
        assertThat(archivedPersistedCard.getId()).isEqualTo(newCard.getUid());
        assertThat(testCardReceiver.getEricQueue().size()).isEqualTo(1);
        assertThat(testCardReceiver.getAdminQueue().size()).isEqualTo(0);
        assertThat(testCardReceiver.getTsoQueue().size()).isEqualTo(0);
    }

    private boolean checkCardCount(long expectedCount){
        Long count = cardRepository.count().block();
        if(count == expectedCount)
            return true;
        else {
            log.warn("Expected card count "+expectedCount+" but was "+count);
            return false;
        }
    }

    private boolean checkArchiveCount(long expectedCount){
        Long count = archiveRepository.count().block();
        if(count == expectedCount)
            return true;
        else {
            log.warn("Expected card count "+expectedCount+" but was "+count);
            return false;
        }
    }

}