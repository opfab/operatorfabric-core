/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.repositories;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.consultation.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.cards.consultation.model.ArchivedCardConsultationData;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import reactor.test.StepVerifier;
import reactor.util.function.Tuple2;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.function.Predicate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.lfenergy.operatorfabric.cards.consultation.TestUtilities.checkIfCardActiveInRange;
import static org.lfenergy.operatorfabric.cards.consultation.TestUtilities.createSimpleArchivedCard;
import static reactor.util.function.Tuples.of;

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

    public static final String login1 = "user1Login";
    public static final String login2 = "user2Login";
    public static final String login3 = "user3Login";
    private static User user1 = new User();
    private static User user2 = new User();
    private static User user3 = new User();

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

    @BeforeAll
    public static void initUsers() {
        user1.setLogin(login1);
        user1.addGroupsItem("someGroup");
        user1.addGroupsItem("someOtherGroup");
        user2.setLogin(login2);
        user2.addGroupsItem("rte");
        user3.setLogin(login3);
        //No groups

    }

    @BeforeEach
    private void initCardData() {
        //TODO Limit test data to what's really necessary
        int processNo = 0;
        //create past cards
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowMinusTwo, nowMinusOne, login1, "rte", "operator"));
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowMinusTwo, nowMinusOne, login1, "rte", "operator"));
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowMinusOne, now, login1, "rte", "operator"));
        //create future cards
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, now, nowPlusOne, login1, "rte", "operator"));
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowPlusOne, nowPlusTwo, login1, "rte", "operator"));
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowPlusTwo, nowPlusThree, login1, "rte", "operator"));

        //card starts in past and ends in future
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowMinusThree, nowPlusThree, login1, "rte", "operator"));

        //card starts in past and never ends
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowMinusThree, null, login1, "rte", "operator"));

        //card starts in future and never ends
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowPlusThree, null, login1, "rte", "operator", "group2"));

        //create later published cards in past
        persistCard(createSimpleArchivedCard(1, firstPublisher, nowPlusOne, nowMinusTwo, nowMinusOne, login1, "rte", "operator"));

        //create later published cards in future
        persistCard(createSimpleArchivedCard(3, firstPublisher, nowPlusOne, nowPlusOne, nowPlusTwo, login1, "rte", "operator"));

        //create cards with different publishers
        persistCard(createSimpleArchivedCard(1, secondPublisher, now, nowMinusTwo, nowMinusOne, login1, "rte", "operator"));

        persistCard(createSimpleArchivedCard(1, thirdPublisher, nowPlusTwo, now, null, login1, "rte", "operator"));

        //create card sent to user3
        persistCard(createSimpleArchivedCard(1, firstPublisher, nowPlusOne, nowMinusTwo, nowMinusOne, login3, "rte", "operator"));
    }

    private void persistCard(ArchivedCardConsultationData simpleArchivedCard) {
        StepVerifier.create(repository.save(simpleArchivedCard))
                .expectNextCount(1)
                .expectComplete()
                .verify();
    }

    @Test
    public void persistCard() {
        repository.deleteAll().subscribe();

        ArchivedCardConsultationData card =
              createSimpleArchivedCard(1, firstPublisher, nowPlusOne, nowMinusTwo, nowMinusOne, login1, "rte", "operator");
        StepVerifier.create(repository.save(card))
                .expectNextMatches(computeCardPredicate())
                .expectComplete()
                .verify();

        StepVerifier.create(repository.findAll())
                .expectNextMatches(computeCardPredicate())
                .expectComplete()
                .verify();
    }

    private Predicate<ArchivedCardConsultationData> computeCardPredicate() {
        Predicate<ArchivedCardConsultationData> predicate = c -> !(c.getId()==null);
        predicate = predicate.and(c -> firstPublisher.equals(c.getPublisher()));
        predicate = predicate.and(c -> c.getOrphanedUsers().contains(login1));
        return predicate;
    }

    @Test void fetchArchivedCardById() {

        ArchivedCardConsultationData archivedCard = createSimpleArchivedCard(1, "PUBLISHER", nowPlusOne, nowMinusTwo, nowMinusOne, login1, "rte", "operator");
        String id = archivedCard.getId();

        persistCard(archivedCard);

        StepVerifier.create(repository.findById(id))
                .assertNext(card -> {
                    log.info("Coucou "+card.getOrphanedUsers());
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

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        //Find cards with given publishers and a given processId
        queryParams.add("publisher",secondPublisher);
        queryParams.add("publisher",thirdPublisher);
        queryParams.add("processId","PROCESS1");

        Tuple2<User, MultiValueMap<String, String>> params = of(user1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
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

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        queryParams.add("publisher","noSuchPublisher");

        Tuple2<User, MultiValueMap<String, String>> params = of(user1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .expectComplete()
                .verify();
    }

    @Test
    public void fetchArchivedCardsWithPublishDateBetween() {

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        //Find cards published between start and end (included)
        Instant start = now;
        Instant end = nowPlusOne;

        queryParams.add("publishDateFrom", Long.toString(start.toEpochMilli()));
        queryParams.add("publishDateTo",Long.toString(end.toEpochMilli()));

        Tuple2<User, MultiValueMap<String, String>> params = of(user1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
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

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        //Find cards published after start (included)
        Instant start = now;

        queryParams.add("publishDateFrom", Long.toString(start.toEpochMilli()));

        Tuple2<User, MultiValueMap<String, String>> params = of(user1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
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

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        //Find cards published before end (included)
        Instant end = nowMinusTwo;

        queryParams.add("publishDateTo",Long.toString(end.toEpochMilli()));

        Tuple2<User, MultiValueMap<String, String>> params = of(user1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .expectNextCount(9)
                .expectComplete()
                .verify();
    }

    @Test
    public void fetchArchivedCardsActiveBetween() {

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        //Find cards with an active period that overlaps the [start,end] range (bounds included)
        Instant start = nowMinusHalf;
        Instant end = nowPlusHalf;

        queryParams.add("activeFrom", Long.toString(start.toEpochMilli()));
        queryParams.add("activeTo", Long.toString(end.toEpochMilli()));

        Tuple2<User, MultiValueMap<String, String>> params = of(user1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .expectNextCount(5)
                .expectComplete()
                .verify();

        StepVerifier.create(repository.findWithUserAndParams(params))
                .thenConsumeWhile(card -> checkIfCardActiveInRange(card,start,end))
                .verifyComplete();
    }

    @Test
    public void fetchArchivedCardsActiveFrom() {

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        //Find cards with an active period that is at least partly after start
        Instant start = nowPlusTwo;

        queryParams.add("activeFrom", Long.toString(start.toEpochMilli()));

        Tuple2<User, MultiValueMap<String, String>> params = of(user1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .expectNextCount(7)
                .expectComplete()
                .verify();

        StepVerifier.create(repository.findWithUserAndParams(params))
                .thenConsumeWhile(card -> checkIfCardActiveInRange(card,start,null))
                .verifyComplete();
    }

    @Test
    public void fetchArchivedCardsActiveTo() {

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        //Find cards with an active period that is at least partly before end
        Instant end = nowMinusTwo;

        queryParams.add("activeTo", Long.toString(end.toEpochMilli()));

        Tuple2<User, MultiValueMap<String, String>> params = of(user1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .expectNextCount(6)
                .expectComplete()
                .verify();

        StepVerifier.create(repository.findWithUserAndParams(params))
                .thenConsumeWhile(card -> checkIfCardActiveInRange(card,null,end))
                .verifyComplete();
    }

    @Test
    public void fetchArchivedCardsMixParams() {

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        //Regular queryParams
        queryParams.add("publisher",firstPublisher);

        //Active period
        Instant start = nowMinusHalf;
        Instant end = nowPlusHalf;
        queryParams.add("activeFrom", Long.toString(start.toEpochMilli()));
        queryParams.add("activeTo", Long.toString(end.toEpochMilli()));

        //Publication date
        Instant publishTo = now;
        queryParams.add("publishDateTo",Long.toString(publishTo.toEpochMilli()));

        Tuple2<User, MultiValueMap<String, String>> params = of(user1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .expectNextCount(4)
                .expectComplete()
                .verify();

    }

    @Test
    public void fetchArchivedCardsUserRecipientIsAllowedToSee() {

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        //Cards visible by user1
        Tuple2<User, MultiValueMap<String, String>> params = of(user1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .expectNextCount(13)
                .expectComplete()
                .verify();

    }

    @Test
    public void fetchArchivedCardsGroupRecipientIsAllowedToSee() {

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        //Cards visible by someone from group rte
        Tuple2<User, MultiValueMap<String, String>> params = of(user2,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .expectNextCount(14)
                .expectComplete()
                .verify();

    }

    @Test
    public void fetchArchivedCardsUserRecipientWithNoGroupIsAllowedToSee() {

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        //Cards visible by user3 (who has no groups at all)
        Tuple2<User, MultiValueMap<String, String>> params = of(user3,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .expectNextCount(1)
                .expectComplete()
                .verify();

    }
}
