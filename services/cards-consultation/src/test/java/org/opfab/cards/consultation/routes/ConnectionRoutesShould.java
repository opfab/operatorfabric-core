/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
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
import org.opfab.cards.consultation.configuration.webflux.ConnectionRoutesConfig;
import org.opfab.cards.consultation.services.CardSubscription;
import org.opfab.cards.consultation.services.CardSubscriptionService;
import org.opfab.springtools.configuration.test.UserServiceCacheTestApplication;
import org.opfab.springtools.configuration.test.WithMockOpFabUserReactive;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerResponse;
import static org.assertj.core.api.Assertions.assertThat;


@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = { IntegrationTestApplication.class, ConnectionRoutesConfig.class,
                CardSubscriptionService.class,
                UserServiceCacheTestApplication.class }, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@ActiveProfiles(profiles = { "native", "test" })
@Slf4j
class ConnectionRoutesShould {

        @Autowired
        private WebTestClient webTestClient;
        @Autowired
        private RouterFunction<ServerResponse> connectionRoutes;
        @Autowired
        private CardSubscriptionService service;

        private CurrentUserWithPerimeters currentUserWithPerimeters;

        public ConnectionRoutesShould() {
                User user = new User();
                user.setLogin("testuser");

                currentUserWithPerimeters = new CurrentUserWithPerimeters();
                currentUserWithPerimeters.setUserData(user);
        }

        
        @BeforeEach
        public void clearSubscriptions() {
                service.clearSubscriptions();
        }

        @Nested
        @WithMockOpFabUserReactive(login = "userWithGroup", roles = { "ADMIN" })
        public class ConnectionRoutesForAdminShould {
                @Test
                void respondOk() {
                        assertThat(connectionRoutes).isNotNull();
                        webTestClient.get().uri("/connections").exchange().expectStatus().isOk();
                }

                @Test
                void respondWithNoUSerConnectedIsEmpty() {
                        assertThat(connectionRoutes).isNotNull();
                        webTestClient.get().uri("/connections").exchange().expectStatus().isOk()
                                        .expectBody()
                                        .jsonPath("$[0]").doesNotExist();
                } 


                @Test
                void respondWithOneUserConnected() {
                        CardSubscription subscription = service.subscribe(currentUserWithPerimeters, "test");
                        subscription.getPublisher().subscribe(log::info);
                        webTestClient.get().uri("/connections").exchange().expectStatus().isOk()
                                        .expectBody()
                                        .jsonPath("$[0].login").isEqualTo("testuser");
                } 

                @Test
                void respondWithThreeUserConnected() {
                        service.subscribe(currentUserWithPerimeters, "test").getPublisher().subscribe(log::info);
                        service.subscribe(currentUserWithPerimeters, "test2").getPublisher().subscribe(log::info);
                        service.subscribe(currentUserWithPerimeters, "test3").getPublisher().subscribe(log::info);
                        webTestClient.get().uri("/connections").exchange().expectStatus().isOk()
                                        .expectBody()
                                        .jsonPath("$[0].login").isEqualTo("testuser")
                                        .jsonPath("$[1].login").isEqualTo("testuser")
                                        .jsonPath("$[2].login").isEqualTo("testuser");
                                        
                } 
        }

        @Nested
        @WithMockOpFabUserReactive(login = "userWithGroup", roles = { "TEST" })
        class ConnectionRoutesForNonAdminShould {
                @Test
                void accessIsAuthorized() {
                        assertThat(connectionRoutes).isNotNull();
                        webTestClient.get().uri("/connections").exchange().expectStatus().isOk();
                }
        }

}
