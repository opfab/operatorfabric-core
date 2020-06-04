/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.consultation.routes;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.consultation.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.cards.consultation.configuration.webflux.CardRoutesConfig;
import org.lfenergy.operatorfabric.cards.consultation.model.CardConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.repositories.CardRepository;
import org.lfenergy.operatorfabric.springtools.configuration.test.WithMockOpFabUser;
import org.lfenergy.operatorfabric.test.EmptyListComparator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.test.StepVerifier;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.lfenergy.operatorfabric.cards.consultation.TestUtilities.*;

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
    @WithMockOpFabUser(login="userWithGroup", roles = {"SOME_GROUP"})
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
            Instant now = Instant.now();

            CardConsultationData simpleCard = instantiateOneCardConsultationData();
            configureRecipientReferencesAndStartDate(simpleCard, "userWithGroup", now, new String[]{"SOME_GROUP"}, null);

            StepVerifier.create(repository.save(simpleCard))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(cardRoutes).isNotNull();
            webTestClient.get().uri("/cards/{id}", simpleCard.getId()).exchange()
                    .expectStatus().isOk()
                    .expectBody(CardConsultationData.class).value(card -> {
                assertThat(card)
                        //This is necessary because empty lists are ignored in the returned JSON
                        .usingComparatorForFields(new EmptyListComparator<String>(),
                                "tags", "details", "userRecipients","orphanedUsers")
                        .isEqualToComparingFieldByFieldRecursively(simpleCard);
            });
        }
    }

    @Nested
    @WithMockOpFabUser(login="userWithNoGroup", roles = {})
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
                    .expectStatus().isForbidden()
            ;
        }

    }

    @Nested
    @WithMockOpFabUser(login="userWithGroupAndEntity", roles={"SOME_GROUP"}, entities={"SOME_ENTITY"})
    public class GivenUserWithGroupAndEntityCardRoutesShould {

        @Test
        public void findOutCard(){
            Instant now = Instant.now();

            CardConsultationData simpleCard1 = instantiateOneCardConsultationData();
            configureRecipientReferencesAndStartDate(simpleCard1, "", now,
                    new String[]{"OTHER_GROUP", "SOME_GROUP"}, new String[]{"OTHER_ENTITY", "SOME_ENTITY"});//must receive

            CardConsultationData simpleCard2 = instantiateOneCardConsultationData();
            configureRecipientReferencesAndStartDate(simpleCard2, "", now,
                    new String[]{"OTHER_GROUP", "SOME_GROUP"}, new String[]{"OTHER_ENTITY"});//must not receive

            CardConsultationData simpleCard3 = instantiateOneCardConsultationData();
            configureRecipientReferencesAndStartDate(simpleCard3, "", now,
                    new String[]{"OTHER_GROUP"}, new String[]{"OTHER_ENTITY", "SOME_ENTITY"});//must not receive

            CardConsultationData simpleCard4 = instantiateOneCardConsultationData();
            configureRecipientReferencesAndStartDate(simpleCard4, "", now,
                    new String[]{"OTHER_GROUP", "SOME_GROUP"}, null);//must receive

            CardConsultationData simpleCard5 = instantiateOneCardConsultationData();
            configureRecipientReferencesAndStartDate(simpleCard5, "", now,
                    null, new String[]{"OTHER_ENTITY", "SOME_ENTITY"});//must receive

            CardConsultationData simpleCard6 = instantiateOneCardConsultationData();
            configureRecipientReferencesAndStartDate(simpleCard6, "", now,
                    null, null);//must not receive

            StepVerifier.create(repository.save(simpleCard1))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(cardRoutes).isNotNull();
            webTestClient.get().uri("/cards/{id}", simpleCard1.getId()).exchange()
                    .expectStatus().isOk()
                    .expectBody(CardConsultationData.class).value(card -> {
                assertThat(card)
                        //This is necessary because empty lists are ignored in the returned JSON
                        .usingComparatorForFields(new EmptyListComparator<String>(),
                                "tags", "details", "userRecipients","orphanedUsers")
                        .isEqualToComparingFieldByFieldRecursively(simpleCard1);
            });

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
                    .expectBody(CardConsultationData.class).value(card -> {
                assertThat(card)
                        //This is necessary because empty lists are ignored in the returned JSON
                        .usingComparatorForFields(new EmptyListComparator<String>(),
                                "tags", "details", "userRecipients","orphanedUsers")
                        .isEqualToComparingFieldByFieldRecursively(simpleCard4);
            });

            StepVerifier.create(repository.save(simpleCard5))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(cardRoutes).isNotNull();
            webTestClient.get().uri("/cards/{id}", simpleCard5.getId()).exchange()
                    .expectStatus().isOk()
                    .expectBody(CardConsultationData.class).value(card -> {
                assertThat(card)
                        //This is necessary because empty lists are ignored in the returned JSON
                        .usingComparatorForFields(new EmptyListComparator<String>(),
                                "tags", "details", "userRecipients","orphanedUsers")
                        .isEqualToComparingFieldByFieldRecursively(simpleCard5);
            });

            StepVerifier.create(repository.save(simpleCard6))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(cardRoutes).isNotNull();
            webTestClient.get().uri("/cards/{id}", simpleCard6.getId()).exchange()
                    .expectStatus().isNotFound();
        }

    }
}
