package org.lfenergy.operatorfabric.cards.publication.controllers;

import static org.hamcrest.Matchers.hasProperty;
import static org.hamcrest.Matchers.is;

import java.util.List;

import org.assertj.core.api.Assertions;
import org.jeasy.random.EasyRandom;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.publication.CardPublicationApplication;
import org.lfenergy.operatorfabric.cards.publication.model.CardCreationReportData;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.springtools.configuration.test.WithMockOpFabUser;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import lombok.extern.slf4j.Slf4j;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = CardPublicationApplication.class)
@AutoConfigureWebTestClient
@ActiveProfiles(profiles = { "native", "test" })
@Slf4j
@Tag("end-to-end")
@Tag("mongo")
@WithMockOpFabUser(login = "someUser", roles = { "AROLE" })
@TestInstance(Lifecycle.PER_CLASS)
public class CardControllerProcessAcknoledgementShould extends CardControllerShouldBase {

	String cardId;
	int cardNumber = 1;

	@BeforeAll
	void setup() {
		EasyRandom randomGenerator = instantiateEasyRandom();
		List<CardPublicationData> cardsInRepository = instantiateCardPublicationData(randomGenerator, cardNumber);
		cardId = cardsInRepository.get(0).getId();
		cardRepository.saveAll(cardsInRepository).subscribe();
	}
	
	@AfterAll
	void clean() {
		cardRepository.deleteAll().subscribe();        
	}

	@Test
	void processUserAcknowledgement() throws Exception {

		Assertions.assertThat(cardRepository.count().block()).isEqualTo(cardNumber);
		CardPublicationData card = cardRepository.findById(cardId).block();
		int initialNumOfAcks = card.getUsersAcks() != null ? card.getUsersAcks().size() : 0;
		webTestClient.post().uri("/cards/" + cardId + "/userAcknowledgement").exchange().expectStatus().isCreated()
				.expectBody(CardCreationReportData.class).value(hasProperty("count", is(1)));
		card = cardRepository.findById(cardId).block();
		Assertions.assertThat(card.getUsersAcks()).contains("someUser");
		Assertions.assertThat(card.getUsersAcks().size()).isEqualTo(initialNumOfAcks + 1);
	}

	@Nested
	@WithMockOpFabUser(login = "someOtherUser", roles = { "AROLE" })
	@TestInstance(Lifecycle.PER_CLASS)
	class ProcessUserAcknowledgementNested {
		@Test
		void processUserAcknowledgement() throws Exception {

			Assertions.assertThat(cardRepository.count().block()).isEqualTo(cardNumber);
			CardPublicationData card = cardRepository.findById(cardId).block();
			int initialNumOfAcks = card.getUsersAcks() != null ? card.getUsersAcks().size() : 0;
			webTestClient.post().uri("/cards/" + cardId + "/userAcknowledgement").exchange().expectStatus().isCreated()
					.expectBody(CardCreationReportData.class).value(hasProperty("count", is(1)));
			card = cardRepository.findById(cardId).block();
			Assertions.assertThat(card.getUsersAcks()).contains("someUser", "someOtherUser");
			Assertions.assertThat(card.getUsersAcks().size()).isEqualTo(initialNumOfAcks + 1);

		}

		@Nested
		@WithMockOpFabUser(login = "someUser", roles = { "AROLE" })
		@TestInstance(Lifecycle.PER_CLASS)
		class ProcessUserAcknowledgementNestedTwice {

			@Test
			void processUserAcknowledgement() throws Exception {

				Assertions.assertThat(cardRepository.count().block()).isEqualTo(cardNumber);
				CardPublicationData card = cardRepository.findById(cardId).block();
				int initialNumOfAcks = card.getUsersAcks() != null ? card.getUsersAcks().size() : 0;
				webTestClient.post().uri("/cards/" + cardId + "/userAcknowledgement").exchange().expectStatus().isOk()
						.expectBody(CardCreationReportData.class).value(hasProperty("count", is(0)));
				card = cardRepository.findById(cardId).block();
				Assertions.assertThat(card.getUsersAcks()).contains("someUser", "someOtherUser");
				Assertions.assertThat(card.getUsersAcks().size()).isEqualTo(initialNumOfAcks);
			}
		}
	}

}
