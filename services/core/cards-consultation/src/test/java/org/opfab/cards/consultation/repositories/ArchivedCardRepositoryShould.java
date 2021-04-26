/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.consultation.repositories;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.cards.consultation.application.IntegrationTestApplication;
import org.opfab.cards.consultation.model.ArchivedCardConsultationData;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.User;
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
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.opfab.cards.consultation.TestUtilities.*;
import static reactor.util.function.Tuples.of;

/**
 *
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
    public static final String login4 = "user4Login";
    public static final String login5 = "user5Login";
    private static User user1 = new User();
    private static User user2 = new User();
    private static User user3 = new User();
    private static User user4 = new User();
    private static User user5 = new User();
    private static CurrentUserWithPerimeters currentUser1 = new CurrentUserWithPerimeters();
    private static CurrentUserWithPerimeters currentUser2 = new CurrentUserWithPerimeters();
    private static CurrentUserWithPerimeters currentUser3 = new CurrentUserWithPerimeters();
    private static CurrentUserWithPerimeters currentUser4 = new CurrentUserWithPerimeters();
    private static CurrentUserWithPerimeters currentUser5 = new CurrentUserWithPerimeters();

    private static Instant now = roundingToMillis(Instant.now());
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
    private static String businessconfigPublisher = "PUBLISHER_3";

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
        currentUser1.setUserData(user1);
        //Groups only

        user2.setLogin(login2);
        user2.addGroupsItem("rte");
        currentUser2.setUserData(user2);
        //Group only

        user3.setLogin(login3);
        currentUser3.setUserData(user3);
        //No group and no entity

        user4.setLogin(login4);
        user4.addEntitiesItem("someEntity");
        user4.addEntitiesItem("someOtherEntity");
        currentUser4.setUserData(user4);
        //Entities only

        user5.setLogin(login5);
        user5.addGroupsItem("group1");
        user5.addEntitiesItem("entity1");
        currentUser5.setUserData(user5);
        //Group and entity
    }

    @BeforeEach
    private void initCardData() {

        int processNo = 0;
        //create past cards
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowMinusTwo, nowMinusOne, login1, new String[]{"rte","operator"}, new String[]{"entity1","entity2"}));
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowMinusTwo, nowMinusOne, login1, new String[]{"rte","operator"}, null));
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowMinusOne, now, login1, new String[]{"rte","operator"}, new String[]{"entity1","entity2"}));
        //create future cards
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, now, nowPlusOne, login1, new String[]{"rte","operator"}, null));
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowPlusOne, nowPlusTwo, login1, new String[]{"rte","operator"}, new String[]{"entity1","entity2"}));
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowPlusTwo, nowPlusThree, login1, new String[]{"rte","operator"}, null));

        //card starts in past and ends in future
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowMinusThree, nowPlusThree, login1, new String[]{"rte","operator"}, new String[]{"entity1","entity2"}));

        //card starts in past and never ends
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowMinusThree, null, login1, new String[]{"rte","operator"}, null));

        //card starts in future and never ends
        persistCard(createSimpleArchivedCard(processNo++, firstPublisher, nowMinusThree, nowPlusThree, null, login1, new String[]{"rte","operator","group2"}, new String[]{"entity1","entity2"}));

        //create later published cards in past
        persistCard(createSimpleArchivedCard(1, firstPublisher, nowPlusOne, nowMinusTwo, nowMinusOne, login1, new String[]{"rte","operator"}, null));

        //create later published cards in future
        persistCard(createSimpleArchivedCard(3, firstPublisher, nowPlusOne, nowPlusOne, nowPlusTwo, login1, new String[]{"rte","operator"}, new String[]{"entity1","entity2"}));

        //create cards with different publishers
        persistCard(createSimpleArchivedCard(1, secondPublisher, now, nowMinusTwo, nowMinusOne, login1, new String[]{"rte","operator"}, null));

        persistCard(createSimpleArchivedCard(1, businessconfigPublisher, nowPlusTwo, now, null, login1, new String[]{"rte","operator"}, new String[]{"entity1","entity2"}));

        //create card sent to user3
        persistCard(createSimpleArchivedCard(1, firstPublisher, nowPlusOne, nowMinusTwo, nowMinusOne, login3, new String[]{"rte","operator"}, null));

        //create card only received by user4
        persistCard(createSimpleArchivedCard(1, firstPublisher, nowPlusOne, nowMinusTwo, nowMinusOne, null, null, new String[]{"someEntity"}));

        //create card only received by user5
        persistCard(createSimpleArchivedCard(1, firstPublisher, nowPlusOne, nowMinusTwo, nowMinusOne, null, new String[]{"group1"}, new String[]{"entity1"}));

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
                createSimpleArchivedCard(1, firstPublisher, nowPlusOne, nowMinusTwo, nowMinusOne, login1, new String[]{"rte","operator"}, new String[]{"entity1", "entity2"});
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
        predicate = predicate.and(c -> c.getUserRecipients().contains(login1));
        predicate = predicate.and(c -> c.getGroupRecipients().contains("rte"));
        predicate = predicate.and(c -> c.getGroupRecipients().contains("operator"));
        predicate = predicate.and(c -> c.getEntityRecipients().size() == 2);
        predicate = predicate.and(c -> c.getEntityRecipients().get(0).equals("entity1"));
        predicate = predicate.and(c -> c.getEntityRecipients().get(1).equals("entity2"));
        return predicate;
    }

    @Test void fetchArchivedCardByIdWithUserWhoIsARecipient() {

        ArchivedCardConsultationData archivedCard = createSimpleArchivedCard(1, "PUBLISHER", nowPlusOne, nowMinusTwo, nowMinusOne, login1, new String[]{"rte","operator"}, null);
        String id = archivedCard.getId();

        persistCard(archivedCard);

        StepVerifier.create(repository.findByIdWithUser(id, currentUser1))
                .assertNext(card -> {
                    assertThat(card.getId()).isEqualTo(id);
                    assertThat(card.getPublisher()).isEqualTo("PUBLISHER");
                    assertThat(card.getProcessInstanceId()).isEqualTo("PROCESS1");
                    assertThat(card.getStartDate()).isEqualTo(nowMinusTwo);
                    assertThat(card.getEndDate()).isEqualTo(nowMinusOne);
                })
                .expectComplete()
                .verify();
    }

    @Test void fetchArchivedCardByIdWithUserWhoIsNotARecipient() {

        ArchivedCardConsultationData archivedCard = createSimpleArchivedCard(1, "PUBLISHER", nowPlusOne, nowMinusTwo, nowMinusOne, login1, new String[]{"someGroup","operator"}, null);
        String id = archivedCard.getId();

        persistCard(archivedCard);

        StepVerifier.create(repository.findByIdWithUser(id, currentUser2))
                .expectComplete()
                .verify();
    }

    @Test
    public void fetchArchivedCardsWithRegularParams() {

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        //Find cards with given publishers and a given processInstanceId
        queryParams.add("publisher",secondPublisher);
        queryParams.add("publisher",businessconfigPublisher);
        queryParams.add("processInstanceId","PROCESS1");

        Tuple2<CurrentUserWithPerimeters, MultiValueMap<String, String>> params = of(currentUser1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                //The card from businessconfigPublisher is returned first because it has the latest publication date
                .assertNext(page -> {
                    assertThat(page.getTotalElements()).isEqualTo(2);
                    assertThat(page.getTotalPages()).isEqualTo(1);
                    assertThat(page.getContent().get(0).getPublisher()).isEqualTo(businessconfigPublisher);
                    assertThat(page.getContent().get(0).getProcessInstanceId()).isEqualTo("PROCESS1");
                    assertThat(page.getContent().get(1).getPublisher()).isEqualTo(secondPublisher);
                    assertThat(page.getContent().get(1).getProcessInstanceId()).isEqualTo("PROCESS1");
                })
                .expectComplete()
                .verify();

    }

    @Test
    public void fetchArchivedCardsWithRegularParamsEmptyResultSet() {

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        queryParams.add("publisher","noSuchPublisher");

        Tuple2<CurrentUserWithPerimeters, MultiValueMap<String, String>> params = of(currentUser1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .assertNext(page -> {
                    assertThat(page.getTotalElements()).isEqualTo(0L);
                    assertThat(page.getTotalPages()).isEqualTo(1);
                    assertThat(page.getContent().size()).isEqualTo(0);
                })
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

        Tuple2<CurrentUserWithPerimeters, MultiValueMap<String, String>> params = of(currentUser1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .assertNext(page -> {
                    assertThat(page.getTotalElements()).isEqualTo(3);
                    assertThat(page.getTotalPages()).isEqualTo(1);
                    //Check criteria are matched
                    assertTrue(checkIfCardsFromPageMeetCriteria(page,
                            card -> (card.getPublishDate().compareTo(start)>=0)&&(card.getPublishDate().compareTo(end)<=0))
                    );
                    //Check sort order
                    assertTrue(checkIfPageIsSorted(page));
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

        Tuple2<CurrentUserWithPerimeters, MultiValueMap<String, String>> params = of(currentUser1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .assertNext(page -> {
                    assertThat(page.getTotalElements()).isEqualTo(4);
                    assertThat(page.getTotalPages()).isEqualTo(1);
                    //Check criteria are matched
                    assertTrue(checkIfCardsFromPageMeetCriteria(page,
                            card -> (card.getPublishDate().compareTo(start) >= 0))
                    );
                    //Check sort order
                    assertTrue(checkIfPageIsSorted(page));
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

        Tuple2<CurrentUserWithPerimeters, MultiValueMap<String, String>> params = of(currentUser1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .assertNext(page -> {
                    assertThat(page.getTotalElements()).isEqualTo(9);
                    assertThat(page.getTotalPages()).isEqualTo(1);
                    //Check criteria are matched
                    assertTrue(checkIfCardsFromPageMeetCriteria(page,
                            card -> (card.getPublishDate().compareTo(end) <= 0))
                    );
                    //Check sort order
                    assertTrue(checkIfPageIsSorted(page));
                })
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

        Tuple2<CurrentUserWithPerimeters, MultiValueMap<String, String>> params = of(currentUser1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .assertNext(page -> {
                    assertThat(page.getTotalElements()).isEqualTo(4);
                    assertThat(page.getTotalPages()).isEqualTo(1);
                    //Check criteria are matched
                    assertTrue(checkIfCardsFromPageMeetCriteria(page,
                            card -> checkIfCardActiveInRange(card, start, end))
                    );
                    //Check sort order
                    assertTrue(checkIfPageIsSorted(page));
                })
                .expectComplete()
                .verify();
    }

    @Test
    public void fetchArchivedCardsActiveFrom() {

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        //Find cards with an active period that is at least partly after start
        Instant start = nowPlusTwo;

        queryParams.add("activeFrom", Long.toString(start.toEpochMilli()));

        Tuple2<CurrentUserWithPerimeters, MultiValueMap<String, String>> params = of(currentUser1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .assertNext(page -> {
                    assertThat(page.getTotalElements()).isEqualTo(5);
                    assertThat(page.getTotalPages()).isEqualTo(1);
                    //Check criteria are matched
                    assertTrue(checkIfCardsFromPageMeetCriteria(page,
                            card -> checkIfCardActiveInRange(card, start, null))
                    );
                    //Check sort order
                    assertTrue(checkIfPageIsSorted(page));
                })
                .expectComplete()
                .verify();
    }



    @Test
    public void fetchArchivedCardsActiveFromWithPaging() {

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        //Find cards with an active period that is at least partly after start
        Instant start = nowPlusTwo;

        queryParams.add("activeFrom", Long.toString(start.toEpochMilli()));
        queryParams.add("size","2");

        //Page 1
        queryParams.add("page","0");
        Tuple2<CurrentUserWithPerimeters, MultiValueMap<String, String>> params = of(currentUser1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .assertNext(page -> {
                    int expectedNbOfElements = 5;
                    assertThat(page.getTotalElements()).isEqualTo(expectedNbOfElements);
                    int expectedNbOfPages = 3;
                    assertThat(page.getTotalPages()).isEqualTo(expectedNbOfPages);
                    int expectedNbOfElementsForTheFirstPage = 2;
                    assertThat(page.getContent().size()).isEqualTo(expectedNbOfElementsForTheFirstPage);
                    //Check criteria are matched
                    assertTrue(checkIfCardsFromPageMeetCriteria(page,
                            card -> checkIfCardActiveInRange(card, start, null))
                    );
                    //Check sort order
                    assertTrue(checkIfPageIsSorted(page));
                })
                .expectComplete()
                .verify();

        //Page 2
        queryParams.set("page","1");
        params = of(currentUser1,queryParams);
        StepVerifier.create(repository.findWithUserAndParams(params))
                .assertNext(page -> {
                    int expectedNbOfElements = 5;
                    assertThat(page.getTotalElements()).isEqualTo(expectedNbOfElements);
                    int expectedNbOfPages = 3;
                    assertThat(page.getTotalPages()).isEqualTo(expectedNbOfPages);
                    int expectedNbOfElementsForTheSecondPage = 2;
                    assertThat(page.getContent().size()).isEqualTo(expectedNbOfElementsForTheSecondPage);
                    //Check criteria are matched
                    assertTrue(checkIfCardsFromPageMeetCriteria(page,
                            card -> checkIfCardActiveInRange(card, start, null))
                    );
                    //Check sort order
                    assertTrue(checkIfPageIsSorted(page));
                })
                .expectComplete()
                .verify();

        //Page 3

        queryParams.set("page","2");
        params = of(currentUser1,queryParams);
        StepVerifier.create(repository.findWithUserAndParams(params))
                .assertNext(page -> {
                    int expectedNbOfElements = 5;
                    assertThat(page.getTotalElements()).isEqualTo(expectedNbOfElements);
                    int expectedNbOfPages = 3;
                    assertThat(page.getTotalPages()).isEqualTo(expectedNbOfPages);
                    int expectedNbOfElementsForTheBusinessconfigPage = 1;
                    assertThat(page.getContent().size()).isEqualTo(expectedNbOfElementsForTheBusinessconfigPage);
                    //Check criteria are matched
                    assertTrue(checkIfCardsFromPageMeetCriteria(page,
                            card -> checkIfCardActiveInRange(card, start, null))
                    );
                    //Check sort order
                    assertTrue(checkIfPageIsSorted(page));
                })
                .expectComplete()
                .verify();

    }

    @Test
    public void fetchArchivedCardsActiveTo() {

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        //Find cards with an active period that is at least partly before end
        Instant end = nowMinusTwo;

        queryParams.add("activeTo", Long.toString(end.toEpochMilli()));

        Tuple2<CurrentUserWithPerimeters, MultiValueMap<String, String>> params = of(currentUser1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .assertNext(page -> {
                    assertThat(page.getTotalElements()).isEqualTo(6);
                    assertThat(page.getTotalPages()).isEqualTo(1);
                    //Check criteria are matched
                    assertTrue(checkIfCardsFromPageMeetCriteria(page,
                            card -> checkIfCardActiveInRange(card, null, end))
                    );
                    //Check sort order
                    assertTrue(checkIfPageIsSorted(page));
                })
                .expectComplete()
                .verify();
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

        Tuple2<CurrentUserWithPerimeters, MultiValueMap<String, String>> params = of(currentUser1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .assertNext(page -> {
                    assertThat(page.getTotalElements()).isEqualTo(3);
                    assertThat(page.getTotalPages()).isEqualTo(1);
                    //Check criteria are matched
                    assertTrue(checkIfCardsFromPageMeetCriteria(page,
                            card -> (card.getPublisher().equals(firstPublisher)
                                    &&checkIfCardActiveInRange(card, start, end)
                                    &&card.getPublishDate().compareTo(publishTo)<=0)
                            )
                    );
                    //Check sort order
                    assertTrue(checkIfPageIsSorted(page));
                })
                .expectComplete()
                .verify();

    }

    @Test
    public void fetchArchivedCardsUserRecipientIsAllowedToSee() {

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        //Cards visible by user1
        Tuple2<CurrentUserWithPerimeters, MultiValueMap<String, String>> params = of(currentUser1,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .assertNext(page -> {
                    assertThat(page.getTotalElements()).isEqualTo(13);
                    assertThat(page.getTotalPages()).isEqualTo(1);
                    //Check sort order
                    assertTrue(checkIfPageIsSorted(page));
                })
                .expectComplete()
                .verify();

    }

    @Test
    public void fetchArchivedCardsGroupRecipientIsAllowedToSee() {

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        //Cards visible by someone from group "rte"
        Tuple2<CurrentUserWithPerimeters, MultiValueMap<String, String>> params = of(currentUser2,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .assertNext(page -> {
                    assertThat(page.getTotalElements()).isEqualTo(7);
                    assertThat(page.getTotalPages()).isEqualTo(1);
                    //Check sort order
                    assertTrue(checkIfPageIsSorted(page));
                })
                .expectComplete()
                .verify();

    }

    @Test
    public void fetchArchivedCardsUserRecipientWithNoGroupIsAllowedToSee() {

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        //Cards visible by user3 (who has no groups at all)
        Tuple2<CurrentUserWithPerimeters, MultiValueMap<String, String>> params = of(currentUser3,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .expectNextCount(1)
                .expectComplete()
                .verify();

    }

    @Test
    public void fetchArchivedCardsEntityRecipientIsAllowedToSee() {

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        //Cards visible by someone from entity "someEntity"
        Tuple2<CurrentUserWithPerimeters, MultiValueMap<String, String>> params = of(currentUser4,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .expectNextCount(1)
                .expectComplete()
                .verify();

    }

    @Test
    public void fetchArchivedCardsGroupAndEntityRecipientAreAllowedToSee() {

        MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();

        //Cards visible by someone from group "group1" and from entity "entity1"
        Tuple2<CurrentUserWithPerimeters, MultiValueMap<String, String>> params = of(currentUser5,queryParams);

        StepVerifier.create(repository.findWithUserAndParams(params))
                .expectNextCount(1)
                .expectComplete()
                .verify();

    }

}
