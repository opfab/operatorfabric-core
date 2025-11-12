/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externalapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.opfab.externalapp.model.*;
import org.opfab.externalapp.cards.CardClient;
import org.opfab.externalapp.security.AuthClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;

@Service
public class ExternalAppServiceImpl implements ExternalAppService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ExternalAppServiceImpl.class);

    @Value("${opfab.publication.url:http://web-ui/cards-publication/cards}")
    private String opfabPublicationUrl;

    @Value("${opfab.auth.url:http://web-ui/auth/token}")
    private String opfabAuthUrl;

    private CardClient cardClient;

    private AuthClient authClient;

    public ExternalAppServiceImpl(CardClient cardClient, AuthClient authClient) {
        this.cardClient = cardClient;
        this.authClient = authClient;
    }

    @Override
    public void receiveCard(Optional<JsonNode> requestBody) {
        log.info("card reception from Card Publication Service {} : \n\n", requestBody);
        ArrayList<String> entitiesRecipients = new ArrayList<>(List.of("IT_SUPERVISOR_ENTITY"));
        ArrayList<String> groupRecipients = new ArrayList<>();
        ArrayList<String> userRecipients = new ArrayList<>();
        requestBody.ifPresent(card -> sendBackCard("api_test", "messageState",
                card.path("processInstanceId").textValue() + "_created", entitiesRecipients, groupRecipients,
                userRecipients, card.path("id").textValue(),
                card.hasNonNull("startDate") ? card.path("startDate").asLong() : null,
                card.hasNonNull("endDate") ? card.path("endDate").asLong() : null));
    }

    @Override
    public void deleteCard(String id) {
        log.info("Card suppression from Card Publication Service cardId = {} : \n\n", id);
        ArrayList<String> entitiesRecipients = new ArrayList<>();
        ArrayList<String> groupRecipients = new ArrayList<>();
        ArrayList<String> userRecipients = new ArrayList<>(List.of("operator5_fr"));
        sendBackCard("api_test", "messageState", "process1_deleted", entitiesRecipients, groupRecipients,
                userRecipients, id, null, null);
    }

    public String welcomeMessage() {
        return "Welcome to External Application";
    }

    public void sendBackCard(String processToSend,
            String state,
            String processInstanceIdReceived,
            List<String> entitiesRecipients,
            List<String> groupRecipients,
            List<String> userRecipients,
            String idReceived,
            Long startDate,
            Long endDate) {

        Card card = new Card();
        card.publisher = "operator1_fr";
        card.processVersion = "1";
        card.process = processToSend;
        card.processInstanceId = processInstanceIdReceived;
        card.state = state;
        card.severity = SeverityEnum.INFORMATION;
        if (startDate != null) {
            card.startDate = Instant.ofEpochMilli(startDate);
        } else {
            card.startDate = Instant.now();
        }
        if (endDate != null) {
            card.endDate = Instant.ofEpochMilli(endDate);
        }
        card.userRecipients = userRecipients;
        card.groupRecipients = groupRecipients;
        card.entityRecipients = entitiesRecipients;

        I18n summary = new I18n("message.summary", null);
        card.summary = summary;

        I18n title = new I18n("message.title", null);
        card.title = title;

        LinkedHashMap<String, String> data = new LinkedHashMap<>();
        data.put("message", "Card with id=" + idReceived + " received by externalApp. " +
                "Card sent for karate tests, addressed to : " +
                recipientsToString(userRecipients) + " " +
                recipientsToString(groupRecipients) + " " +
                recipientsToString(entitiesRecipients) + " ");
        card.data = data;

        String token = null;
        try {
            token = authClient.getToken(opfabAuthUrl);
        } catch (Exception e) {
            log.error("Error getting token", e);
        }
        if (token != null) {
            CardCreationReport result = cardClient.postCard(opfabPublicationUrl, token, card);
            log.info("Card creation result : '{}'", result);
        }
    }

    private String recipientsToString(List<String> recipients) {
        StringBuilder ret = new StringBuilder();
        for (int i = 0; i < recipients.size(); i++) {
            ret.append(recipients.get(i) + " ");
        }
        if (!ret.isEmpty()) {
            return ret.substring(0, ret.length() - 1);
        }
        return ret.toString();
    }
}
