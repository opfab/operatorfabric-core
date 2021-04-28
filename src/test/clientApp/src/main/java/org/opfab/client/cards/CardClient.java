/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.client.cards;

import org.opfab.cards.model.Card;
import org.opfab.client.common.HttpClientInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class CardClient {

    @Autowired
    public RestTemplateBuilder builder;

    public String postCard(String url, Card card) {
        RestTemplate restTemplate = builder.build();
        restTemplate.setInterceptors(List.of(new HttpClientInterceptor()));

        HttpEntity<Card> request = new HttpEntity<>(card);
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
        return response.getBody();
    }

    public Card getCard(String url, String authToken, String cardId) {
        RestTemplate restTemplate = builder.build();
        
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization","Bearer " + authToken);
        HttpEntity<String> request = new HttpEntity<>(headers);
        Map<String, String> params = new HashMap<>();
       
        ResponseEntity<CardData> response = restTemplate.exchange(url + "/" + cardId, HttpMethod.GET,
                request, CardData.class, params);
        return response.getBody().card;
    }



}
