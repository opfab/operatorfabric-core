/* Copyright (c) 2020, RTE (http://www.rte-france.com)
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
import org.lfenergy.operatorfabric.cards.consultation.TestUtilities;
import org.lfenergy.operatorfabric.cards.consultation.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.cards.consultation.configuration.webflux.CardByTimeRoutesConfig;
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
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.lfenergy.operatorfabric.cards.consultation.TestUtilities.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {IntegrationTestApplication.class, CardByTimeRoutesConfig.class},
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@ActiveProfiles(profiles = {"native", "test"})
@Tag("end-to-end")
@Tag("mongo")
@Slf4j
public class CardByTimeRoutesShould {

    @Autowired
    private WebTestClient webTestClient;
    @Autowired
    private RouterFunction<ServerResponse> cardTimeRoutes;
    @Autowired
    private CardRepository repository;

    @AfterEach
    public void cleanArchivedCardRepository() {
        repository.deleteAll().subscribe();
    }

    @Nested
    @WithMockOpFabUser(login = "userWithGroup", roles = {"SOME_GROUP"})
    public class GivenUserWithGroup_CardByTimeRoutes_Next_Should {


        public static final String NEXT_URI = "/{millisTime}/next";

        @Test
        public void respondOkForOptionCalls() {
            assertThat(cardTimeRoutes).isNotNull();
            webTestClient.options().uri(NEXT_URI, System.currentTimeMillis()).exchange()
                    .expectStatus().isOk();
        }

        @Test
        public void respondNotFound() {
            // repository is empty so no card can be found
            assertThat(cardTimeRoutes).isNotNull();
            webTestClient.get().uri(NEXT_URI, System.currentTimeMillis()).exchange()
                    .expectStatus().isNotFound();
        }

        @Test
        public void findNextCard_ForCurrentUser() {
            Instant now = Instant.now();
            Instant inOneHour = now
                    .plus(1, ChronoUnit.HOURS);
            CardConsultationData cardForUserStartingInOneHourFromNow =instantiateOneCardConsultationData();

            configureRecipientReferencesAndStartDate(cardForUserStartingInOneHourFromNow, "userWithGroup"
                    , inOneHour
                    , "WITH GROUP", "SOME_GROUP");

            StepVerifier.create(repository.save(cardForUserStartingInOneHourFromNow))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();

            assertThat(cardTimeRoutes).isNotNull();
            // verify that card is found…
            webTestClient.get()
                    .uri(NEXT_URI, now.plus(2, ChronoUnit.MINUTES).toEpochMilli())
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody(CardConsultationData.class).value(card -> {
                assertThat(card)
                        .usingComparatorForFields(new EmptyListComparator<String>(),
                                "tags",
                                "details",
                                "userRecipients",
                                "recipients",
                                "timeSpans"
                        ).isEqualToComparingFieldByFieldRecursively(cardForUserStartingInOneHourFromNow);
            });
        }

        @Test
        public void findNextCardInFuture_WithUser_When_anotherCardExistsBeforeTheOneForCurrentUser() {
            // create two card in the future for 2 different users
            // card for another user in the future but nearer than the one for the user
            Instant now = Instant.now();
            List<CardConsultationData> twoCards = instantiateSeveralCardConsultationData(2);
            CardConsultationData cardInNearFutureForAnotherUser = twoCards.get(0);
            CardConsultationData cardInFarFutureForCurrentUser = twoCards.get(1);

            configureRecipientReferencesAndStartDate(cardInFarFutureForCurrentUser
                    , "userWithGroup"
                    , now.plus(1, ChronoUnit.HOURS)
                    , "WITH_GROUP", "SOME_GROUP");

            // call api
            configureRecipientReferencesAndStartDate(cardInNearFutureForAnotherUser
                    , "anotherUser"
                    , now.plus(15, ChronoUnit.MINUTES)
                    , "WITH_ANOTHER_GROUP", "ANY_GROUP");

            StepVerifier.create(repository.saveAll(twoCards))
                    .expectNextCount(2)
                    .expectComplete()
                    .verify();

            webTestClient.get()
                    .uri(NEXT_URI, now.plus(20, ChronoUnit.SECONDS).toEpochMilli())
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody(CardConsultationData.class).value(card -> {
                assertThat(card)
                        .usingComparatorForFields(new EmptyListComparator<String>(),
                                "tags",
                                "details",
                                "userRecipients",
                                "recipients",
                                "timeSpans"
                        )
                        .isEqualToComparingFieldByFieldRecursively(cardInFarFutureForCurrentUser);
            });
        }
    }


    @Nested
    @WithMockOpFabUser(login = "userWithGroup", roles = {"SOME_GROUP"})
    public class GivenUserWithGroup_CardByTimeRoutes_Previous_Should {

        public static final String PREVIOUS_URI = "/{millisTime}/previous";

        @Test
        public void respondOkForOptionCalls() {
            assertThat(cardTimeRoutes).isNotNull();
            webTestClient.options().uri(PREVIOUS_URI, System.currentTimeMillis()).exchange()
                    .expectStatus().isOk();
        }

        @Test
        public void respondNotFound() {
            // repository is empty so no card can be found
            assertThat(cardTimeRoutes).isNotNull();
            webTestClient.get().uri(PREVIOUS_URI, System.currentTimeMillis()).exchange()
                    .expectStatus().isNotFound();
        }

        @Test
        public void findPreviousCard_ForCurrentUser() {

            Instant now = Instant.now();
            Instant oneHourAgo = now
                    .minus(1, ChronoUnit.HOURS);
            CardConsultationData cardForUserStartingOneHourBeforeNow = instantiateOneCardConsultationData();

            configureRecipientReferencesAndStartDate(cardForUserStartingOneHourBeforeNow, "userWithGroup"
                    , oneHourAgo
                    , "WITH GROUP", "SOME_GROUP");

            StepVerifier.create(repository.save(cardForUserStartingOneHourBeforeNow))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();

            assertThat(cardTimeRoutes).isNotNull();
            // verify that card is found…
            webTestClient.get()
                    .uri(PREVIOUS_URI, now.minus(2, ChronoUnit.MINUTES).toEpochMilli())
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody(CardConsultationData.class).value(card -> {
                assertThat(card)
                        .usingComparatorForFields(new EmptyListComparator<String>(),
                                "tags",
                                "details",
                                "userRecipients",
                                "recipients",
                                "timeSpans"
                        ).isEqualToComparingFieldByFieldRecursively(cardForUserStartingOneHourBeforeNow);
            });
        }

        @Test
        public void findCardInPast_WithCurrentUser_When_anotherCardExistAfterButForADifferentUser() {

            // create two card in the future for 2 different users
            // card for another user in the future but nearer than the one for the user
            Instant now = Instant.now();
            List<CardConsultationData> twoCards = instantiateSeveralCardConsultationData(2);
            CardConsultationData cardInNearPastForAnotherUser = twoCards.get(0);
            CardConsultationData cardInFarePastForCurrentUser = twoCards.get(1);

            configureRecipientReferencesAndStartDate(cardInFarePastForCurrentUser
                    , "userWithGroup"
                    , now.minus(1, ChronoUnit.HOURS)
                    , "WITH_GROUP", "SOME_GROUP");

            // call api
            configureRecipientReferencesAndStartDate(cardInNearPastForAnotherUser
                    , "anotherUser"
                    , now.minus(15, ChronoUnit.MINUTES)
                    , "WITH_ANOTHER_GROUP", "ANY_GROUP");

            StepVerifier.create(repository.saveAll(twoCards))
                    .expectNextCount(2)
                    .expectComplete()
                    .verify();

            webTestClient.get()
                    .uri(PREVIOUS_URI, now.minus(20, ChronoUnit.SECONDS).toEpochMilli())
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody(CardConsultationData.class).value(card -> {
                assertThat(card)
                        .usingComparatorForFields(new EmptyListComparator<String>(),
                                "tags",
                                "details",
                                "userRecipients",
                                "recipients",
                                "timeSpans"
                        )
                        .isEqualToComparingFieldByFieldRecursively(cardInFarePastForCurrentUser);
            });
        }
    }


}
