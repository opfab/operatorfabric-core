/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
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
            ArchivedCardConsultationData simpleCard = createSimpleArchivedCard(1, publisher, Instant.now(), Instant.now(), Instant.now().plusSeconds(3600),"userWithGroup");
            StepVerifier.create(repository.save(simpleCard))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();
            assertThat(archivedCardRoutes).isNotNull();
            webTestClient.get().uri("/archives/{id}", simpleCard.getId()).exchange()
                    .expectStatus().isOk()
                    .expectBody(ArchivedCardConsultationData.class).value(card -> {
                assertThat(card).isEqualToComparingFieldByFieldRecursively(simpleCard);
            });
        }
    }

    @Nested
    @WithMockOpFabUser(login="userWithNoGroup", roles = {})
    public class GivenUserWithNoGroupCardRoutesShould {

        @Test
        public void respondOkIfOptions(){
            assertThat(archivedCardRoutes).isNotNull();
            webTestClient.options().uri("/archives/id").exchange()
                    .expectStatus().isOk();
        }

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
}
