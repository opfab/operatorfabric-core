/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.cards.publication.services.clients.impl;

import lombok.extern.slf4j.Slf4j;
import org.opfab.cards.publication.kafka.producer.ResponseCardProducer;
import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.cards.publication.services.clients.ExternalAppClient;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@Slf4j
public class ExternalAppClientImpl implements ExternalAppClient {

    public static final String REMOTE_404_MESSAGE = "External application endpoint not found (HTTP 404)";
    public static final String UNEXPECTED_REMOTE_MESSAGE = "Unexpected behavior of external application endpoint";
    public static final String INVALID_URL_MESSAGE = "Url specified for external application is invalid";
    public static final String URL_NOT_FOUND_MESSAGE = "Url for external application not configured";
    public static final String NO_EXTERNALRECIPIENTS_MESSAGE = "No external recipients found in the card";
    public static final String ERR_CONNECTION_REFUSED = "I/O exception accessing external application endpoint";

    @Value("#{${externalRecipients-url:} ?: new java.util.HashMap() }")
    private Map<String, String> externalRecipients;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ResponseCardProducer responseCardProducer;

    public void sendCardToExternalApplication(CardPublicationData card) {

        Optional<List<String>> externalRecipientsFromCard = Optional.ofNullable(card.getExternalRecipients());

        if (externalRecipientsFromCard.isPresent() && !externalRecipientsFromCard.get().isEmpty()) {

            externalRecipientsFromCard.get().stream()
                    .forEach(item -> {
                        String externalRecipientUrl = externalRecipients
                                .entrySet()
                                .stream()
                                .filter(x -> x.getKey().contains(item))
                                .map(Map.Entry::getValue)
                                .findFirst()
                                .orElseThrow(() -> new ApiErrorException(ApiError.builder()
                                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .message(URL_NOT_FOUND_MESSAGE)
                                        .build()));
                        callExternalApplication(card, externalRecipientUrl);
                    });
        }else {
            log.warn("No external recipients found in the card {}", card.getId(), card.getPublisher());
        }
    }

    private void callExternalApplication(CardPublicationData card, String externalRecipientUrl) {
        if (externalRecipientUrl.startsWith("kafka:")) {
            callExternalKafkaApplication(card);
        } else{
            callExternalHttpApplication(card, externalRecipientUrl);
        }
    }

    private void callExternalKafkaApplication(CardPublicationData card) {
        responseCardProducer.send(card);
    }

    private void callExternalHttpApplication(CardPublicationData card, String externalRecipientUrl) {
        try {
            log.debug("Start to Send card {} To {} ", card.getId(), card.getPublisher());

            HttpHeaders headers = new HttpHeaders();
            List<Charset> acceptCharset = Collections.singletonList(StandardCharsets.UTF_8);
            headers.setAcceptCharset(acceptCharset);
            headers.add("Accept", MediaType.APPLICATION_JSON_VALUE);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<CardPublicationData> requestBody = new HttpEntity<>(card, headers);

            restTemplate.postForObject(externalRecipientUrl, requestBody, CardPublicationData.class);

            log.debug("End to Send card {} \n", card);

        } catch (HttpClientErrorException.NotFound ex) {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.NOT_FOUND)
                    .message(REMOTE_404_MESSAGE)
                    .build());
        } catch (HttpClientErrorException | HttpServerErrorException ex) {
            throw new ApiErrorException(ApiError.builder()
                    .status(ex.getStatusCode())
                    .message(UNEXPECTED_REMOTE_MESSAGE)
                    .build());
        } catch (IllegalArgumentException ex) {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .message(INVALID_URL_MESSAGE)
                    .build());
        } catch (ResourceAccessException ex) {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.BAD_GATEWAY)
                    .message(ERR_CONNECTION_REFUSED)
                    .build());
        } catch (Exception ex) {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.BAD_GATEWAY)
                    .message(UNEXPECTED_REMOTE_MESSAGE)
                    .build());
        }

    }
}
