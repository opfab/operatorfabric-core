package org.lfenergy.operatorfabric.cards.publication.controllers;

import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.jeasy.random.EasyRandom;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.publication.CardPublicationApplication;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.services.CardProcessingService;
import org.lfenergy.operatorfabric.springtools.configuration.test.WithMockOpFabUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import reactor.test.StepVerifier;

import java.util.List;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = CardPublicationApplication.class)
@AutoConfigureWebTestClient(timeout = "100000")//100 seconds
@ActiveProfiles(profiles = { "native", "test" })
@Slf4j
@Tag("end-to-end")
@Tag("mongo")
@WithMockOpFabUser(login = "someUser", roles = { "AROLE" })
@TestInstance(Lifecycle.PER_CLASS)
public class CardControllerProcessUserReadShould extends CardControllerShouldBase {

	String cardUid;
	String cardNeverContainsReadsUid;
	int cardNumber = 2;
	@Autowired
	private CardProcessingService cardProcessingService;


	@BeforeAll
	void setup() {
		EasyRandom randomGenerator = instantiateEasyRandom();
		List<CardPublicationData> cardsInRepository = instantiateCardPublicationData(randomGenerator, cardNumber);
		cardUid = cardsInRepository.get(0).getUid();
		cardNeverContainsReadsUid = cardsInRepository.get(1).getUid();
		cardsInRepository.get(1).setUsersReads(null);
		StepVerifier.create(cardRepository.saveAll(cardsInRepository))
				.expectNextCount(cardNumber).verifyComplete();
	}

	@AfterAll
	void clean() {
		cardRepository.deleteAll().subscribe();
	}
	
	@Test
	void processUserReadOfUnexistingCard() throws Exception {
		String cardUid = "NotExistingCardUid";		
		CardPublicationData card = cardRepository.findByUid(cardUid).block();
		Assertions.assertThat(card).isNull();
		webTestClient.post().uri("/cards/userCardRead/" + cardUid).exchange().expectStatus().isNotFound().expectBody().isEmpty();		
	}

	@Test
	void deleteUserReadOfUnexistingCard() throws Exception {
		String cardUid = "NotExistingCardUid";
		CardPublicationData card = cardRepository.findByUid(cardUid).block();
		Assertions.assertThat(card).isNull();
		webTestClient.delete().uri("/cards/userCardRead/" + cardUid).exchange().expectStatus().isNotFound().expectBody().isEmpty();		
	}
	
	@Test
	void processUserRead() throws Exception {
		Assertions.assertThat(cardRepository.count().block()).isEqualTo(cardNumber);
		CardPublicationData card = cardRepository.findByUid(cardUid).block();
		int initialNumOfReads = card.getUsersReads() != null ? card.getUsersReads().size() : 0;
		webTestClient.post().uri("/cards/userCardRead/" + cardUid).exchange().expectStatus().isCreated().expectBody().isEmpty();
		card = cardRepository.findByUid(cardUid).block();
		Assertions.assertThat(card.getUsersReads()).contains("someUser");
		Assertions.assertThat(card.getUsersReads().size()).isEqualTo(initialNumOfReads + 1);
	}

	@Nested
	@WithMockOpFabUser(login = "someOtherUser", roles = { "AROLE" })
	@TestInstance(Lifecycle.PER_CLASS)
	class ProcessUserReadNested {
		@Test
		void processUserRead() throws Exception {

			Assertions.assertThat(cardRepository.count().block()).isEqualTo(cardNumber);
			CardPublicationData card = cardRepository.findByUid(cardUid).block();
			int initialNumOfReads = card.getUsersReads() != null ? card.getUsersReads().size() : 0;
			webTestClient.post().uri("/cards/userCardRead/" + cardUid).exchange().expectStatus().isCreated()
					.expectBody().isEmpty();
			card = cardRepository.findByUid(cardUid).block();
			Assertions.assertThat(card.getUsersReads()).contains("someUser", "someOtherUser");
			Assertions.assertThat(card.getUsersReads().size()).isEqualTo(initialNumOfReads + 1);

		}

		@Nested
		@WithMockOpFabUser(login = "someUser", roles = { "AROLE" })
		@TestInstance(Lifecycle.PER_CLASS)
		class ProcessUserReadNestedTwice {

			@Test
			void processUserRead() throws Exception {

				Assertions.assertThat(cardRepository.count().block()).isEqualTo(cardNumber);
				CardPublicationData card = cardRepository.findByUid(cardUid).block();
				int initialNumOfReads = card.getUsersReads() != null ? card.getUsersReads().size() : 0;
				webTestClient.post().uri("/cards/userCardRead/" + cardUid).exchange().expectStatus().isOk()
						.expectBody().isEmpty();
				card = cardRepository.findByUid(cardUid).block();
				Assertions.assertThat(card.getUsersReads()).contains("someUser", "someOtherUser");
				Assertions.assertThat(card.getUsersReads().size()).isEqualTo(initialNumOfReads);
			}
			@Nested
			@WithMockOpFabUser(login = "someUser", roles = { "AROLE" })
			@TestInstance(Lifecycle.PER_CLASS)
			class ProcessDeleteUserRead {

				@Test
				void processUserRead() throws Exception {

					Assertions.assertThat(cardRepository.count().block()).isEqualTo(cardNumber);
					CardPublicationData card = cardRepository.findByUid(cardUid).block();
					Assertions.assertThat(card.getUsersReads()).contains("someUser");
					int initialNumOfReads = card.getUsersReads().size();
					webTestClient.delete().uri("/cards/userCardRead/" + cardUid).exchange().expectStatus()
							.isOk();
					card = cardRepository.findByUid(cardUid).block();
					Assertions.assertThat(card.getUsersReads()).doesNotContain("someUser");
					Assertions.assertThat(card.getUsersReads().size()).isEqualTo(initialNumOfReads - 1);
				}

				@Nested
				@WithMockOpFabUser(login = "someUser", roles = { "AROLE" })
				@TestInstance(Lifecycle.PER_CLASS)
				class ProcessDeleteUserReadSecond {

					@Test
					void processUserRead() throws Exception {

						Assertions.assertThat(cardRepository.count().block()).isEqualTo(cardNumber);
						CardPublicationData card = cardRepository.findByUid(cardUid).block();
						Assertions.assertThat(card.getUsersReads()).doesNotContain("someUser");
						int initialNumOfReads = card.getUsersReads().size();
						webTestClient.delete().uri("/cards/userCardRead/" + cardUid).exchange()
								.expectStatus().isNoContent();
						card = cardRepository.findByUid(cardUid).block();
						Assertions.assertThat(card.getUsersReads()).doesNotContain("someUser");
						Assertions.assertThat(card.getUsersReads().size()).isEqualTo(initialNumOfReads);
					}

				}

			}

		}
	}
	
}
