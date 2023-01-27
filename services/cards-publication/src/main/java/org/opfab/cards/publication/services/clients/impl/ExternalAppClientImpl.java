/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.cards.publication.services.clients.impl;

import lombok.extern.slf4j.Slf4j;

import org.opfab.cards.publication.configuration.ExternalRecipients;
import org.opfab.cards.publication.kafka.producer.ResponseCardProducer;
import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.cards.publication.services.clients.ExternalAppClient;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class ExternalAppClientImpl implements ExternalAppClient {

    public static final String REMOTE_404_MESSAGE = "External application endpoint not found (HTTP 404)";
    public static final String UNEXPECTED_REMOTE_MESSAGE = "Unexpected behavior of external application endpoint";
    public static final String INVALID_URL_MESSAGE = "Url specified for external application is invalid";
    public static final String URL_NOT_FOUND_MESSAGE = "Url for external application not configured";
    public static final String NO_EXTERNALRECIPIENTS_MESSAGE = "No external recipients found in the card";
    public static final String ERR_CONNECTION_REFUSED = "I/O exception accessing external application endpoint";

    private ExternalRecipients externalRecipients;
    private RestTemplate restTemplate;
    private ResponseCardProducer responseCardProducer;


    public ExternalAppClientImpl(ExternalRecipients externalRecipients,RestTemplate restTemplate,ResponseCardProducer responseCardProducer) {
        this.externalRecipients = externalRecipients;
        this.restTemplate = restTemplate;
        this.responseCardProducer = responseCardProducer;
    }

    public void sendCardToExternalApplication(CardPublicationData card, Optional<Jwt> jwt) {

        Optional<List<String>> externalRecipientsFromCard = Optional.ofNullable(card.getExternalRecipients());
        if (externalRecipientsFromCard.isPresent() && !externalRecipientsFromCard.get().isEmpty()) {

            externalRecipientsFromCard.get().stream()
                    .forEach(item -> {
                        Optional<ExternalRecipients.ExternalRecipient> externalRecipient = getExternalRecipient(item);
                        if (externalRecipient.isPresent()) {
                            ExternalRecipients.ExternalRecipient recipient = externalRecipient.get();
                            callExternalApplication(card, recipient.getUrl(), recipient.isPropagateUserToken() ? jwt : Optional.empty());
                        } else
                            throw createApiError(HttpStatus.BAD_REQUEST, INVALID_URL_MESSAGE);

                    });
        }else {
            log.debug(NO_EXTERNALRECIPIENTS_MESSAGE + " {} from {}", card.getId(), card.getPublisher());
        }
    }

    public void notifyExternalApplicationThatCardIsDeleted(CardPublicationData card, Optional<Jwt> jwt) {

        Optional<List<String>> externalRecipientsFromCard = Optional.ofNullable(card.getExternalRecipients());
        if (externalRecipientsFromCard.isPresent() && !externalRecipientsFromCard.get().isEmpty()) {

            externalRecipientsFromCard.get().stream()
                    .forEach(item -> {

                        Optional<ExternalRecipients.ExternalRecipient> externalRecipient = getExternalRecipient(item);
                        if (externalRecipient.isPresent()) {
                            ExternalRecipients.ExternalRecipient recipient = externalRecipient.get();
                            notifyExternalApplication(card, recipient.getUrl(), recipient.isPropagateUserToken() ? jwt : Optional.empty());
                        } else {
                            log.debug("ExternalRecipient extracted from {} is empty", item);
                        }
                    });
        } else {
            log.debug(NO_EXTERNALRECIPIENTS_MESSAGE + " {} from {}", card.getId(), card.getPublisher());
        }
    }

    private Optional<ExternalRecipients.ExternalRecipient> getExternalRecipient(String item) {
        return externalRecipients
        .getRecipients()
        .stream()
        .filter(x -> x.getId().equals(item))
        .findFirst();
    }

    private void callExternalApplication(CardPublicationData card, String externalRecipientUrl, Optional<Jwt> jwt) {
        if (externalRecipientUrl.startsWith("kafka:")) {
            callExternalKafkaApplication(card);
        } else{
            callExternalHttpApplication(card, externalRecipientUrl, jwt);
        }
    }
    private void notifyExternalApplication(CardPublicationData card, String externalRecipientUrl, Optional<Jwt> jwt) {
        if (externalRecipientUrl.startsWith("kafka:")) {
            notifyExternalKafkaApplication(card);
        } else{
            notifyExternalHttpApplication(card, externalRecipientUrl, jwt);
        }
    }


    private void callExternalKafkaApplication(CardPublicationData card) {
        responseCardProducer.send(card);
    }

    private void notifyExternalKafkaApplication(CardPublicationData card) {
        log.warn("Kafka card suppression notification not implemented");
    }

    private void callExternalHttpApplication(CardPublicationData card, String externalRecipientUrl, Optional<Jwt> jwt) {
        try {
            log.debug("Start to Send card {} To {} ", card.getId(), card.getPublisher());

            HttpHeaders headers = createRequestHeader(jwt);

            HttpEntity<CardPublicationData> requestBody = new HttpEntity<>(card, headers);

            restTemplate.postForObject(externalRecipientUrl, requestBody, Void.class);

            log.debug("End to Send card {} \n", card);

        } catch (Exception ex) {
            log.error("Error calling external application ", ex);
            throwException(ex);
        }

    }

    private void notifyExternalHttpApplication(CardPublicationData card, String externalRecipientUrl, Optional<Jwt> jwt) {
        try {
            HttpHeaders headers = createRequestHeader(jwt);
            HttpEntity<String> requestBody = new HttpEntity<>("", headers);
            restTemplate.exchange(externalRecipientUrl + "/" + card.getId(), HttpMethod.DELETE, requestBody, Void.class);

        } catch (Exception ex) {
            log.error("Error sending card deletion notification to external application ", ex);
            throwException(ex);
        }

    }

    private void throwException(Exception e) {
        if (e instanceof HttpClientErrorException.NotFound) {
            throw createApiError(HttpStatus.INTERNAL_SERVER_ERROR, REMOTE_404_MESSAGE);
        } else if ( e instanceof HttpClientErrorException || e instanceof HttpServerErrorException ) {
            throw createApiError(((HttpStatusCodeException) e).getStatusCode(), UNEXPECTED_REMOTE_MESSAGE);
        } else if (e instanceof IllegalArgumentException) {
            throw createApiError(HttpStatus.BAD_REQUEST, INVALID_URL_MESSAGE);
        } else if (e instanceof ResourceAccessException) {
            throw createApiError(HttpStatus.BAD_GATEWAY, ERR_CONNECTION_REFUSED);
        } else {
            throw createApiError(HttpStatus.BAD_GATEWAY, UNEXPECTED_REMOTE_MESSAGE);
        }
    }

    private ApiErrorException createApiError(HttpStatus httpStatus, String errorMessage) {
        return new ApiErrorException(ApiError.builder()
                .status(httpStatus)
                .message(errorMessage)
                .build());
    }

    private HttpHeaders createRequestHeader(Optional<Jwt> jwt) {
        HttpHeaders headers = new HttpHeaders();
        List<Charset> acceptCharset = Collections.singletonList(StandardCharsets.UTF_8);
        headers.setAcceptCharset(acceptCharset);
        headers.add("Accept", MediaType.APPLICATION_JSON_VALUE);
        if (jwt.isPresent())
            headers.setBearerAuth(jwt.get().getTokenValue());

        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }
}
