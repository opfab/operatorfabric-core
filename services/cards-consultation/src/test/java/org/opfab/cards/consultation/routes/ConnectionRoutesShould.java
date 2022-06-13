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
import org.json.JSONException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
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
import org.springframework.test.web.reactive.server.FluxExchangeResult;
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

        private static final String USER_LOGIN = "testuser";

        @Autowired
        private WebTestClient webTestClient;
        @Autowired
        private RouterFunction<ServerResponse> connectionRoutes;
        @Autowired
        private CardSubscriptionService service;

        private CurrentUserWithPerimeters currentUserWithPerimeters;

        public ConnectionRoutesShould() {
                currentUserWithPerimeters = createUserWithPerimeter(USER_LOGIN);
        }

        
        @BeforeEach
        public void clearSubscriptions() {
                service.clearSubscriptions();
        }

        @Nested
        @WithMockOpFabUserReactive(login = "userWithGroup", roles = { "ADMIN" })
        class ConnectionRoutesForAdminShould {
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
                void respondWithNoUSerConnectedIsEmptyAfterDeleteSubscription() {
                        CardSubscription subscription = service.subscribe(currentUserWithPerimeters, "test");
                        subscription.getPublisher().subscribe(log::info);
                        webTestClient.get().uri("/connections").exchange().expectStatus().isOk()
                                .expectBody()
                                .jsonPath("$[0].login").isEqualTo(USER_LOGIN);

                        service.deleteSubscription(USER_LOGIN, "test");

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
                                        .jsonPath("$[0].login").isEqualTo(USER_LOGIN);
                }

                @Test
                void shouldDetectThatAUserIsAlreadyConnected() {
                        // Force the service to check whether a user is already connected
                        CardSubscriptionService subscriptionSpy = Mockito.spy(service);
                        Mockito.when(subscriptionSpy.mustCheckIfUserIsAlreadyConnected()).thenReturn(true);

                        Assertions.assertFalse(subscriptionSpy.willDisconnectAnExistingSubscriptionWhenLoggingIn(USER_LOGIN));
                        subscriptionSpy.subscribe(currentUserWithPerimeters, "test");
                        Assertions.assertTrue(subscriptionSpy.willDisconnectAnExistingSubscriptionWhenLoggingIn(USER_LOGIN));

                        // Simulate a log off
                        subscriptionSpy.evictSubscription(CardSubscription.computeSubscriptionId(USER_LOGIN, "test"));

                        Assertions.assertFalse(subscriptionSpy.willDisconnectAnExistingSubscriptionWhenLoggingIn(USER_LOGIN));
                }

                @Test
                void shouldNotDetectThatAUserIsAlreadyConnectedWhenOptionIsDisabled() {
                        // Force the service not to check whether a user is already connected
                        CardSubscriptionService subscriptionSpy = Mockito.spy(service);
                        Mockito.when(subscriptionSpy.mustCheckIfUserIsAlreadyConnected()).thenReturn(false);

                        Assertions.assertFalse(subscriptionSpy.willDisconnectAnExistingSubscriptionWhenLoggingIn(USER_LOGIN));
                        subscriptionSpy.subscribe(currentUserWithPerimeters, "test");
                        Assertions.assertFalse(subscriptionSpy.willDisconnectAnExistingSubscriptionWhenLoggingIn(USER_LOGIN));

                        // Simulate a log off
                        subscriptionSpy.evictSubscription(CardSubscription.computeSubscriptionId(USER_LOGIN, "test"));

                        Assertions.assertFalse(subscriptionSpy.willDisconnectAnExistingSubscriptionWhenLoggingIn(USER_LOGIN));
                }

                @Test
                void respondWithThreeUserConnected() throws JSONException {
                        service.subscribe(currentUserWithPerimeters, "test").getPublisher().subscribe(log::info);
                        service.subscribe(createUserWithPerimeter("testuser2"), "test2").getPublisher().subscribe(log::info);
                        service.subscribe(createUserWithPerimeter("testuser3"), "test3").getPublisher().subscribe(log::info);

                        String[] expectedUsers = {"{\"login\":\"testuser\",\"entitiesConnected\":null,\"groups\":[\"testgroup1\"]}",
                                                  "{\"login\":\"testuser2\",\"entitiesConnected\":null,\"groups\":[\"testgroup1\"]}",
                                                  "{\"login\":\"testuser3\",\"entitiesConnected\":null,\"groups\":[\"testgroup1\"]}"};

                        webTestClient.get().uri("/connections").exchange().expectStatus().isOk();

                        FluxExchangeResult<String> request =  webTestClient.get().uri("/connections").exchange().returnResult(String.class);
                        String actualJson = extractResponseJsonFromRequest(request);

                        int actualUsersCount = actualJson.split("\"login\":").length - 1;
                        Assertions.assertEquals(3, actualUsersCount);
                        for (String currentUser : expectedUsers) {
                                Assertions.assertTrue(actualJson.contains(currentUser));
                        }

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


        private CurrentUserWithPerimeters createUserWithPerimeter(String userLogin) {
                User user = new User();
                user.setLogin(userLogin);

                CurrentUserWithPerimeters userWithPerimeters = new CurrentUserWithPerimeters();
                userWithPerimeters.setUserData(user);
                return userWithPerimeters;
        }

        private String extractResponseJsonFromRequest(FluxExchangeResult<String> request) {
                Object[] responseBodyArray = request.getResponseBody().toStream().toArray();
                return (String) responseBodyArray[0];
        }
}
