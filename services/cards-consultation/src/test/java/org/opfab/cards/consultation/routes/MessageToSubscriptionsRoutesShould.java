/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.routes;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.cards.consultation.application.IntegrationTestApplication;
import org.opfab.cards.consultation.configuration.webflux.MessageToSubscriptionsRoutesConfig;
import org.opfab.cards.consultation.controllers.CardOperationsController;
import org.opfab.cards.consultation.services.CardSubscriptionService;
import org.opfab.springtools.configuration.test.UserServiceCacheTestApplication;
import org.opfab.springtools.configuration.test.WithMockOpFabUserReactive;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;


@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = { IntegrationTestApplication.class,
        CardSubscriptionService.class, MessageToSubscriptionsRoutesConfig.class, CardOperationsController.class,
        UserServiceCacheTestApplication.class,  }, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@ActiveProfiles(profiles = { "native", "test" })
@Slf4j
class MessageToSubscriptionsRoutesShould {

    @Autowired
    private WebTestClient webTestClient;
    @Autowired
    private CardSubscriptionService service;

    public MessageToSubscriptionsRoutesShould() {}

    @BeforeEach
    public void clearSubscriptions() {
        service.clearSubscriptions();
    }

    @Nested
    @WithMockOpFabUserReactive(login = "userWithGroup", roles = { "ADMIN" })
    class MessageToSubscriptionsRoutesForAdminShould {

        @Test
        void postMessageToSubscriptions() {
            webTestClient.post()
                    .uri("/messageToSubscriptions")
                    .body(Mono.just("RELOAD"), String.class)
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody().isEmpty();
        }
    }

    @Nested
    @WithMockOpFabUserReactive(login = "userWithGroup", roles = { "TEST" })
    class MessageToSubscriptionsRoutesForNonAdminShould {

        @Test
        void postMessageToSubscriptions() {
            webTestClient.post()
                    .uri("/messageToSubscriptions")
                    .body(Mono.just("RELOAD"), String.class)
                    .exchange()
                    .expectStatus().isForbidden();
        }
    }
}
