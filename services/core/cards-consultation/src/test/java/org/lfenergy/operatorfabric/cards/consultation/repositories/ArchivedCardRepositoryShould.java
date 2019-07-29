/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.repositories;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.consultation.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.cards.consultation.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import reactor.test.StepVerifier;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.lfenergy.operatorfabric.cards.consultation.TestUtilities.checkIfCardActiveInRange;
import static org.lfenergy.operatorfabric.cards.consultation.TestUtilities.createSimpleArchivedCard;

/**
 * @author Alexandra Guironnet
 */

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = IntegrationTestApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles(profiles = {"native", "test"})
//@Disabled
@Tag("end-to-end")
@Tag("mongo")
@Slf4j
public class ArchivedCardRepositoryShould {

    public static final String LOGIN = "admin";
    private static Instant now = Instant.now();
    private static Instant nowPlusHalf = now.plus(30, ChronoUnit.MINUTES);
    private static Instant nowMinusHalf = now.minus(30, ChronoUnit.MINUTES);
    private static Instant nowPlusOne = now.plus(1, ChronoUnit.HOURS);
    private static Instant nowPlusTwo = now.plus(2, ChronoUnit.HOURS);
    private static Instant nowPlusThree = now.plus(3, ChronoUnit.HOURS);
    private static Instant nowMinusOne = now.minus(1, ChronoUnit.HOURS);
    private static Instant nowMinusTwo = now.minus(2, ChronoUnit.HOURS);
    private static Instant nowMinusThree = now.minus(3, ChronoUnit.HOURS);
    private static String firstPublisher = "PUBLISHER_1";
    private static String secondPublisher = "PUBLISHER_2";
    private static String thirdPublisher = "PUBLISHER_3";

    @Autowired
    private ArchivedCardRepository repository;

    @Autowired
    private ObjectMapper mapper;

    @AfterEach
    public void clean() {
        repository.deleteAll().subscribe();
    }

    @BeforeEach
    private void initCardData() {
        //TODO Limit test data to what's really necessary
        int processNo = 0;
        //create past cards
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowMinusTwo, nowMinusOne, LOGIN, "rte", "operator"));
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowMinusTwo, nowMinusOne, LOGIN, "rte", "operator"));
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowMinusOne, now, LOGIN, "rte", "operator"));
        //create future cards
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, now, nowPlusOne, LOGIN, "rte", "operator"));
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowPlusOne, nowPlusTwo, LOGIN, "rte", "operator"));
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowPlusTwo, nowPlusThree, LOGIN, "rte", "operator"));

        //card starts in past and ends in future
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowMinusThree, nowPlusThree, LOGIN, "rte", "operator"));

        //card starts in past and never ends
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowMinusThree, null, LOGIN, "rte", "operator"));

        //card starts in future and never ends
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowPlusThree, null, LOGIN, "rte", "operator"));

        //create later published cards in past
        persistCard(createSimpleArchivedCard(1, firstPublisher, nowPlusOne, nowMinusTwo, nowMinusOne, LOGIN, "rte", "operator"));

        //create later published cards in future
        persistCard(createSimpleArchivedCard(3, firstPublisher, nowPlusOne, nowPlusOne, nowPlusTwo, LOGIN, "rte", "operator"));

        //create cards with different publishers
        persistCard(createSimpleArchivedCard(1, secondPublisher, now, nowMinusTwo, nowMinusOne, LOGIN, "rte", "operator"));

        persistCard(createSimpleArchivedCard(1, thirdPublisher, nowPlusTwo, now, null, LOGIN, "rte", "operator"));

    }

    private void persistCard(ArchivedCardConsultationData simpleArchivedCard) {
        StepVerifier.create(repository.save(simpleArchivedCard))
                .expectNextCount(1)
                .expectComplete()
                .verify();
    }
    
    //TODO Tests depending on user login
    //TODO Tests on recipients

    @Test void fetchArchivedCardById() {

        ArchivedCardConsultationData archivedCard = createSimpleArchivedCard(1, "PUBLISHER", nowPlusOne, nowMinusTwo, nowMinusOne, LOGIN, "rte", "operator");
        String id = archivedCard.getId();

        persistCard(archivedCard);

        StepVerifier.create(repository.findById(id))
                .assertNext(card -> {
                    assertThat(card.getId()).isEqualTo(id);
                    assertThat(card.getPublisher()).isEqualTo("PUBLISHER");
                    assertThat(card.getProcessId()).isEqualTo("PROCESS1");
                    assertThat(card.getStartDate()).isEqualTo(nowMinusTwo);
                    assertThat(card.getEndDate()).isEqualTo(nowMinusOne);
                })
                .expectComplete()
                .verify();
    }

    @Test
    public void fetchArchivedCardsWithRegularParams() {

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();

        //Find cards with given publishers and a given processId
        params.add("publisher",secondPublisher);
        params.add("publisher",thirdPublisher);
        params.add("processId","PROCESS1");

        StepVerifier.create(repository.findWithParams(params))
                //The card from thirdPublisher is returned first because it has the latest publication date
                .assertNext(card -> {
                    assertThat(card.getPublisher()).isEqualTo(thirdPublisher);
                    assertThat(card.getProcessId()).isEqualTo("PROCESS1");
                })
                .assertNext(card -> {
                    assertThat(card.getPublisher()).isEqualTo(secondPublisher);
                    assertThat(card.getProcessId()).isEqualTo("PROCESS1");
                })
                .expectComplete()
                .verify();

    }

    @Test
    public void fetchArchivedCardsWithRegularParamsEmptyResultSet() {

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();

        params.add("publisher","noSuchPublisher");

        StepVerifier.create(repository.findWithParams(params))
                .expectComplete()
                .verify();
    }

    @Test
    public void fetchArchivedCardsWithPublishDateBetween() {

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();

        //Find cards published between start and end (included)
        Instant start = now;
        Instant end = nowPlusOne;

        params.add("publishDateFrom", Long.toString(start.toEpochMilli()));
        params.add("publishDateTo",Long.toString(end.toEpochMilli()));

        StepVerifier.create(repository.findWithParams(params))
                .assertNext(card -> {
                    assertThat(card.getPublishDate()).isBetween(start,end);
                })
                .assertNext(card -> {
                    assertThat(card.getPublishDate()).isBetween(start,end);
                })
                .assertNext(card -> {
                    assertThat(card.getPublisher()).isEqualTo(secondPublisher); //This one is last because it has the oldest publishDate
                    //TODO Find a prettier way to check results are ordered by publishDate
                    assertThat(card.getPublishDate()).isBetween(start,end);
                })
                .expectComplete()
                .verify();
    }

    @Test
    public void fetchArchivedCardsWithPublishDateAfter() {

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();

        //Find cards published after start (included)
        Instant start = now;

        params.add("publishDateFrom", Long.toString(start.toEpochMilli()));

        StepVerifier.create(repository.findWithParams(params))
                .assertNext(card -> {
                    assertThat(card.getPublishDate()).isAfterOrEqualTo(start);
                })
                .assertNext(card -> {
                    assertThat(card.getPublishDate()).isAfterOrEqualTo(start);
                })
                .assertNext(card -> {
                    assertThat(card.getPublishDate()).isAfterOrEqualTo(start);
                })
                .assertNext(card -> {
                    assertThat(card.getPublisher()).isEqualTo(secondPublisher); //This one is last because it has the oldest publishDate
                    //TODO Find a prettier way to check results are ordered by publishDate
                    assertThat(card.getPublishDate()).isAfterOrEqualTo(start);
                })
                .expectComplete()
                .verify();
    }

    @Test
    public void fetchArchivedCardsWithPublishDateBefore() {

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();

        //Find cards published before end (included)
        Instant end = nowMinusTwo;

        params.add("publishDateTo",Long.toString(end.toEpochMilli()));

        StepVerifier.create(repository.findWithParams(params))
                .expectNextCount(9)
                .expectComplete()
                .verify();
    }

    @Test void fetchArchivedCardsActiveBetween() {

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();

        //Find cards with an active period that overlaps the [start,end] range (bounds included)
        Instant start = nowMinusHalf;
        Instant end = nowPlusHalf;

        params.add("activeFrom", Long.toString(start.toEpochMilli()));
        params.add("activeTo", Long.toString(end.toEpochMilli()));

        StepVerifier.create(repository.findWithParams(params))
                .expectNextCount(5)
                .expectComplete()
                .verify();

        StepVerifier.create(repository.findWithParams(params))
                .thenConsumeWhile(card -> checkIfCardActiveInRange(card,start,end))
                .verifyComplete();
    }

    @Test void fetchArchivedCardsActiveFrom() {

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();

        //Find cards with an active period that is at least partly after start
        Instant start = nowPlusTwo;

        params.add("activeFrom", Long.toString(start.toEpochMilli()));

        StepVerifier.create(repository.findWithParams(params))
                .expectNextCount(7)
                .expectComplete()
                .verify();

        StepVerifier.create(repository.findWithParams(params))
                .thenConsumeWhile(card -> checkIfCardActiveInRange(card,start,null))
                .verifyComplete();
    }

    @Test void fetchArchivedCardsActiveTo() {

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();

        //Find cards with an active period that is at least partly before end
        Instant end = nowMinusTwo;

        params.add("activeTo", Long.toString(end.toEpochMilli()));

        StepVerifier.create(repository.findWithParams(params))
                .expectNextCount(6)
                .expectComplete()
                .verify();

        StepVerifier.create(repository.findWithParams(params))
                .thenConsumeWhile(card -> checkIfCardActiveInRange(card,null,end))
                .verifyComplete();
    }

    @Test void fetchArchivedCardsMixParams() {

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();

        //Regular params
        params.add("publisher",firstPublisher);

        //Active period
        Instant start = nowMinusHalf;
        Instant end = nowPlusHalf;
        params.add("activeFrom", Long.toString(start.toEpochMilli()));
        params.add("activeTo", Long.toString(end.toEpochMilli()));

        //Publication date
        Instant publishTo = now;
        params.add("publishDateTo",Long.toString(publishTo.toEpochMilli()));

        StepVerifier.create(repository.findWithParams(params))
                .expectNextCount(4)
                .expectComplete()
                .verify();

    }
}
