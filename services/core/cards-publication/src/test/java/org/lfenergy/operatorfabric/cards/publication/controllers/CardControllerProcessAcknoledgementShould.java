package org.lfenergy.operatorfabric.cards.publication.controllers;

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
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.springtools.configuration.test.WithMockOpFabUser;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.ExampleMatcher.GenericPropertyMatchers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import lombok.extern.slf4j.Slf4j;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = CardPublicationApplication.class)
@AutoConfigureWebTestClient(timeout = "100000")//100 seconds
@ActiveProfiles(profiles = { "native", "test" })
@Slf4j
@Tag("end-to-end")
@Tag("mongo")
@WithMockOpFabUser(login = "someUser", roles = { "AROLE" })
@TestInstance(Lifecycle.PER_CLASS)
public class CardControllerProcessAcknoledgementShould extends CardControllerShouldBase {

	String cardUid;
	String cardNeverContainsAcksUid;
	int cardNumber = 2;

	@BeforeAll
	void setup() {
		EasyRandom randomGenerator = instantiateEasyRandom();
		List<CardPublicationData> cardsInRepository = instantiateCardPublicationData(randomGenerator, cardNumber);
		cardUid = cardsInRepository.get(0).getUid();
		cardNeverContainsAcksUid = cardsInRepository.get(1).getUid();
		cardsInRepository.get(1).setUsersAcks(null);
		cardRepository.saveAll(cardsInRepository).subscribe();
	}

	@AfterAll
	void clean() {
		cardRepository.deleteAll().subscribe();
	}
	
	@Test
	void processUserAcknowledgementOfUnexistingCard() throws Exception {
		String cardUid = "NotExistingCardUid";		
		CardPublicationData card = cardRepository.findByUid(cardUid).block();
		Assertions.assertThat(card).isNull();
		webTestClient.post().uri("/cards/userAcknowledgement/" + cardUid).exchange().expectStatus().isNotFound().expectBody().isEmpty();		
	}
	
	@Test
	void deleteUserAcknowledgementOfUnexistingCard() throws Exception {
		String cardUid = "NotExistingCardUid";
		CardPublicationData card = cardRepository.findByUid(cardUid).block();
		Assertions.assertThat(card).isNull();
		webTestClient.delete().uri("/cards/userAcknowledgement/" + cardUid).exchange().expectStatus().isNotFound().expectBody().isEmpty();		
	}

	@Test
	void processUserAcknowledgement() throws Exception {

		Assertions.assertThat(cardRepository.count().block()).isEqualTo(cardNumber);
		CardPublicationData card = cardRepository.findByUid(cardUid).block();
		int initialNumOfAcks = card.getUsersAcks() != null ? card.getUsersAcks().size() : 0;
		webTestClient.post().uri("/cards/userAcknowledgement/" + cardUid).exchange().expectStatus().isCreated().expectBody().isEmpty();
		card = cardRepository.findByUid(cardUid).block();
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
			CardPublicationData card = cardRepository.findByUid(cardUid).block();
			int initialNumOfAcks = card.getUsersAcks() != null ? card.getUsersAcks().size() : 0;
			webTestClient.post().uri("/cards/userAcknowledgement/" + cardUid).exchange().expectStatus().isCreated()
					.expectBody().isEmpty();
			card = cardRepository.findByUid(cardUid).block();
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
				CardPublicationData card = cardRepository.findByUid(cardUid).block();
				int initialNumOfAcks = card.getUsersAcks() != null ? card.getUsersAcks().size() : 0;
				webTestClient.post().uri("/cards/userAcknowledgement/" + cardUid).exchange().expectStatus().isOk()
						.expectBody().isEmpty();
				card = cardRepository.findByUid(cardUid).block();
				Assertions.assertThat(card.getUsersAcks()).contains("someUser", "someOtherUser");
				Assertions.assertThat(card.getUsersAcks().size()).isEqualTo(initialNumOfAcks);
			}

			@Nested
			@WithMockOpFabUser(login = "someUser", roles = { "AROLE" })
			@TestInstance(Lifecycle.PER_CLASS)
			class ProcessDeleteUserAcknowledgement {

				@Test
				void processUserAcknowledgement() throws Exception {

					Assertions.assertThat(cardRepository.count().block()).isEqualTo(cardNumber);
					CardPublicationData card = cardRepository.findByUid(cardUid).block();
					Assertions.assertThat(card.getUsersAcks()).contains("someUser");
					int initialNumOfAcks = card.getUsersAcks().size();
					webTestClient.delete().uri("/cards/userAcknowledgement/" + cardUid).exchange().expectStatus()
							.isOk();
					card = cardRepository.findByUid(cardUid).block();
					Assertions.assertThat(card.getUsersAcks()).doesNotContain("someUser");
					Assertions.assertThat(card.getUsersAcks().size()).isEqualTo(initialNumOfAcks - 1);
				}

				@Nested
				@WithMockOpFabUser(login = "someUser", roles = { "AROLE" })
				@TestInstance(Lifecycle.PER_CLASS)
				class ProcessDeleteUserAcknowledgementSecond {

					@Test
					void processUserAcknowledgement() throws Exception {

						Assertions.assertThat(cardRepository.count().block()).isEqualTo(cardNumber);
						CardPublicationData card = cardRepository.findByUid(cardUid).block();
						Assertions.assertThat(card.getUsersAcks()).doesNotContain("someUser");
						int initialNumOfAcks = card.getUsersAcks().size();
						webTestClient.delete().uri("/cards/userAcknowledgement/" + cardUid).exchange()
								.expectStatus().isNoContent();
						card = cardRepository.findByUid(cardUid).block();
						Assertions.assertThat(card.getUsersAcks()).doesNotContain("someUser");
						Assertions.assertThat(card.getUsersAcks().size()).isEqualTo(initialNumOfAcks);
					}

				}

			}
		}
	}

	@Test
	void processDeleteUnexistingUserAcknowledgementFromCardNeverHadOne() throws Exception {
		Assertions.assertThat(cardRepository.count().block()).isEqualTo(cardNumber);
		CardPublicationData card = cardRepository.findByUid(cardNeverContainsAcksUid).block();
		Assertions.assertThat(card.getUsersAcks()).isNullOrEmpty();
		webTestClient.delete().uri("/cards/userAcknowledgement/" + cardUid).exchange().expectStatus().isNoContent();
		card = cardRepository.findByUid(cardNeverContainsAcksUid).block();
		Assertions.assertThat(card.getUsersAcks()).isNullOrEmpty();
	}
	
}
