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
import org.lfenergy.operatorfabric.cards.consultation.configuration.webflux.ArchivedCardRoutesConfig;
import org.lfenergy.operatorfabric.cards.consultation.model.ArchivedCardConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.repositories.ArchivedCardRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.lfenergy.operatorfabric.cards.consultation.TestUtilities.createSimpleArchivedCard;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {IntegrationTestApplication.class, ArchivedCardRoutesConfig.class}, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@ActiveProfiles(profiles = {"native", "test"})
@Tag("end-to-end")
@Tag("mongo")
@Slf4j
public class ArchivedCardRoutesShould {

    private static String publisher = "PUBLISHER";

    @Autowired
    private WebTestClient webTestClient;
    @Autowired
    private RouterFunction<ServerResponse> archivedCardRoutes;
    @Autowired
    private ArchivedCardRepository repository;

    @AfterEach
    public void cleanArchivedCardRepository(){
        repository.deleteAll().subscribe();

    }

    @Nested
    @WithMockOpFabUser(login="userWithGroup", roles = {"SOME_GROUP"})
    public class GivenUserWithGroupArchivedCardRoutesShould {

        @Test
        public void respondOkIfOptions() {
            assertThat(archivedCardRoutes).isNotNull();
            webTestClient.options().uri("/archives/id").exchange()
                    .expectStatus().isOk();
        }

        @Test
        public void respondNotFound() {
            assertThat(archivedCardRoutes).isNotNull();
            webTestClient.get().uri("/archives/id").exchange()
                    .expectStatus().isNotFound();
        }

        @Test
        public void findArchivedCardById() {
            ArchivedCardConsultationData simpleCard = createSimpleArchivedCard(1, publisher, Instant.now(), Instant.now(), Instant.now().plusSeconds(3600),"userWithGroup", null,null);
            StepVerifier.create(repository.save(simpleCard))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(archivedCardRoutes).isNotNull();
            webTestClient.get().uri("/archives/{id}", simpleCard.getId()).exchange()
                    .expectStatus().isOk()
                    .expectBody(ArchivedCardConsultationData.class).value(card -> {
                assertThat(card)
                        //This is necessary because empty lists are ignored in the returned JSON
                        .usingComparatorForFields(new EmptyListComparator<String>(), "tags", "details", "userRecipients", "groupRecipients", "timeSpans")
                        .isEqualToComparingFieldByFieldRecursively(simpleCard);
            });
        }
    }

    @Nested
    @WithMockOpFabUser(login="userWithNoGroup", roles = {})
    public class GivenUserWithNoGroupArchivedCardRoutesShould {

        @Test
        public void findOutCard(){
            ArchivedCardConsultationData simpleCard = createSimpleArchivedCard(1, publisher, Instant.now(), Instant.now(), Instant.now().plusSeconds(3600));
            StepVerifier.create(repository.save(simpleCard))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(archivedCardRoutes).isNotNull();
            webTestClient.get().uri("/archives/{id}",simpleCard.getId()).exchange()
                    .expectStatus().isForbidden()
            ;
        }

    }

    @Nested
    @WithMockOpFabUser(login="userWithGroupAndEntity", roles={"SOME_GROUP"}, entities={"SOME_ENTITY"})
    public class GivenUserWithGroupAndEntityArchivedCardRoutesShould {

        @Test
        public void findArchivedCardById() {

            ArchivedCardConsultationData simpleCard1 = createSimpleArchivedCard(1, publisher, Instant.now(),
                    Instant.now(), Instant.now().plusSeconds(3600), "",
                    new String[]{"OTHER_GROUP", "SOME_GROUP"}, new String[]{"OTHER_ENTITY", "SOME_ENTITY"});//must receive

            ArchivedCardConsultationData simpleCard2 = createSimpleArchivedCard(1, publisher, Instant.now(),
                    Instant.now(), Instant.now().plusSeconds(3600), "",
                    new String[]{"OTHER_GROUP", "SOME_GROUP"}, new String[]{"OTHER_ENTITY"});//must not receive

            ArchivedCardConsultationData simpleCard3 = createSimpleArchivedCard(1, publisher, Instant.now(),
                    Instant.now(), Instant.now().plusSeconds(3600), "",
                    new String[]{"OTHER_GROUP"}, new String[]{"OTHER_ENTITY", "SOME_ENTITY"});//must not receive

            ArchivedCardConsultationData simpleCard4 = createSimpleArchivedCard(1, publisher, Instant.now(),
                    Instant.now(), Instant.now().plusSeconds(3600), "",
                    new String[]{"OTHER_GROUP", "SOME_GROUP"}, null);//must receive

            ArchivedCardConsultationData simpleCard5 = createSimpleArchivedCard(1, publisher, Instant.now(),
                    Instant.now(), Instant.now().plusSeconds(3600), "",
                    null, new String[]{"OTHER_ENTITY", "SOME_ENTITY"});//must not receive (because the user doesn't have the right for process/state)

            ArchivedCardConsultationData simpleCard6 = createSimpleArchivedCard(1, publisher, Instant.now(),
                    Instant.now(), Instant.now().plusSeconds(3600), "",
                    null, null);//must not receive

            StepVerifier.create(repository.save(simpleCard1))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(archivedCardRoutes).isNotNull();
            webTestClient.get().uri("/archives/{id}", simpleCard1.getId()).exchange()
                    .expectStatus().isOk()
                    .expectBody(ArchivedCardConsultationData.class).value(card -> {
                assertThat(card)
                        //This is necessary because empty lists are ignored in the returned JSON
                        .usingComparatorForFields(new EmptyListComparator<String>(), "tags", "details", "userRecipients", "groupRecipients", "timeSpans")
                        .isEqualToComparingFieldByFieldRecursively(simpleCard1);
            });

            StepVerifier.create(repository.save(simpleCard2))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(archivedCardRoutes).isNotNull();
            webTestClient.get().uri("/archives/{id}", simpleCard2.getId()).exchange()
                    .expectStatus().isNotFound();

            StepVerifier.create(repository.save(simpleCard3))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(archivedCardRoutes).isNotNull();
            webTestClient.get().uri("/archives/{id}", simpleCard3.getId()).exchange()
                    .expectStatus().isNotFound();

            StepVerifier.create(repository.save(simpleCard4))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(archivedCardRoutes).isNotNull();
            webTestClient.get().uri("/archives/{id}", simpleCard4.getId()).exchange()
                    .expectStatus().isOk()
                    .expectBody(ArchivedCardConsultationData.class).value(card -> {
                assertThat(card)
                        //This is necessary because empty lists are ignored in the returned JSON
                        .usingComparatorForFields(new EmptyListComparator<String>(), "tags", "details", "userRecipients", "groupRecipients", "timeSpans")
                        .isEqualToComparingFieldByFieldRecursively(simpleCard4);
            });

            StepVerifier.create(repository.save(simpleCard5))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(archivedCardRoutes).isNotNull();
            webTestClient.get().uri("/archives/{id}", simpleCard5.getId()).exchange()
                    .expectStatus().isNotFound();

            StepVerifier.create(repository.save(simpleCard6))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(archivedCardRoutes).isNotNull();
            webTestClient.get().uri("/archives/{id}", simpleCard6.getId()).exchange()
                    .expectStatus().isNotFound();
        }
    }
}
