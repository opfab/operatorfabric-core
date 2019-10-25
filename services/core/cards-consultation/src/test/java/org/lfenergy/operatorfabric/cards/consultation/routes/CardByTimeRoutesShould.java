package org.lfenergy.operatorfabric.cards.consultation.routes;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.consultation.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.cards.consultation.configuration.webflux.CardByTimeRoutesConfig;
import org.lfenergy.operatorfabric.cards.consultation.model.CardConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.model.I18nConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.model.Recipient;
import org.lfenergy.operatorfabric.cards.consultation.model.RecipientConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.repositories.CardRepository;
import org.lfenergy.operatorfabric.cards.model.RecipientEnum;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.lfenergy.operatorfabric.springtools.configuration.test.WithMockOpFabUser;
import org.lfenergy.operatorfabric.users.model.User;
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

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {IntegrationTestApplication.class, CardByTimeRoutesConfig.class},
webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@ActiveProfiles(profiles = {"native","test"})
@Tag("end-to-end")
@Tag("mongo")
@Slf4j
public class CardByTimeRoutesShould {

    private static String PUBLISHER = "PUBLISHER";

    @Autowired
    private WebTestClient webTestClient;
    @Autowired
    private RouterFunction<ServerResponse> cardTimeRoutes;
    @Autowired
    private CardRepository repository;

    @AfterEach
    public void cleanArchivedCardRepository(){
        repository.deleteAll().subscribe();

    }

    @Nested
    @WithMockOpFabUser(login="userWithGroup",roles={"SOME_GROUP"})
    public class GivenUserWithGroupCardByTimeRoutesShould {

        @Test
        public void respondOkForOptionCalls(){
            assertThat(cardTimeRoutes).isNotNull();
            webTestClient.options().uri("/{millisTime}/next",System.currentTimeMillis()).exchange()
                    .expectStatus().isOk();
        }
        @Test
        public void respondNotFound(){
            // repository is empty so no card can be found
            assertThat(cardTimeRoutes).isNotNull();
            webTestClient.get().uri("/{millisTime}/next",System.currentTimeMillis()).exchange()
                    .expectStatus().isNotFound();
        }
        @Test
        public void findNextCard_ForCurrentUser(){
            Instant now = Instant.now();
            Instant inOneHour = now.plus(1,ChronoUnit.HOURS);

            Recipient userAsRecipient = RecipientConsultationData.builder()
                    .type(RecipientEnum.USER)
                    .identity("userWithGroup")
                    .build();
            CardConsultationData cardForUserStartingInOnHourFromNow = CardConsultationData
                    .builder()
                    .publisher("total")
                    .publisherVersion("the most recent")
                    .processId("turlututu-chapeau-pointu")
                    .process("current-proocess")
                    .title(new I18nConsultationData())
                    .summary(new I18nConsultationData())
                    .severity(SeverityEnum.ACTION)
                    .publishDate(now)
                    .startDate(inOneHour)
                    .recipient(userAsRecipient)
                    .build();

            StepVerifier.create(repository.save(cardForUserStartingInOnHourFromNow))
                    .expectNextCount(1)
                    .expectComplete()
                    .verify();

            // verify that card is found…

        }

        public void findNextCardInFuture_WithUser_When_anotherCardExistsBeforeTheOneForCurrentUser(){
            // create two card in the future for 2 different users
            // card for another user in the future but nearer than the one for the user
            Instant now = Instant.now();
            Instant inOneMinute = now.plus(1, ChronoUnit.MINUTES);
            Instant inOneHour = now.plus(1,ChronoUnit.HOURS);
            CardConsultationData cardInNearFutureForAnotherUser;
            CardConsultationData cardInFarFutureForCurrentUser;


            // card in the future for the user
            // call api
        }
    }

}
