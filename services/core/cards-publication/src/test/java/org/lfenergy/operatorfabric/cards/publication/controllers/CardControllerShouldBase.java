package org.lfenergy.operatorfabric.cards.publication.controllers;

import static java.nio.charset.Charset.forName;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.jeasy.random.EasyRandom;
import org.jeasy.random.EasyRandomParameters;
import org.jeasy.random.FieldPredicates;
import org.jetbrains.annotations.NotNull;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.repositories.CardRepositoryForTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.reactive.server.WebTestClient;

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

}
