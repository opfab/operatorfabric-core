/* Copyright (c) 2020-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.lfenergy.operatorfabric.cards.publication.controllers;

import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.jeasy.random.EasyRandom;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.publication.application.UnitTestApplication;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.model.PublisherTypeEnum;
import org.lfenergy.operatorfabric.cards.publication.repositories.CardRepositoryForTest;
import org.lfenergy.operatorfabric.springtools.configuration.test.WithMockOpFabUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import org.springframework.web.context.WebApplicationContext;
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
public class CardControllerUserCardShould extends CardControllerShouldBase {

	String cardUid;
	int cardNumber = 2;


    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private CardRepositoryForTest cardRepository;

    @BeforeAll
    private void setup() throws Exception {
        this.mockMvc = webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
	    EasyRandom randomGenerator = instantiateEasyRandom();
		List<CardPublicationData> cardsInRepository = instantiateCardPublicationData(randomGenerator, cardNumber);
		cardUid = cardsInRepository.get(0).getUid();
		cardRepository.saveAll(cardsInRepository);
    }


	@AfterAll
	void clean() {
		cardRepository.deleteAll();
	}

	@Test
	void deleteNonExistingUserCard() throws Exception {
		String cardId = "NotExistingCardId";
		Optional <CardPublicationData> card = cardRepository.findById(cardId);
		Assertions.assertThat(card.isPresent()).isFalse();
		mockMvc.perform(delete("/cards/userCard/" + cardId)).andExpect(status().isNotFound());
	}

	@Test
	void deleteUserCardWithForbiddenError() throws Exception {
		CardPublicationData card = cardRepository.findByUid(cardUid).get();
		Assertions.assertThat(card.getPublisherType()).isNotEqualTo(PublisherTypeEnum.ENTITY);
		mockMvc.perform(delete("/cards/userCard/" + card.getId())).andExpect(status().isForbidden());
	}
}
