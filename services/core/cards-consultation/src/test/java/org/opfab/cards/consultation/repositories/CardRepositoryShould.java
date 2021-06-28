/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.repositories;

import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.cards.consultation.TestUtilities;
import org.opfab.cards.consultation.application.IntegrationTestApplication;
import org.opfab.cards.consultation.model.*;
import org.opfab.cards.consultation.model.CardConsultationData;
import org.opfab.cards.consultation.model.I18nConsultationData;
import org.opfab.cards.model.SeverityEnum;
import org.opfab.users.model.ComputedPerimeter;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.RightsEnum;
import org.opfab.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import reactor.test.StepVerifier;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.function.Predicate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.opfab.cards.consultation.TestUtilities.createSimpleCard;
import static org.opfab.cards.consultation.TestUtilities.prepareCard;


/**
 * <p></p>
 * Created on 24/07/18
 *
 *
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = IntegrationTestApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles(profiles = {"native", "test"})
//@Disabled
@Tag("end-to-end")
@Tag("mongo")
@Slf4j
public class CardRepositoryShould {

    public static final String LOGIN = "admin";
    private static Instant now = Instant.now();
    private static Instant nowPlusOne = now.plus(1, ChronoUnit.HOURS);
    private static Instant nowPlusTwo = now.plus(2, ChronoUnit.HOURS);
    private static Instant nowPlusThree = now.plus(3, ChronoUnit.HOURS);
    private static Instant nowMinusOne = now.minus(1, ChronoUnit.HOURS);
    private static Instant nowMinusTwo = now.minus(2, ChronoUnit.HOURS);
    private static Instant nowMinusThree = now.minus(3, ChronoUnit.HOURS);

    @Autowired
    private CardRepository repository;


    private CurrentUserWithPerimeters rteUserEntity1,rteUserEntity2, adminUser;


    public CardRepositoryShould(){
        ComputedPerimeter perimeter = new ComputedPerimeter();
        perimeter.setProcess("PROCESS");
        perimeter.setState("anyState");
        perimeter.setRights(RightsEnum.RECEIVEANDWRITE);

        User user1 = new User();
        user1.setLogin("operator3");
        user1.setFirstName("Test");
        user1.setLastName("User");
        List<String> groups = new ArrayList<>();
        groups.add("rte");
        groups.add("operator");
        user1.setGroups(groups);
        List<String> entities1 = new ArrayList<>();
        entities1.add("entity1");
        user1.setEntities(entities1);
        rteUserEntity1 = new CurrentUserWithPerimeters();
        rteUserEntity1.setUserData(user1);
        rteUserEntity1.setComputedPerimeters(Arrays.asList(perimeter));

        User user2 = new User();
        user2.setLogin("operator3");
        user2.setFirstName("Test");
        user2.setLastName("User");
        List<String> groups2 = new ArrayList<>();
        groups2.add("rte");
        groups2.add("operator");
        user2.setGroups(groups2);
        List<String> entities2 = new ArrayList<>();
        entities2.add("entity2");
        user2.setEntities(entities2);
        rteUserEntity2 = new CurrentUserWithPerimeters();
        rteUserEntity2.setUserData(user2);
        
        User user3 = new User();
        user3.setLogin("admin");
        user3.setFirstName("Test");
        user3.setLastName("User");;
        adminUser = new CurrentUserWithPerimeters();
        adminUser.setUserData(user3);
        adminUser.setComputedPerimeters(Arrays.asList(perimeter));
    }

    @AfterEach
    public void clean() {
        repository.deleteAll().subscribe();
    }


    private void assertCard(CardOperation op,Object processName, Object publisher, Object processVersion) {
        assertThat(op.getCard().getId()).isEqualTo(processName);
        assertThat(op.getCard().getPublisher()).isEqualTo(publisher);
        assertThat(op.getCard().getProcessVersion()).isEqualTo(processVersion);
    }

    private void persistCard(CardConsultationData simpleCard) {
        StepVerifier.create(repository.save(simpleCard))
                .expectNextCount(1)
                .expectComplete()
                .verify();
    }
   

    @Test
    public void persistCard() {
        CardConsultationData card =
                CardConsultationData.builder()
                        .processInstanceId("PROCESS_ID")
                        .process("PROCESS")
                        .publisher("PUBLISHER")
                        .processVersion("0")
                        .state("anyState")
                        .startDate(Instant.now())
                        .severity(SeverityEnum.ALARM)
                        .title(I18nConsultationData.builder().key("title").build())
                        .summary(I18nConsultationData.builder().key("summary").build())
                        .entityRecipients(new ArrayList<String>(Arrays.asList("entity1", "entity2")))
                        .build();
        prepareCard(card, Instant.now());
        StepVerifier.create(repository.save(card))
                .expectNextMatches(computeCardPredicate(card))
                .expectComplete()
                .verify();

        StepVerifier.create(repository.findById("PROCESS.PROCESS_ID"))
                .expectNextMatches(computeCardPredicate(card))
                .expectComplete()
                .verify();
    }

    @Test
    public void getZeroCardInRange()
    {
        persistCard(createSimpleCard("1", now, now, nowPlusOne, LOGIN,null, null));
        persistCard(createSimpleCard("2", now, now, nowPlusTwo, LOGIN, null,null));
        persistCard(createSimpleCard("3", now, nowPlusTwo, nowPlusThree, LOGIN,null,null));

        StepVerifier.create(repository.getCardOperations(null, nowMinusThree,nowMinusTwo, adminUser)
                .doOnNext(TestUtilities::logCardOperation))
                .expectComplete()
                .verify();
    }


    @Test
    public void getTwoCardsInRange()
    {
        persistCard(createSimpleCard("1", now, now, nowPlusOne, LOGIN,null, null));
        persistCard(createSimpleCard("2", now, now, nowPlusTwo, LOGIN, null,null));
        persistCard(createSimpleCard("3", now, nowPlusTwo, nowPlusThree, LOGIN,null,null));

        StepVerifier.create(repository.getCardOperations(null, now,nowPlusOne, adminUser)
                .doOnNext(TestUtilities::logCardOperation))
                .assertNext(op -> {
                    assertThat(op.getCard()).isNotNull();
                    assertCard(op,"PROCESS.PROCESS1", "PUBLISHER", "0");
                })
                .assertNext(op -> {
                    assertThat(op.getCard()).isNotNull();
                    assertCard(op,"PROCESS.PROCESS2", "PUBLISHER", "0");
                })
                .expectComplete()
                .verify();
       
    }

    @Test
    public void getThreeCardsInRange()
    {
        persistCard(createSimpleCard("1", now, now, nowPlusOne, LOGIN,null, null));
        persistCard(createSimpleCard("2", now, now, nowPlusTwo, LOGIN, null,null));
        persistCard(createSimpleCard("3", now, nowPlusTwo, nowPlusThree, LOGIN,null,null));

        StepVerifier.create(repository.getCardOperations(null, now,nowPlusThree, adminUser)
                .doOnNext(TestUtilities::logCardOperation))
                .assertNext(op -> {
                    assertThat(op.getCard()).isNotNull();
                    assertCard(op,"PROCESS.PROCESS1", "PUBLISHER", "0");
                })
                .assertNext(op -> {
                    assertThat(op.getCard()).isNotNull();
                    assertCard(op,"PROCESS.PROCESS2", "PUBLISHER", "0");
                })
                .assertNext(op -> {
                    assertThat(op.getCard()).isNotNull();
                    assertCard(op,"PROCESS.PROCESS3", "PUBLISHER", "0");
                })
                .expectComplete()
                .verify();
       
    }

    @Test
    public void getTwoCardsInRangeWitnNoEnd()
    {
        persistCard(createSimpleCard("1", now, nowMinusOne, nowPlusThree, LOGIN,null, null));
        persistCard(createSimpleCard("2", now, nowMinusOne, null, LOGIN, null,null));
        persistCard(createSimpleCard("3", now, nowPlusOne, null, LOGIN,null,null));

        HashMap<String,CardOperation> results = new HashMap<String,CardOperation>();
        StepVerifier.create(repository.getCardOperations(null, now,nowPlusTwo, adminUser)
                .doOnNext(TestUtilities::logCardOperation))
                .assertNext(op -> {
                    assertThat(op.getCard()).isNotNull();
                    results.put(op.getCard().getProcessInstanceId(), op);
                })
                .assertNext(op -> {
                    assertThat(op.getCard()).isNotNull();
                    results.put(op.getCard().getProcessInstanceId(), op);
                })
                .expectComplete()
                .verify();
       CardOperation card1 = (CardOperation) results.get("PROCESS1");
       CardOperation card2 = (CardOperation) results.get("PROCESS3");
       assertCard(card1, "PROCESS.PROCESS1", "PUBLISHER", "0");
       assertCard(card2, "PROCESS.PROCESS3", "PUBLISHER", "0");

    }
    
    @Test
    public void getZeroCardAfterPublishDate()
    {
        persistCard(createSimpleCard("1", now, now, nowPlusOne, LOGIN,null, null));
        persistCard(createSimpleCard("2", nowPlusTwo, now, nowPlusTwo, LOGIN, null,null));
        persistCard(createSimpleCard("3", nowPlusTwo, nowPlusTwo, nowPlusThree, LOGIN,null,null));

        StepVerifier.create(repository.getCardOperations(nowPlusThree, now,nowPlusThree, adminUser)
                .doOnNext(TestUtilities::logCardOperation))
                .expectComplete()
                .verify();
            }

    @Test
    public void getTwoCardsAfterPublishDate()
    {
        persistCard(createSimpleCard("1", now, now, nowPlusOne, LOGIN,null, null));
        persistCard(createSimpleCard("2", nowPlusTwo, now, nowPlusTwo, LOGIN, null,null));
        persistCard(createSimpleCard("3", nowPlusTwo, nowPlusTwo, nowPlusThree, LOGIN,null,null));

        StepVerifier.create(repository.getCardOperations(nowPlusOne, now,nowPlusThree, adminUser)
                .doOnNext(TestUtilities::logCardOperation))
                .assertNext(op -> {
                    assertThat(op.getCard()).isNotNull();
                    assertCard(op,"PROCESS.PROCESS2", "PUBLISHER", "0");
                })
                .assertNext(op -> {
                    assertThat(op.getCard()).isNotNull();
                    assertCard(op,"PROCESS.PROCESS3", "PUBLISHER", "0");
                })
                .expectComplete()
                .verify();
       
        }

        @Test
        public void getOneCardInRangeAndAfterPublishDate ()
        {
            persistCard(createSimpleCard("1", now, now, nowPlusOne, LOGIN,null, null));
            persistCard(createSimpleCard("2", nowPlusTwo, now, nowPlusOne, LOGIN, null,null));
            persistCard(createSimpleCard("3", nowPlusTwo, nowPlusTwo, nowPlusThree, LOGIN,null,null));
    
            StepVerifier.create(repository.getCardOperations(nowPlusOne, nowPlusTwo,nowPlusThree, adminUser)
                    .doOnNext(TestUtilities::logCardOperation))
                    .assertNext(op -> {
                        assertThat(op.getCard()).isNotNull();
                        assertCard(op,"PROCESS.PROCESS3", "PUBLISHER", "0");
                    })
                    .expectComplete()
                    .verify();
           
        }


        @Test
        public void getNoCardAsRteUserEntity1IsNotAdminUser() {
            persistCard(createSimpleCard("1", now, now, nowPlusOne, LOGIN, null, null));
            persistCard(createSimpleCard("2", now, now, nowPlusTwo, LOGIN, null, null));

            StepVerifier.create(repository.getCardOperations(null, now, nowPlusThree, rteUserEntity1)
                    .doOnNext(TestUtilities::logCardOperation))
                    .expectComplete()
                    .verify();
        }


        @Test
        public void getNoCardAsAdminUserIsNotInGroupRteOrInGroupOperator() {
            persistCard(createSimpleCard("1", now, now, nowPlusOne, null, new String[]{"rte","operator"}, null));
            persistCard(createSimpleCard("2", now, now, nowPlusTwo, null, new String[]{"rte","operator"}, null));

            StepVerifier.create(repository.getCardOperations(null, now, nowPlusThree, adminUser)
                    .doOnNext(TestUtilities::logCardOperation))
                    .expectComplete()
                    .verify();
        }


        @Test
        public void getTwoCardAsRteUserEntity1IsInGroupRte() {
            persistCard(createSimpleCard("1", now, now, nowPlusOne, null, new String[]{"rte","operator"}, null));
            persistCard(createSimpleCard("2", now, now, nowPlusTwo, null, new String[]{"rte","operator"}, null));

            StepVerifier.create(repository.getCardOperations(null, now, nowPlusThree, rteUserEntity1)
                    .doOnNext(TestUtilities::logCardOperation))
                    .assertNext(op -> {
                        assertThat(op.getCard()).isNotNull();
                        assertCard(op,"PROCESS.PROCESS1", "PUBLISHER", "0");
                    })
                    .assertNext(op -> {
                        assertThat(op.getCard()).isNotNull();
                        assertCard(op,"PROCESS.PROCESS2", "PUBLISHER", "0");
                    })
                    .expectComplete()
                    .verify();
        }


        @Test
        public void getNoCardAsRteUserEntity1IsInGroupRteButNotInEntity2() {
            persistCard(createSimpleCard("1", now, now, nowPlusOne, null, new String[]{"rte","operator"}, new String[]{"entity2"}));
            persistCard(createSimpleCard("2", now, now, nowPlusTwo, null, new String[]{"rte","operator"}, new String[]{"entity2"}));

            StepVerifier.create(repository.getCardOperations(null, now, nowPlusThree, rteUserEntity1)
                    .doOnNext(TestUtilities::logCardOperation))
                    .expectComplete()
                    .verify();
        }

        @Test
        public void getTwoCardAsRteUserEntity1IsInGroupRteAndInEntity1() {
            persistCard(createSimpleCard("1", now, now, nowPlusOne, null, new String[]{"rte","operator"}, new String[]{"entity1"}));
            persistCard(createSimpleCard("2", now, now, nowPlusTwo, null, new String[]{"rte","operator"}, new String[]{"entity1"}));

            StepVerifier.create(repository.getCardOperations(null, now, nowPlusThree, rteUserEntity1)
                    .doOnNext(TestUtilities::logCardOperation))
                    .assertNext(op -> {
                        assertThat(op.getCard()).isNotNull();
                        assertCard(op,"PROCESS.PROCESS1", "PUBLISHER", "0");
                    })
                    .assertNext(op -> {
                        assertThat(op.getCard()).isNotNull();
                        assertCard(op,"PROCESS.PROCESS2", "PUBLISHER", "0");
                    })
                    .expectComplete()
                    .verify();
        }



        @Test
        public void getTwoCardsWithOneAcknowledge()
        {
            persistCard(createSimpleCard("1", now, now, nowPlusOne, LOGIN,null, null));
            persistCard(createSimpleCard("2", now, nowPlusTwo, nowPlusThree, LOGIN,null,null,new String[] {"admin"},null));
    
            StepVerifier.create(repository.getCardOperations(null, now,nowPlusThree, adminUser)
                    .doOnNext(TestUtilities::logCardOperation))
                    .assertNext(op -> {
                        assertThat(op.getCard()).isNotNull();
                        assertCard(op,"PROCESS.PROCESS1", "PUBLISHER", "0");
                        assertThat(op.getCard().getHasBeenAcknowledged()).isFalse();
                    })
                    .assertNext(op -> {
                        assertThat(op.getCard()).isNotNull();
                        assertCard(op,"PROCESS.PROCESS2", "PUBLISHER", "0");
                        assertThat(op.getCard().getHasBeenAcknowledged()).isTrue();
                    })
                    .expectComplete()
                    .verify();
           
        }

        @Test
        public void getTwoCardsWithNoneAcknowledgeAsCardsHasNotBeenAcknowledgeByCurrentUser()
        {
            persistCard(createSimpleCard("1", now, now, nowPlusOne, LOGIN,null, null,new String[] {"user1","user2"},null));
            persistCard(createSimpleCard("2", now, nowPlusTwo, nowPlusThree, LOGIN,null,null,new String[] {"dummyuser"},null));
    
            StepVerifier.create(repository.getCardOperations(null, now,nowPlusThree, adminUser)
                    .doOnNext(TestUtilities::logCardOperation))
                    .assertNext(op -> {
                        assertThat(op.getCard()).isNotNull();
                        assertCard(op,"PROCESS.PROCESS1", "PUBLISHER", "0");
                        assertThat(op.getCard().getHasBeenAcknowledged()).isFalse();
                    })
                    .assertNext(op -> {
                        assertThat(op.getCard()).isNotNull();
                        assertCard(op,"PROCESS.PROCESS2", "PUBLISHER", "0");
                        assertThat(op.getCard().getHasBeenAcknowledged()).isFalse();
                    })
                    .expectComplete()
                    .verify();
           
        }
    
        @Test
        public void getTwoCardsWithOneRead()
        {
            persistCard(createSimpleCard("1", now, now, nowPlusOne, LOGIN,null, null));
            persistCard(createSimpleCard("2", now, nowPlusTwo, nowPlusThree, LOGIN,null,null,null,new String[] {"admin"}));
    
            StepVerifier.create(repository.getCardOperations(null, now,nowPlusThree, adminUser)
                    .doOnNext(TestUtilities::logCardOperation))
                    .assertNext(op -> {
                        assertThat(op.getCard()).isNotNull();
                        assertCard(op,"PROCESS.PROCESS1", "PUBLISHER", "0");
                        assertThat(op.getCard().getHasBeenRead()).isFalse();
                    })
                    .assertNext(op -> {
                        assertThat(op.getCard()).isNotNull();
                        assertCard(op,"PROCESS.PROCESS2", "PUBLISHER", "0");
                        assertThat(op.getCard().getHasBeenRead()).isTrue();
                    })
                    .expectComplete()
                    .verify();
           
        }

        @Test
        public void getTwoCardsWithNoneReadAsCardsHasNotBeenReadByCurrentUser()
        {
            persistCard(createSimpleCard("1", now, now, nowPlusOne, LOGIN,null, null,null,new String[] {"user1","user2"}));
            persistCard(createSimpleCard("2", now, nowPlusTwo, nowPlusThree, LOGIN,null,null,null,new String[] {"dummyuser"}));
    
            StepVerifier.create(repository.getCardOperations(null, now,nowPlusThree, adminUser)
                    .doOnNext(TestUtilities::logCardOperation))
                    .assertNext(op -> {
                        assertThat(op.getCard()).isNotNull();
                        assertCard(op,"PROCESS.PROCESS1", "PUBLISHER", "0");
                        assertThat(op.getCard().getHasBeenRead()).isFalse();
                    })
                    .assertNext(op -> {
                        assertThat(op.getCard()).isNotNull();
                        assertCard(op,"PROCESS.PROCESS2", "PUBLISHER", "0");
                        assertThat(op.getCard().getHasBeenRead()).isFalse();
                    })
                    .expectComplete()
                    .verify();
           
        }
        
    @NotNull
    private Predicate<CardConsultationData> computeCardPredicate(CardConsultationData card) {
        Predicate<CardConsultationData> predicate = c -> card.getId().equals(c.getId());
        predicate = predicate.and(c -> "PUBLISHER".equals(c.getPublisher()));
        predicate = predicate.and(c -> c.getEntityRecipients().size() == 2);
        predicate = predicate.and(c -> c.getEntityRecipients().get(0).equals("entity1"));
        predicate = predicate.and(c -> c.getEntityRecipients().get(1).equals("entity2"));
        return predicate;
    }


}
