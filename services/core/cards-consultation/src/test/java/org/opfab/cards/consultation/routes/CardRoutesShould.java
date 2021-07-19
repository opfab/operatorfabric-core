/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.consultation.routes;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertAll;
import static org.opfab.cards.consultation.TestUtilities.configureRecipientReferencesAndStartDate;
import static org.opfab.cards.consultation.TestUtilities.createSimpleCard;
import static org.opfab.cards.consultation.TestUtilities.instantiateOneCardConsultationData;
import static org.opfab.cards.consultation.TestUtilities.roundingToMillis;

import java.time.Instant;
import java.util.Arrays;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.cards.consultation.application.IntegrationTestApplication;
import org.opfab.cards.consultation.configuration.webflux.CardRoutesConfig;
import org.opfab.cards.consultation.model.CardConsultationData;
import org.opfab.cards.consultation.model.CardData;
import org.opfab.cards.consultation.repositories.CardRepository;
import org.opfab.springtools.configuration.test.WithMockOpFabUserReactive;
import org.opfab.test.EmptyListComparator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerResponse;


import lombok.extern.slf4j.Slf4j;
import reactor.test.StepVerifier;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {IntegrationTestApplication.class, CardRoutesConfig.class}, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@ActiveProfiles(profiles = {"native", "test"})
@Tag("end-to-end")
@Tag("mongo")
@Slf4j
public class CardRoutesShould {

    @Autowired
    private WebTestClient webTestClient;
    @Autowired
    private RouterFunction<ServerResponse> cardRoutes;
    @Autowired
    private CardRepository repository;

    @AfterEach
    public  void cleanCardRepository(){
        repository.deleteAll().subscribe();
    }

    @Nested
    @WithMockOpFabUserReactive(login="userWithGroup", roles = {"SOME_GROUP"})
    public class GivenUserWithGroupCardRoutesShould {

        @Test
        public void respondOkIfOptions() {
            assertThat(cardRoutes).isNotNull();
            webTestClient.options().uri("/cards/id").exchange()
                    .expectStatus().isOk();
        }

        @Test
        public void respondNotFound() {
            assertThat(cardRoutes).isNotNull();
            webTestClient.get().uri("/cards/id").exchange()
                    .expectStatus().isNotFound();
        }

        @Test
        public void findOutCard() {
            Instant now = roundingToMillis(Instant.now());

            CardConsultationData simpleCard = instantiateOneCardConsultationData();
            configureRecipientReferencesAndStartDate(simpleCard, "userWithGroup", now, new String[]{"SOME_GROUP"}, null, "PROCESS", "anyState");

            StepVerifier.create(repository.save(simpleCard))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(cardRoutes).isNotNull();
            webTestClient.get().uri("/cards/{id}", simpleCard.getId()).exchange()
                    .expectStatus().isOk()
                    .expectBody(CardData.class).value(cardData ->
                            assertThat(cardData.getCard())
                                .usingRecursiveComparison()
                                //This is necessary because empty lists are ignored in the returned JSON
                                .withComparatorForFields(new EmptyListComparator<String>(),
                                "tags", "details", "userRecipients")
                                .isEqualTo(simpleCard));
        }
        
        @Test
        public void findOutCardByUserWithHisOwnAck(){
        	Instant now = Instant.now();
        	CardConsultationData simpleCard = instantiateOneCardConsultationData();
            configureRecipientReferencesAndStartDate(simpleCard, "userWithGroup", now, new String[]{"SOME_GROUP"}, null, "PROCESS", "anyState");
            simpleCard.setUsersAcks(Arrays.asList("userWithGroup","some-operator"));
            StepVerifier.create(repository.save(simpleCard))
            .expectNextCount(1)
            .expectComplete()
            .verify();
		    assertThat(cardRoutes).isNotNull();
		    webTestClient.get().uri("/cards/{id}", simpleCard.getId()).exchange()
		            .expectStatus().isOk()
		            .expectBody(CardData.class).value(cardData ->
                            assertThat(cardData.getCard().getHasBeenAcknowledged()).isTrue());
    
        }
        
        @Test
        public void findOutCardByUserWithoutHisOwnAck(){
        	Instant now = Instant.now();
        	CardConsultationData simpleCard = instantiateOneCardConsultationData();
            configureRecipientReferencesAndStartDate(simpleCard, "userWithGroup", now, new String[]{"SOME_GROUP"}, null, "PROCESS", "anyState");
            simpleCard.setUsersAcks(Arrays.asList("any-operator","some-operator"));
            StepVerifier.create(repository.save(simpleCard))
            .expectNextCount(1)
            .expectComplete()
            .verify();
		    assertThat(cardRoutes).isNotNull();
		    webTestClient.get().uri("/cards/{id}", simpleCard.getId()).exchange()
		            .expectStatus().isOk()
		            .expectBody(CardData.class).value(cardData ->
                            assertThat(cardData.getCard().getHasBeenAcknowledged()).isFalse());
    
        }
        
        @Test
        public void findOutCardWithoutAcks(){
        	Instant now = Instant.now();
        	CardConsultationData simpleCard = instantiateOneCardConsultationData();
        	simpleCard.setParentCardId(null);
            simpleCard.setInitialParentCardUid(null);
            configureRecipientReferencesAndStartDate(simpleCard, "userWithGroup", now, new String[]{"SOME_GROUP"}, null, "PROCESS", "anyState");
            StepVerifier.create(repository.save(simpleCard))
            .expectNextCount(1)
            .expectComplete()
            .verify();
		    assertThat(cardRoutes).isNotNull();
		    webTestClient.get().uri("/cards/{id}", simpleCard.getId()).exchange()
		            .expectStatus().isOk()
		            .expectBody(CardData.class).value(cardData -> assertThat(
		                    cardData.getCard().getHasBeenAcknowledged()).isFalse());
    
        }
        
        @Test
        public void findOutCardByUserWithHisOwnRead(){
        	Instant now = Instant.now();
        	CardConsultationData simpleCard = instantiateOneCardConsultationData();
            configureRecipientReferencesAndStartDate(simpleCard, "userWithGroup", now, new String[]{"SOME_GROUP"}, null, "PROCESS", "anyState");
            simpleCard.setUsersReads(Arrays.asList("userWithGroup","some-operator"));
            StepVerifier.create(repository.save(simpleCard))
            .expectNextCount(1)
            .expectComplete()
            .verify();
		    assertThat(cardRoutes).isNotNull();
		    webTestClient.get().uri("/cards/{id}", simpleCard.getId()).exchange()
		            .expectStatus().isOk()
		            .expectBody(CardData.class).value(cardData ->
                            assertThat(cardData.getCard().getHasBeenRead()).isTrue());
    
        }
        
        @Test
        public void findOutCardByUserWithoutHisOwnRead(){
        	Instant now = Instant.now();
        	CardConsultationData simpleCard = instantiateOneCardConsultationData();
            configureRecipientReferencesAndStartDate(simpleCard, "userWithGroup", now, new String[]{"SOME_GROUP"}, null, "PROCESS", "anyState");
            simpleCard.setUsersReads(Arrays.asList("any-operator","some-operator"));
            StepVerifier.create(repository.save(simpleCard))
            .expectNextCount(1)
            .expectComplete()
            .verify();
		    assertThat(cardRoutes).isNotNull();
		    webTestClient.get().uri("/cards/{id}", simpleCard.getId()).exchange()
		            .expectStatus().isOk()
		            .expectBody(CardData.class).value(cardData ->
                            assertThat(cardData.getCard().getHasBeenRead()).isFalse());
    
        }
        
        @Test
        public void findOutCardWithoutReads(){
        	Instant now = Instant.now();
        	CardConsultationData simpleCard = instantiateOneCardConsultationData();
        	simpleCard.setParentCardId(null);
            simpleCard.setInitialParentCardUid(null);
            configureRecipientReferencesAndStartDate(simpleCard, "userWithGroup", now, new String[]{"SOME_GROUP"}, null, "PROCESS", "anyState");
            StepVerifier.create(repository.save(simpleCard))
            .expectNextCount(1)
            .expectComplete()
            .verify();
		    assertThat(cardRoutes).isNotNull();
		    webTestClient.get().uri("/cards/{id}", simpleCard.getId()).exchange()
		            .expectStatus().isOk()
		            .expectBody(CardData.class).value(cardData -> assertThat(
		                    cardData.getCard().getHasBeenRead()).isFalse());
    
        }
    }

    @Nested
    @WithMockOpFabUserReactive(login="userWithNoGroup", roles = {})
    public class GivenUserWithNoGroupCardRoutesShould {

        @Test
        public void findOutCard(){
            CardConsultationData simpleCard = createSimpleCard(1, Instant.now(), Instant.now(), Instant.now().plusSeconds(3600));
            StepVerifier.create(repository.save(simpleCard))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(cardRoutes).isNotNull();
            webTestClient.get().uri("/cards/{id}",simpleCard.getId()).exchange()
                    .expectStatus().isNotFound()
            ;
        }
        
    }

    @Nested
    @WithMockOpFabUserReactive(login="userWithGroupAndEntity", roles={"SOME_GROUP"}, entities={"SOME_ENTITY"})
    public class GivenUserWithGroupAndEntityCardRoutesShould {

        @Test
        public void findOutCard(){
            Instant now = roundingToMillis(Instant.now());

            CardConsultationData simpleCard1 = instantiateOneCardConsultationData();
            configureRecipientReferencesAndStartDate(simpleCard1, "", now,
                    new String[]{"OTHER_GROUP", "SOME_GROUP"}, new String[]{"OTHER_ENTITY", "SOME_ENTITY"}, "PROCESS", "anyState");//must receive

            CardConsultationData simpleCard2 = instantiateOneCardConsultationData();
            configureRecipientReferencesAndStartDate(simpleCard2, "", now,
                    new String[]{"OTHER_GROUP", "SOME_GROUP"}, new String[]{"OTHER_ENTITY"}, "PROCESS", "anyState");//must not receive

            CardConsultationData simpleCard3 = instantiateOneCardConsultationData();
            configureRecipientReferencesAndStartDate(simpleCard3, "", now,
                    new String[]{"OTHER_GROUP"}, new String[]{"OTHER_ENTITY", "SOME_ENTITY"}, "PROCESS", "anyState");//must not receive

            CardConsultationData simpleCard4 = instantiateOneCardConsultationData();
            configureRecipientReferencesAndStartDate(simpleCard4, "", now,
                    new String[]{"OTHER_GROUP", "SOME_GROUP"}, null, "PROCESS", "anyState");//must receive

            CardConsultationData simpleCard5 = instantiateOneCardConsultationData();
            configureRecipientReferencesAndStartDate(simpleCard5, "", now,
                    null, new String[]{"OTHER_ENTITY", "SOME_ENTITY"}, null, null);//must not receive (because the user doesn't have the right for process/state)

            CardConsultationData simpleCard6 = instantiateOneCardConsultationData();
            configureRecipientReferencesAndStartDate(simpleCard6, "", now,
                    null, null, null, null);//must not receive

            StepVerifier.create(repository.save(simpleCard1))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(cardRoutes).isNotNull();
            webTestClient.get().uri("/cards/{id}", simpleCard1.getId()).exchange()
                    .expectStatus().isOk()
                    .expectBody(CardData.class).value(cardData ->
                            assertThat(cardData.getCard())
                                .usingRecursiveComparison()
                                //This is necessary because empty lists are ignored in the returned JSON
                                .withComparatorForFields(new EmptyListComparator<String>(),
                                "tags", "details", "userRecipients")
                                .isEqualTo(simpleCard1));

            StepVerifier.create(repository.save(simpleCard2))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(cardRoutes).isNotNull();
            webTestClient.get().uri("/cards/{id}", simpleCard2.getId()).exchange()
                    .expectStatus().isNotFound();

            StepVerifier.create(repository.save(simpleCard3))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(cardRoutes).isNotNull();
            webTestClient.get().uri("/cards/{id}", simpleCard3.getId()).exchange()
                    .expectStatus().isNotFound();

            StepVerifier.create(repository.save(simpleCard4))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(cardRoutes).isNotNull();
            webTestClient.get().uri("/cards/{id}", simpleCard4.getId()).exchange()
                    .expectStatus().isOk()
                    .expectBody(CardData.class).value(cardData ->
                            assertThat(cardData.getCard())
                                .usingRecursiveComparison()
                                //This is necessary because empty lists are ignored in the returned JSON
                                .withComparatorForFields(new EmptyListComparator<String>(),
                                "tags", "details", "userRecipients")
                                .isEqualTo(simpleCard4));

            StepVerifier.create(repository.save(simpleCard5))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(cardRoutes).isNotNull();
            webTestClient.get().uri("/cards/{id}", simpleCard5.getId()).exchange()
                    .expectStatus().isNotFound();

            StepVerifier.create(repository.save(simpleCard6))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(cardRoutes).isNotNull();
            webTestClient.get().uri("/cards/{id}", simpleCard6.getId()).exchange()
                    .expectStatus().isNotFound();
        }

        @Test
        public void findOutCardWithTwoChildCards() {

            Instant now = Instant.now();

            CardConsultationData parentCard = instantiateOneCardConsultationData();
            parentCard.setUid("parentUid");
            parentCard.setId(parentCard.getId() + "1");
            configureRecipientReferencesAndStartDate(parentCard, "userWithGroupAndEntity", now, new String[] {"SOME_GROUP"}, null, "PROCESS", "anyState");

            CardConsultationData childCard1 = instantiateOneCardConsultationData();
            childCard1.setParentCardId(parentCard.getId());
            childCard1.setInitialParentCardUid("parentUid");
            childCard1.setId(childCard1.getId() + "2");
            configureRecipientReferencesAndStartDate(childCard1, "userWithGroupAndEntity", now, new String[] {"SOME_GROUP"}, null, null, null);

            CardConsultationData childCard2 = instantiateOneCardConsultationData();
            childCard2.setParentCardId(parentCard.getId());
            childCard2.setInitialParentCardUid("parentUid");
            childCard2.setId(childCard2.getId() + "3");
            configureRecipientReferencesAndStartDate(childCard2, "userWithGroupAndEntity", now, new String[] {"SOME_GROUP"}, null, null, null);

            StepVerifier.create(repository.saveAll(Arrays.asList(parentCard, childCard1, childCard2)))
                    .expectNextCount(3)
                    .expectComplete()
                    .verify();
            assertThat(cardRoutes).isNotNull();
            webTestClient.get().uri("/cards/{id}", parentCard.getId()).exchange()
                    .expectStatus().isOk()
                    .expectBody(CardData.class).value(cardData ->
                        assertAll(
                                () -> assertThat(cardData.getCard().getId()).isEqualTo(parentCard.getId()),
                                () -> assertThat(cardData.getChildCards().size()).isEqualTo(2))
                        );
        }

        @Test
        public void findOutCardWithNoChildCard() {

            Instant now = Instant.now();

            CardConsultationData parentCard = instantiateOneCardConsultationData();
            parentCard.setUid("parentUid");
            parentCard.setId(parentCard.getId() + "1");
            configureRecipientReferencesAndStartDate(parentCard, "userWithGroupAndEntity", now, new String[] {"SOME_GROUP"}, null, "PROCESS", "anyState");

            StepVerifier.create(repository.save(parentCard))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(cardRoutes).isNotNull();
            webTestClient.get().uri("/cards/{id}", parentCard.getId()).exchange()
                    .expectStatus().isOk()
                    .expectBody(CardData.class).value(cardData ->
                    assertAll(
                            () -> assertThat(cardData.getCard().getId()).isEqualTo(parentCard.getId()),
                            () -> assertThat(cardData.getChildCards().size()).isEqualTo(0))
            );
        }
    }
}
