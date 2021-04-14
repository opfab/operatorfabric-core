/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.client;

import java.time.Instant;
import java.util.List;

import org.lfenergy.operatorfabric.cards.model.Card;
import org.lfenergy.operatorfabric.cards.model.CardCreationReport;
import org.lfenergy.operatorfabric.cards.model.I18n;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.lfenergy.operatorfabric.client.cards.CardClient;
import org.lfenergy.operatorfabric.client.security.AuthClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@SpringBootApplication
public class ClientApplication implements CommandLineRunner {

	@Autowired
	public CardClient cardClient;

	@Autowired
	public AuthClient authClient;

	private final String OPFAB_PUBLICATION_URL = "http://localhost:2102/cards";
	private final String OPFAB_CONSULTATION_URL = "http://localhost:2002/cards/cards";
	private final String OPFAB_AUTH_URL = "http://localhost:2002/auth/token";

	public static void main(String[] args) {
		SpringApplication.run(ClientApplication.class, args).close();

	}

	@Override
	public void run(String... args) {
		testCard();
	}

	private void testCard() {
		Card card = new Card();
		card.setPublisher("api_test");
		card.setProcessVersion("1");
		card.setProcess("api_test");
		card.setProcessInstanceId("processClient");
		card.setState("messageState");
		card.setUserRecipients(List.of("operator1"));
		card.setSeverity(SeverityEnum.INFORMATION);
		card.setStartDate(Instant.now());

		I18n summary = new I18n();
		summary.setKey("message.summary");
		card.setSummary(summary);

		I18n title = new I18n();
		title.setKey("message.title");
		card.setTitle(title);

		CardCreationReport result = cardClient.postCard(OPFAB_PUBLICATION_URL, card);
		log.info("Card creation result " + result);
		
		try {
			String token = authClient.getToken(OPFAB_AUTH_URL);
			String cardId = "api_test.processClient";
			Card card2 = cardClient.getCard(OPFAB_CONSULTATION_URL, token, cardId);
			log.info("Got card " + card2);
		} catch (Exception e) {
			log.error("Error getting card", e);
		}

	}
}
