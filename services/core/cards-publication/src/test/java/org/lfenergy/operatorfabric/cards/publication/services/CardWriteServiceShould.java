
package org.lfenergy.operatorfabric.cards.publication.services;

import com.mongodb.client.result.DeleteResult;
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
import org.lfenergy.operatorfabric.cards.publication.repositories.ArchivedCardRepository;
import org.lfenergy.operatorfabric.cards.publication.repositories.CardRepository;
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
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static java.nio.charset.Charset.forName;
import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.jeasy.random.FieldPredicates.named;
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
                        .build()
        );
    }

    private CardPublicationData generateCardData(String publisher, String process) {
        return CardPublicationData.builder()
                .publisher(publisher)
                .publisherVersion("O")
                .processId(process)
                .severity(SeverityEnum.INFORMATION)
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
//                .action("act1",
//                        ActionPublicationData.builder()
//                                .type(ActionEnum.URI)
//                                .label(I18nPublicationData.builder().key("action.one").build())
//                                .build())
//                .action("act2",
//                        ActionPublicationData.builder()
//                                .type(ActionEnum.URI)
//                                .label(I18nPublicationData.builder().key("action.two").build())
//                                .input(
//                                        InputPublicationData.builder()
//                                                .type(InputEnum.BOOLEAN)
//                                                .label(I18nPublicationData.builder().key("action.two.input.one").build())
//                                                .name("input1")
//                                                .build()
//                                )
//                                .input(
//                                        InputPublicationData.builder()
//                                                .type(InputEnum.LIST)
//                                                .label(I18nPublicationData.builder().key("action.two.input.two").build())
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
                newCard, "uid", "id", "deletionDate", "actions", "timeSpans");
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

    @Test
    void deleteOneCard_with_it_s_ProcessId() {

        EasyRandom easyRandom = instantiateRandomCardGenerator();
        int numberOfCards = 13;
        List<CardPublicationData> cards = instantiateServeralRandomCards(easyRandom, numberOfCards);

        cardWriteService.pushCardsAsyncParallel(
                Flux.just(
                        cards.toArray(new CardPublicationData[numberOfCards])
                )
        )
        ;
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
                    Long block = cardRepository.count().block();
                    Assertions.assertThat(block)
                            .withFailMessage("The number of registered cards should be '%d' but is " +
                                            "'%d' actually"
                                    , numberOfCards
                                    , block)
                            .isEqualTo(numberOfCards);
                }
        );

        CardPublicationData firstCard = cards.get(0);
        String processId = firstCard.getId();
        ;
        DeleteResult deleteResult = cardWriteService.deleteCard(processId);

        /*one card should be deleted(the first one)*/
        int thereShouldBeOneCardLess = numberOfCards-1;

        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
                    Long block = cardRepository.count().block();
                    Assertions.assertThat(block)
                            .withFailMessage("The number of registered cards should be '%d' but is '%d' " +
                                            "when first added card is deleted(processId:'%s')."
                                    , thereShouldBeOneCardLess
                                    , block
                                    , processId)
                            .isEqualTo(thereShouldBeOneCardLess);

                }
        );
        Assertions.assertThat(deleteResult).isEqualTo(DeleteResult.acknowledged(1));
    }
//FIXME unify way test cards are created throughout tests
    private List<CardPublicationData> instantiateServeralRandomCards(EasyRandom randomGenerator, int cardNumber) {
        return randomGenerator.objects(CardPublicationData.class, cardNumber).collect(Collectors.toList());
    }

    @NotNull
    private EasyRandom instantiateRandomCardGenerator() {
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
                .excludeField(named("data"))
                .excludeField(named("parameters"))
                .excludeField(named("shardKey"))
                .randomize(named("recipient").and(FieldPredicates.ofType(Recipient.class))
                                .and(FieldPredicates.inClass(CardPublicationData.class)),
                        () -> RecipientPublicationData.builder().type(DEADEND).build()
                )
                .scanClasspathForConcreteTypes(true)
                .overrideDefaultInitialization(false)
                .ignoreRandomizationErrors(true);

        return new EasyRandom(parameters);
    }

    @Test
    void deleteCards_Non_existentProcessId(){
        EasyRandom easyRandom = instantiateRandomCardGenerator();
        int numberOfCards = 13;
        List<CardPublicationData> cards = instantiateServeralRandomCards(easyRandom, numberOfCards);

        cardWriteService.pushCardsAsyncParallel(
                Flux.just(
                        cards.toArray(new CardPublicationData[numberOfCards])
                )
        )
        ;
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
                    Long block = cardRepository.count().block();
                    Assertions.assertThat(block)
                            .withFailMessage("The number of registered cards should be '%d' but is " +
                                            "'%d' actually"
                                    , numberOfCards
                                    , block)
                            .isEqualTo(numberOfCards);
                }
        );

        final String processId = generateIdNotInCardRepository();
        DeleteResult deleteResult = cardWriteService.deleteCard(processId);

        int expectedNumberOfCards = numberOfCards;/*no card should be deleted*/
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
                    Long block = cardRepository.count().block();
                    Assertions.assertThat(block)
                            .withFailMessage("The number of registered cards should remain '%d' but is '%d' " +
                                            "when an non-existing processId('%s') is used."
                                    , expectedNumberOfCards
                                    , block
                                    , processId)
                            .isEqualTo(expectedNumberOfCards);

                }
        );
        Assertions.assertThat(deleteResult).isEqualTo(DeleteResult.acknowledged(0));
    }

    private String generateIdNotInCardRepository() {
        Set<String> ids = new HashSet<>();
        cardRepository.findAll().map(card -> card.getId()).subscribe(ids::add);

        EasyRandom easyRandom = instantiateRandomCardGenerator();
        String id =easyRandom.nextObject(String.class);
        while (ids.contains(id)){
            id=easyRandom.nextObject(String.class);
        }
        return id;
    }


    @Test
    void findCardToDelete_should_Only_return_Card_with_NullData(){
        EasyRandom easyRandom = instantiateRandomCardGenerator();
        List<CardPublicationData> card = instantiateServeralRandomCards(easyRandom,1);
        String fakeDataContent = easyRandom.nextObject(String.class);
        CardPublicationData publishedCard = card.get(0);
        publishedCard.setData(fakeDataContent);

        cardWriteService.pushCardsAsyncParallel(Flux.just(card.toArray(new CardPublicationData[1])));

        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
                    Long block = cardRepository.count().block();
                    Assertions.assertThat(block)
                            .withFailMessage("The number of registered cards should be '%d' but is '%d"
                                    , 1
                                    , block)
                            .isEqualTo(1);
                }
        );

        String computedCardId = publishedCard.getPublisher()+"_"+publishedCard.getProcessId();
        CardPublicationData cardToDelete = cardWriteService.findCardToDelete(computedCardId);

        Assertions.assertThat(cardToDelete).isNotNull();

        Object resultingData = cardToDelete.getData();
        Assertions.assertThat(resultingData).isNotEqualTo(fakeDataContent);
        Assertions.assertThat(resultingData).isNull();

    }


}
