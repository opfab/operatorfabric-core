package org.lfenergy.operatorfabric.cards.publication.controllers;

import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.jeasy.random.EasyRandom;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.publication.CardPublicationApplication;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.model.PublisherTypeEnum;
import org.lfenergy.operatorfabric.springtools.configuration.test.WithMockOpFabUser;
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
public class CardControllerUserCardShould extends CardControllerShouldBase {

	String cardUid;
	int cardNumber = 2;


	@BeforeAll
	void setup() {
		EasyRandom randomGenerator = instantiateEasyRandom();
		List<CardPublicationData> cardsInRepository = instantiateCardPublicationData(randomGenerator, cardNumber);
		cardUid = cardsInRepository.get(0).getUid();
		StepVerifier.create(cardRepository.saveAll(cardsInRepository))
				.expectNextCount(cardNumber).verifyComplete();
	}

	@AfterAll
	void clean() {
		cardRepository.deleteAll().subscribe();
	}

	@Test
	void deleteNonExistingUserCard() throws Exception {
		String cardId = "NotExistingCardId";
		CardPublicationData card = cardRepository.findById(cardId).block();
		Assertions.assertThat(card).isNull();
		webTestClient.delete().uri("/cards/userCard/" + cardId).exchange().expectStatus().isNotFound().expectBody().isEmpty();
	}

	@Test
	void deleteUserCardWithForbiddenError() throws Exception {
		CardPublicationData card = cardRepository.findByUid(cardUid).block();
		Assertions.assertThat(card.getPublisherType()).isNotEqualTo(PublisherTypeEnum.ENTITY);
		webTestClient.delete().uri("/cards/userCard/" + card.getId()).exchange().expectStatus().isForbidden().expectBody().isEmpty();
	}
}
