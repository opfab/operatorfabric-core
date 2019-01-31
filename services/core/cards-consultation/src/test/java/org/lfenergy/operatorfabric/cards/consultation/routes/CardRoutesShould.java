/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.routes;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.consultation.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.cards.consultation.config.webflux.CardRoutesConfig;
import org.lfenergy.operatorfabric.cards.consultation.model.CardConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.repositories.CardRepository;
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
import static org.lfenergy.operatorfabric.cards.consultation.TestUtilities.createSimpleCard;

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

    @AfterAll
    public void cleanCardRepository(){
        repository.deleteAll().subscribe();

    }
    @Test
    public void respondOkIfOptions(){
        assertThat(cardRoutes).isNotNull();
        webTestClient.options().uri("/cards/id").exchange()
                .expectStatus().isOk();
    }

    @Test
    public void respondNotFound(){
        assertThat(cardRoutes).isNotNull();
        webTestClient.get().uri("/cards/id").exchange()
                .expectStatus().isNotFound();
    }

    @Test
    public void findOutCard(){
        CardConsultationData simpleCard = createSimpleCard(1, Instant.now(), Instant.now(), Instant.now().plusSeconds(3600));
        StepVerifier.create(repository.save(simpleCard))
                .expectNextCount(1)
                .expectComplete()
                .verify();
        assertThat(cardRoutes).isNotNull();
        webTestClient.get().uri("/cards/{id}",simpleCard.getId()).exchange()
                .expectStatus().isOk()
        .expectBody(CardConsultationData.class).value(card->{
            assertThat(card).isEqualToComparingFieldByFieldRecursively(simpleCard);
        });
    }
}
