/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.consultation.repositories;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.cards.consultation.application.IntegrationTestApplication;
import org.opfab.cards.consultation.model.ArchivedCardConsultationData;
import org.opfab.cards.consultation.model.ArchivedCardsFilter;
import org.opfab.cards.consultation.model.ArchivedCardsFilterData;
import org.opfab.cards.consultation.model.FilterModelData;
import org.opfab.cards.model.FilterMatchTypeEnum;
import org.opfab.users.model.ComputedPerimeter;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.RightsEnum;
import org.opfab.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import reactor.test.StepVerifier;
import reactor.util.function.Tuple2;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.opfab.cards.consultation.TestUtilities.*;
import static reactor.util.function.Tuples.of;


@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = IntegrationTestApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles(profiles = {"native", "test"})
@Tag("end-to-end")
@Tag("mongo")

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
        ComputedPerimeter perimeter = new ComputedPerimeter();
        perimeter.setProcess("PROCESS");
        perimeter.setState("anyState");
        perimeter.setRights(RightsEnum.RECEIVEANDWRITE);

        user1.setLogin(login1);
        user1.addGroupsItem("someGroup");
        user1.addGroupsItem("someOtherGroup");
        currentUser1.setUserData(user1);
        currentUser1.setComputedPerimeters(Arrays.asList(perimeter));
        //Groups only

        user2.setLogin(login2);
        user2.addGroupsItem("rte");
        currentUser2.setUserData(user2);
        currentUser2.setComputedPerimeters(Arrays.asList(perimeter));
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
    public void initCardData() {

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
    void persistCard() {
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
    void fetchArchivedCardsWithRegularParams() {

        //Find cards with given publishers and a given processInstanceId

        FilterModelData filter1 = FilterModelData.builder()
            .columnName("publisher")
            .matchType(FilterMatchTypeEnum.IN)
            .filter(List.of(secondPublisher, businessconfigPublisher))
            .build();
        FilterModelData filter2 = FilterModelData.builder()
            .columnName("processInstanceId")
            .matchType(FilterMatchTypeEnum.EQUALS)
            .filter(List.of("PROCESS1"))
            .build();

            
        ArchivedCardsFilter filters = ArchivedCardsFilterData.builder()
            .filters(List.of(filter1, filter2)).build();

        Tuple2<CurrentUserWithPerimeters, ArchivedCardsFilter> filterParams = of(currentUser1, filters);


        StepVerifier.create(repository.findWithUserAndFilter(filterParams))
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
    void fetchArchivedCardsWithRegularParamsEmptyResultSet() {

        FilterModelData filter1 = FilterModelData.builder()
            .columnName("publisher")
            .matchType(FilterMatchTypeEnum.IN)
            .filter(List.of("noSuchPublisher"))
            .build();
            
        ArchivedCardsFilter filters = ArchivedCardsFilterData.builder()
            .filters(List.of(filter1)).build();

        Tuple2<CurrentUserWithPerimeters, ArchivedCardsFilter> filterParams = of(currentUser1, filters);

        StepVerifier.create(repository.findWithUserAndFilter(filterParams))
                .assertNext(page -> {
                    assertThat(page.getTotalElements()).isZero();
                    assertThat(page.getTotalPages()).isEqualTo(1);
                    assertThat(page.getContent()).isEmpty();
                })
                .expectComplete()
                .verify();
    }

    @Test
    void fetchArchivedCardsWithPublishDateBetween() {

        //Find cards published between start and end (included)
        Instant start = now;
        Instant end = nowPlusOne;


        FilterModelData filter1 = FilterModelData.builder()
            .columnName("publishDateFrom")
            .filter(List.of(Long.toString(start.toEpochMilli())))
            .build();
        FilterModelData filter2 = FilterModelData.builder()
            .columnName("publishDateTo")
            .filter(List.of(Long.toString(end.toEpochMilli())))
            .build();
            
        ArchivedCardsFilter filters = ArchivedCardsFilterData.builder()
            .filters(List.of(filter1, filter2)).build();

        Tuple2<CurrentUserWithPerimeters, ArchivedCardsFilter> filterParams = of(currentUser1, filters);


        StepVerifier.create(repository.findWithUserAndFilter(filterParams))
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
    void fetchArchivedCardsWithPublishDateAfter() {

        //Find cards published after start (included)
        Instant start = now;

        FilterModelData filter1 = FilterModelData.builder()
            .columnName("publishDateFrom")
            .filter(List.of(Long.toString(start.toEpochMilli())))
            .build();
            
        ArchivedCardsFilter filters = ArchivedCardsFilterData.builder()
            .filters(List.of(filter1)).build();

        Tuple2<CurrentUserWithPerimeters, ArchivedCardsFilter> filterParams = of(currentUser1, filters);


        StepVerifier.create(repository.findWithUserAndFilter(filterParams))
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
    void fetchArchivedCardsWithPublishDateBefore() {

        //Find cards published before end (included)
        Instant end = nowMinusTwo;

        FilterModelData filter1 = FilterModelData.builder()
            .columnName("publishDateTo")
            .filter(List.of(Long.toString(end.toEpochMilli())))
            .build();
        
        ArchivedCardsFilter filters = ArchivedCardsFilterData.builder()
            .filters(List.of(filter1)).build();

        Tuple2<CurrentUserWithPerimeters, ArchivedCardsFilter> filterParams = of(currentUser1, filters);


        StepVerifier.create(repository.findWithUserAndFilter(filterParams))
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
    void fetchArchivedCardsActiveBetween() {

        //Find cards with an active period that overlaps the [start,end] range (bounds included)
        Instant start = nowMinusHalf;
        Instant end = nowPlusHalf;

        FilterModelData filter1 = FilterModelData.builder()
            .columnName("activeFrom")
            .filter(List.of(Long.toString(start.toEpochMilli())))
            .build();
        FilterModelData filter2 = FilterModelData.builder()
            .columnName("activeTo")
            .filter(List.of(Long.toString(end.toEpochMilli())))
            .build();
        
        ArchivedCardsFilter filters = ArchivedCardsFilterData.builder()
            .filters(List.of(filter1, filter2)).build();

        Tuple2<CurrentUserWithPerimeters, ArchivedCardsFilter> filterParams = of(currentUser1, filters);


        StepVerifier.create(repository.findWithUserAndFilter(filterParams))
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
    void fetchArchivedCardsActiveFrom() {

        //Find cards with an active period that is at least partly after start
        Instant start = nowPlusTwo;

        FilterModelData filter1 = FilterModelData.builder()
            .columnName("activeFrom")
            .filter(List.of(Long.toString(start.toEpochMilli())))
            .build();
            
        ArchivedCardsFilter filters = ArchivedCardsFilterData.builder()
            .filters(List.of(filter1)).build();

        Tuple2<CurrentUserWithPerimeters, ArchivedCardsFilter> filterParams = of(currentUser1, filters);


        StepVerifier.create(repository.findWithUserAndFilter(filterParams))
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
    void fetchArchivedCardsActiveFromWithPaging() {

        //Find cards with an active period that is at least partly after start
        Instant start = nowPlusTwo;

        FilterModelData filter1 = FilterModelData.builder()
            .columnName("activeFrom")
            .filter(List.of(Long.toString(start.toEpochMilli())))
            .build();
            
        //Page 1
        ArchivedCardsFilter filters = ArchivedCardsFilterData.builder()
            .size(BigDecimal.valueOf(2))
            .page(BigDecimal.ZERO)
            .filters(List.of(filter1)).build();

        Tuple2<CurrentUserWithPerimeters, ArchivedCardsFilter> filterParams = of(currentUser1, filters);


        StepVerifier.create(repository.findWithUserAndFilter(filterParams))
                .assertNext(page -> {
                    int expectedNbOfElements = 5;
                    assertThat(page.getTotalElements()).isEqualTo(expectedNbOfElements);
                    int expectedNbOfPages = 3;
                    assertThat(page.getTotalPages()).isEqualTo(expectedNbOfPages);
                    int expectedNbOfElementsForTheFirstPage = 2;
                    assertThat(page.getContent()).hasSize(expectedNbOfElementsForTheFirstPage);
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
        filters.setPage(BigDecimal.ONE);
        filterParams = of(currentUser1, filters);


        StepVerifier.create(repository.findWithUserAndFilter(filterParams))
                .assertNext(page -> {
                    int expectedNbOfElements = 5;
                    assertThat(page.getTotalElements()).isEqualTo(expectedNbOfElements);
                    int expectedNbOfPages = 3;
                    assertThat(page.getTotalPages()).isEqualTo(expectedNbOfPages);
                    int expectedNbOfElementsForTheSecondPage = 2;
                    assertThat(page.getContent()).hasSize(expectedNbOfElementsForTheSecondPage);
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
        filters.setPage(BigDecimal.valueOf(2));
        filterParams = of(currentUser1, filters);

        StepVerifier.create(repository.findWithUserAndFilter(filterParams))
                .assertNext(page -> {
                    int expectedNbOfElements = 5;
                    assertThat(page.getTotalElements()).isEqualTo(expectedNbOfElements);
                    int expectedNbOfPages = 3;
                    assertThat(page.getTotalPages()).isEqualTo(expectedNbOfPages);
                    int expectedNbOfElementsForTheBusinessconfigPage = 1;
                    assertThat(page.getContent()).hasSize(expectedNbOfElementsForTheBusinessconfigPage);
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
    void fetchArchivedCardsActiveTo() {

        //Find cards with an active period that is at least partly before end
        Instant end = nowMinusTwo;

        FilterModelData filter1 = FilterModelData.builder()
            .columnName("activeTo")
            .filter(List.of(Long.toString(end.toEpochMilli())))
            .build();

        
        ArchivedCardsFilter filters = ArchivedCardsFilterData.builder()
            .filters(List.of(filter1)).build();

        Tuple2<CurrentUserWithPerimeters, ArchivedCardsFilter> filterParams = of(currentUser1, filters);

        
        StepVerifier.create(repository.findWithUserAndFilter(filterParams))
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
    void fetchArchivedCardsMixParams() {

        Instant start = nowMinusHalf;
        Instant end = nowPlusHalf;

        Instant publishTo = now;
     
        FilterModelData filter1 = FilterModelData.builder()
            .columnName("activeFrom")
            .filter(List.of(Long.toString(start.toEpochMilli())))
            .build();
        FilterModelData filter2 = FilterModelData.builder()
            .columnName("activeTo")
            .filter(List.of(Long.toString(end.toEpochMilli())))
            .build();

        FilterModelData filter3= FilterModelData.builder()
            .columnName("publishDateTo")
            .filter(List.of(Long.toString(publishTo.toEpochMilli())))
            .build();

        FilterModelData filter4= FilterModelData.builder()
            .columnName("publisher")
            .matchType(FilterMatchTypeEnum.EQUALS)
            .filter(List.of(firstPublisher))
            .build();

        ArchivedCardsFilter filters = ArchivedCardsFilterData.builder()
            .filters(List.of(filter1, filter2, filter3, filter4)).build();

        Tuple2<CurrentUserWithPerimeters, ArchivedCardsFilter> filterParams = of(currentUser1, filters);


        StepVerifier.create(repository.findWithUserAndFilter(filterParams))
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
    void fetchArchivedCardsUserRecipientIsAllowedToSee() {

        //Cards visible by user1
        ArchivedCardsFilter filters = ArchivedCardsFilterData.builder().filters(List.of()).build();

        Tuple2<CurrentUserWithPerimeters, ArchivedCardsFilter> filterParams = of(currentUser1, filters);


        StepVerifier.create(repository.findWithUserAndFilter(filterParams))
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
    void fetchArchivedCardsGroupRecipientIsAllowedToSee() {

        //Cards visible by someone from group "rte"
        ArchivedCardsFilter filters = ArchivedCardsFilterData.builder().filters(List.of()).build();

        Tuple2<CurrentUserWithPerimeters, ArchivedCardsFilter> filterParams = of(currentUser2, filters);


        StepVerifier.create(repository.findWithUserAndFilter(filterParams))
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
    void fetchArchivedCardsUserRecipientWithNoGroupIsAllowedToSee() {

        //Cards visible by user3 (who has no groups at all)
        ArchivedCardsFilter filters = ArchivedCardsFilterData.builder().filters(List.of()).build();
        Tuple2<CurrentUserWithPerimeters, ArchivedCardsFilter> filterParams = of(currentUser3, filters);


        StepVerifier.create(repository.findWithUserAndFilter(filterParams))
                .expectNextCount(1)
                .expectComplete()
                .verify();

    }

    @Test
    void fetchArchivedCardsEntityRecipientIsAllowedToSee() {

        //Cards visible by someone from entity "someEntity"
        ArchivedCardsFilter filters = ArchivedCardsFilterData.builder().filters(List.of()).build();
        Tuple2<CurrentUserWithPerimeters, ArchivedCardsFilter> filterParams = of(currentUser4, filters);


        StepVerifier.create(repository.findWithUserAndFilter(filterParams))
                .expectNextCount(1)
                .expectComplete()
                .verify();

    }

    @Test
    void fetchArchivedCardsGroupAndEntityRecipientAreAllowedToSee() {

        //Cards visible by someone from group "group1" and from entity "entity1"
        ArchivedCardsFilter filters = ArchivedCardsFilterData.builder().filters(List.of()).build();
        Tuple2<CurrentUserWithPerimeters, ArchivedCardsFilter> filterParams = of(currentUser5, filters);


        StepVerifier.create(repository.findWithUserAndFilter(filterParams))
                .expectNextCount(1)
                .expectComplete()
                .verify();

    }

}
