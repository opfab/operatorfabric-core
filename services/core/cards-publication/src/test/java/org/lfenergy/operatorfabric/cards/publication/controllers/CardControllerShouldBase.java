package org.lfenergy.operatorfabric.cards.publication.controllers;

import org.jeasy.random.EasyRandom;
import org.jeasy.random.EasyRandomParameters;
import org.jeasy.random.FieldPredicates;
import org.jetbrains.annotations.NotNull;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.model.I18nPublicationData;
import org.lfenergy.operatorfabric.cards.publication.model.RecipientPublicationData;
import org.lfenergy.operatorfabric.cards.publication.repositories.CardRepositoryForTest;
import org.opfab.client.cards.model.SeverityEnum;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import static java.nio.charset.Charset.forName;
import static org.opfab.client.cards.model.RecipientEnum.DEADEND;

public abstract class CardControllerShouldBase {
	
	@Autowired
    protected CardRepositoryForTest cardRepository;
    
    @Autowired
    protected WebTestClient webTestClient;
	
	protected List<CardPublicationData> instantiateCardPublicationData(EasyRandom randomGenerator, int cardNumber) {
        return randomGenerator.objects(CardPublicationData.class, cardNumber).collect(Collectors.toList());
    }

    @NotNull
    protected EasyRandom instantiateEasyRandom() {
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

    protected Flux<CardPublicationData> generateCards() {
        return Flux.just(
                CardPublicationData.builder()
                        .publisher("PUBLISHER_1")
                        .processVersion("O")
                        .processInstanceId("PROCESS_1")
                        .severity(SeverityEnum.ALARM)
                        .title(I18nPublicationData.builder().key("title").build())
                        .summary(I18nPublicationData.builder().key("summary").build())
                        .startDate(Instant.now())
                        .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                        .process("process1")
                        .state("state1")
                        .build(),
                CardPublicationData.builder()
                        .publisher("PUBLISHER_2")
                        .processVersion("O")
                        .processInstanceId("PROCESS_1")
                        .severity(SeverityEnum.INFORMATION)
                        .title(I18nPublicationData.builder().key("title").build())
                        .summary(I18nPublicationData.builder().key("summary").build())
                        .startDate(Instant.now())
                        .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                        .process("process2")
                        .state("state2")
                        .build(),
                CardPublicationData.builder()
                        .publisher("PUBLISHER_2")
                        .processVersion("O")
                        .processInstanceId("PROCESS_2")
                        .severity(SeverityEnum.COMPLIANT)
                        .title(I18nPublicationData.builder().key("title").build())
                        .summary(I18nPublicationData.builder().key("summary").build())
                        .startDate(Instant.now())
                        .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                        .process("process3")
                        .state("state3")
                        .build(),
                CardPublicationData.builder()
                        .publisher("PUBLISHER_1")
                        .processVersion("O")
                        .processInstanceId("PROCESS_2")
                        .severity(SeverityEnum.INFORMATION)
                        .title(I18nPublicationData.builder().key("title").build())
                        .summary(I18nPublicationData.builder().key("summary").build())
                        .startDate(Instant.now())
                        .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                        .process("process4")
                        .state("state4")
                        .build(),
                CardPublicationData.builder()
                        .publisher("PUBLISHER_1")
                        .processVersion("O")
                        .processInstanceId("PROCESS_1")
                        .severity(SeverityEnum.INFORMATION)
                        .title(I18nPublicationData.builder().key("title").build())
                        .summary(I18nPublicationData.builder().key("summary").build())
                        .startDate(Instant.now())
                        .recipient(RecipientPublicationData.builder().type(DEADEND).build())
                        .process("process1")
                        .state("state5")
                        .build()
        );
    }

}
