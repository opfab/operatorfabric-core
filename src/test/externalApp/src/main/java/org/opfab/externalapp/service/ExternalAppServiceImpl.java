/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externalapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.opfab.cards.model.CardCreationReport;
import org.opfab.cards.model.I18n;
import org.opfab.cards.model.SeverityEnum;
import org.opfab.externalapp.cards.CardClient;
import org.opfab.externalapp.security.AuthClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.opfab.cards.model.Card;

@Service
@Slf4j
public class ExternalAppServiceImpl implements ExternalAppService {

	@Value("${opfab.publication.url:http://web-ui/cardspub/cards}")
	private String opfabPublicationUrl;

	@Value("${opfab.auth.url:http://web-ui/auth/token}")
	private String opfabAuthUrl;

	@Autowired
	public CardClient cardClient;

	@Autowired
	public AuthClient authClient;

	@Override
	public void receiveCard(Optional<JsonNode> requestBody) {
		log.info("card reception from Card Publication Service {} : \n\n", requestBody);
		requestBody.ifPresent(card -> sendBackCard(card.path("processInstanceId").textValue(), card.path("id").textValue()));
	}

	@Override
	public void deleteCard(String id) {
		log.info("Card suppression from Card Publication Service cardId = {} : \n\n", id);
	}

	public String welcomeMessage() {
		return   "Welcome to External Application";
	}

	public void sendBackCard(String processInstanceIdReceived, String idReceived) {

		Card card = new Card();
		card.setPublisher("operator1_fr");
		card.setProcessVersion("1");
		card.setProcess("defaultProcess");
		card.setProcessInstanceId(processInstanceIdReceived);
		card.setState("messageState");
		card.setEntityRecipients(List.of("IT_SUPERVISOR_ENTITY"));
		card.setSeverity(SeverityEnum.INFORMATION);
		card.setStartDate(Instant.now());

		I18n summary = new I18n();
		summary.setKey("message.summary");
		card.setSummary(summary);

		I18n title = new I18n();
		title.setKey("message.title");
		card.setTitle(title);
		card.setData("Card with id=" + idReceived + " received by externalApp");

		String token = null;
		try {
			token = authClient.getToken(opfabAuthUrl);
		} catch (Exception e) {
			log.error("Error getting token", e);
		}
		if (token != null) {
			CardCreationReport result = cardClient.postCard(opfabPublicationUrl, token, card);
			log.info("Card creation result : '" + result + "'");
		}
	}
}
