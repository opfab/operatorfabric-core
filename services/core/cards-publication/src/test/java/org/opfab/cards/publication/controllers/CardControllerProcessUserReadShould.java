/* Copyright (c) 2020-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

 package org.opfab.cards.publication.controllers;

import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.jeasy.random.EasyRandom;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.cards.publication.application.UnitTestApplication;
import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.cards.publication.repositories.CardRepositoryForTest;
import org.opfab.cards.publication.services.CardProcessingService;
import org.opfab.springtools.configuration.test.WithMockOpFabUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

import java.util.List;
import java.util.Optional;
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UnitTestApplication.class)
@ActiveProfiles("test")
@WebAppConfiguration
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Slf4j
@WithMockOpFabUser(login = "someUser", roles = { "AROLE" })
public class CardControllerProcessUserReadShould extends CardControllerShouldBase {

	String cardUid;
	String cardNeverContainsReadsUid;
	int cardNumber = 2;
	@Autowired
	private CardProcessingService cardProcessingService;

	@Autowired
    private CardRepositoryForTest cardRepository;

	private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

	@BeforeAll
	private void setup() throws Exception {
		this.mockMvc = webAppContextSetup(webApplicationContext).apply(springSecurity()).build();
		EasyRandom randomGenerator = instantiateEasyRandom();
		List<CardPublicationData> cardsInRepository = instantiateCardPublicationData(randomGenerator, cardNumber);
		cardUid = cardsInRepository.get(0).getUid();
		cardNeverContainsReadsUid = cardsInRepository.get(1).getUid();
		cardsInRepository.get(1).setUsersReads(null);
		cardRepository.saveAll(cardsInRepository);
	}


	@AfterAll
	void clean() {
		cardRepository.deleteAll();
	}
	
	@Test
	void processUserReadOfUnexistingCard() throws Exception {
		String cardUid = "NotExistingCardUid";		
		Optional <CardPublicationData> card = cardRepository.findByUid(cardUid);
		Assertions.assertThat(card.isPresent()).isFalse();
		mockMvc.perform(post("/cards/userCardRead/" + cardUid)).andExpect(status().isNotFound());
	}

	@Test
	void deleteUserReadOfUnexistingCard() throws Exception {
		String cardUid = "NotExistingCardUid";
		Optional <CardPublicationData> card = cardRepository.findByUid(cardUid);
		Assertions.assertThat(card.isPresent()).isFalse();
		mockMvc.perform(delete("/cards/userCardRead/" + cardUid)).andExpect(status().isNotFound());		
	}
	
	@Test
	void processUserRead() throws Exception {
		Assertions.assertThat(cardRepository.count()).isEqualTo(cardNumber);
		Optional <CardPublicationData> card = cardRepository.findByUid(cardUid);
		int initialNumOfReads = card.get().getUsersReads() != null ? card.get().getUsersReads().size() : 0;
		mockMvc.perform(post("/cards/userCardRead/" + cardUid)).andExpect(status().isCreated());
		card = cardRepository.findByUid(cardUid);
		Assertions.assertThat(card.get().getUsersReads()).contains("someUser");
		Assertions.assertThat(card.get().getUsersReads().size()).isEqualTo(initialNumOfReads + 1);
	}

	@Nested
	@WithMockOpFabUser(login = "someOtherUser", roles = { "AROLE" })
	@TestInstance(Lifecycle.PER_CLASS)
	class ProcessUserReadNested {
		@Test
		void processUserRead() throws Exception {

			Assertions.assertThat(cardRepository.count()).isEqualTo(cardNumber);
			Optional <CardPublicationData> card = cardRepository.findByUid(cardUid);
			int initialNumOfReads = card.get().getUsersReads() != null ? card.get().getUsersReads().size() : 0;
			mockMvc.perform(post("/cards/userCardRead/" + cardUid)).andExpect(status().isCreated());
			card = cardRepository.findByUid(cardUid);
			Assertions.assertThat(card.get().getUsersReads()).contains("someUser", "someOtherUser");
			Assertions.assertThat(card.get().getUsersReads().size()).isEqualTo(initialNumOfReads + 1);

		}

		@Nested
		@WithMockOpFabUser(login = "someUser", roles = { "AROLE" })
		@TestInstance(Lifecycle.PER_CLASS)
		class ProcessUserReadNestedTwice {

			@Test
			void processUserRead() throws Exception {

				Assertions.assertThat(cardRepository.count()).isEqualTo(cardNumber);
				Optional <CardPublicationData> card = cardRepository.findByUid(cardUid);
				int initialNumOfReads = card.get().getUsersReads() != null ? card.get().getUsersReads().size() : 0;
				mockMvc.perform(post("/cards/userCardRead/" + cardUid)).andExpect(status().isOk());
				card = cardRepository.findByUid(cardUid);
				Assertions.assertThat(card.get().getUsersReads()).contains("someUser", "someOtherUser");
				Assertions.assertThat(card.get().getUsersReads().size()).isEqualTo(initialNumOfReads);
			}
			@Nested
			@WithMockOpFabUser(login = "someUser", roles = { "AROLE" })
			@TestInstance(Lifecycle.PER_CLASS)
			class ProcessDeleteUserRead {

				@Test
				void processUserRead() throws Exception {

					Assertions.assertThat(cardRepository.count()).isEqualTo(cardNumber);
					Optional <CardPublicationData> card = cardRepository.findByUid(cardUid);
					Assertions.assertThat(card.get().getUsersReads()).contains("someUser");
					int initialNumOfReads = card.get().getUsersReads().size();
					mockMvc.perform(delete("/cards/userCardRead/" + cardUid)).andExpect(status().isOk());
					card = cardRepository.findByUid(cardUid);
					Assertions.assertThat(card.get().getUsersReads()).doesNotContain("someUser");
					Assertions.assertThat(card.get().getUsersReads().size()).isEqualTo(initialNumOfReads - 1);
				}

				@Nested
				@WithMockOpFabUser(login = "someUser", roles = { "AROLE" })
				@TestInstance(Lifecycle.PER_CLASS)
				class ProcessDeleteUserReadSecond {

					@Test
					void processUserRead() throws Exception {

						Assertions.assertThat(cardRepository.count()).isEqualTo(cardNumber);
						Optional <CardPublicationData> card = cardRepository.findByUid(cardUid);
						Assertions.assertThat(card.get().getUsersReads()).doesNotContain("someUser");
						int initialNumOfReads = card.get().getUsersReads().size();
						mockMvc.perform(delete("/cards/userCardRead/" + cardUid)).andExpect(status().isNoContent());
						card = cardRepository.findByUid(cardUid);
						Assertions.assertThat(card.get().getUsersReads()).doesNotContain("someUser");
						Assertions.assertThat(card.get().getUsersReads().size()).isEqualTo(initialNumOfReads);
					}

				}

			}

		}
	}
	
}
