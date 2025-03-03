/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.controllers;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.opfab.cards.consultation.configuration.CustomScreenDataFields;
import org.opfab.cards.consultation.model.CardOperation;
import org.opfab.cards.consultation.model.CardSubscriptionDto;
import org.opfab.cards.consultation.repositories.CardRepository;
import org.opfab.cards.consultation.services.CardSubscription;
import org.opfab.cards.consultation.services.CardSubscriptionService;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;

/**
 * <p>
 * Handles cards access at the rest level. Depends on
 * {@link CardSubscriptionService} for business logic
 * </p>
 */
@Component
public class CardOperationsController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CardOperationsController.class);

    private final CustomScreenDataFields customScreenDataFields;

    private final CardSubscriptionService cardSubscriptionService;

    private final CardRepository cardRepository;

    private final ObjectMapper mapper;

    private final String version = getClass().getPackage().getImplementationVersion();

    public CardOperationsController(CardSubscriptionService cardSubscriptionService, ObjectMapper mapper,
            CardRepository cardRepository, CustomScreenDataFields customScreenDataFields) {
        this.cardSubscriptionService = cardSubscriptionService;
        this.mapper = mapper;
        this.mapper.setSerializationInclusion(JsonInclude.Include.NON_EMPTY);
        this.cardRepository = cardRepository;
        this.customScreenDataFields = customScreenDataFields;
    }

    /**
     * Registers to {@link CardSubscriptionService} to get access to a {@link Flux}
     * of String. Those strings are Json
     * {@link org.lfenergy.operatorfabric.cards.consultation.model.CardOperation}
     * representation
     */
    public Flux<String> registerSubscriptionAndPublish(Mono<CardOperationsGetParameters> input) {
        return input
                .flatMapMany(t -> {

                    if (t.clientId != null) {
                        log.debug("Check UI version {} match current version: {}", t.uiVersion, version);

                        CardSubscription subscription = null;
                        if (t.notification) {
                            boolean wrongUiVersion = false;
                            if (version != null && (t.uiVersion == null || !t.uiVersion.equals(version))) {
                                log.warn("Wrong UI version : {}", t.uiVersion);
                                wrongUiVersion = true;
                            }
                            subscription = cardSubscriptionService.subscribe(t.currentUserWithPerimeters,
                                    t.clientId, t.uiVersion, wrongUiVersion);
                            return subscription.getPublisher();
                        } else {
                            return fetchOldCards(t, customScreenDataFields);
                        }
                    } else {
                        log.warn("\"clientId\" is a mandatory request parameter");
                        ApiErrorException e = new ApiErrorException(
                                new ApiError(HttpStatus.BAD_REQUEST, "\"clientId\" is a mandatory request parameter"));
                        log.debug("4xx error underlying exception", e);
                        return Mono.just(objectToJsonString(e.getError()));
                    }
                });
    }

    public Mono<CardSubscriptionDto> updateSubscriptionAndPublish(Mono<CardOperationsGetParameters> parameters) {
        return parameters.map(p -> {
            try {
                CardSubscription oldSubscription = cardSubscriptionService
                        .findSubscription(p.currentUserWithPerimeters, p.clientId);
                if (oldSubscription != null) {
                    log.debug("Found subscription: {}", oldSubscription.getId());
                    oldSubscription.publishOldCardsIntoSubscription(fetchOldCards(oldSubscription, p.updatedFrom,
                            p.rangeStart, p.rangeEnd, customScreenDataFields));
                } else {
                    log.debug("No subscription found for {}#{}",
                            p.currentUserWithPerimeters.getUserData().getLogin(), p.clientId);
                }
                return new CardSubscriptionDto(p.rangeStart, p.rangeEnd, p.updatedFrom);
            } catch (IllegalArgumentException e) {
                log.error("Error searching for old subscription", e);
                throw new ApiErrorException(
                        new ApiError(HttpStatus.BAD_REQUEST, e.getMessage()));
            }
        });

    }

    /**
     * Fetching old cards for subscription (with possible update)
     *
     * @param subscription
     * @return
     */
    private Flux<String> fetchOldCards(CardSubscription subscription, Instant updatedFrom, Instant start, Instant end,
            CustomScreenDataFields customScreenDataFields) {

        return fetchOldCards0(updatedFrom, start, end, subscription.getCurrentUserWithPerimeters(),
                customScreenDataFields);
    }

    private Flux<String> fetchOldCards(CardOperationsGetParameters parameters,
            CustomScreenDataFields customScreenDataFields) {
        return fetchOldCards0(parameters.updatedFrom, parameters.rangeStart, parameters.rangeEnd,
                parameters.currentUserWithPerimeters,
                customScreenDataFields);
    }

    private Flux<String> fetchOldCards0(Instant updatedFrom, Instant start, Instant end,
            CurrentUserWithPerimeters currentUserWithPerimeters,
            CustomScreenDataFields customScreenDataFields) {
        Flux<CardOperation> oldCards;

        log.debug("Fetch card with startDate = {} and endDate = {} and updatedFrom = {}", start, end, updatedFrom);
        if ((end != null && start != null) || (updatedFrom != null)) {
            oldCards = cardRepository.getCardOperations(updatedFrom, start, end, currentUserWithPerimeters,
                    customScreenDataFields);
        } else {
            log.info("Not loading published cards as no range or no publish date is provided");
            oldCards = Flux.empty();
        }
        return oldCards.map(this::writeValueAsString);
    }

    public Mono<String> deleteSubscription(Mono<CardOperationsGetParameters> parameters) {
        return parameters.map(p -> {
            cardSubscriptionService.deleteSubscription(p.currentUserWithPerimeters.getUserData().getLogin(),
                    p.clientId);
            return "";
        });
    }

    public Mono<String> postMessageToSubscriptions(Mono<String> messageToSend) {
        return messageToSend.map(message -> {
            cardSubscriptionService.postMessageToSubscriptions(message);
            return "";
        });
    }

    private String writeValueAsString(CardOperation cardOperation) {
        try {
            return mapper.writeValueAsString(cardOperation);
        } catch (JsonProcessingException e) {
            log.error(String.format("Unable to linearize %s to Json", cardOperation.getClass().getSimpleName()), e);
            return null;
        }
    }

    /**
     * Converts an object to a JSON string. If conversion problems arise, logs and
     * returns "null" string
     *
     * @param o an object
     * @return Json object string representation or "null" if error.
     */
    private String objectToJsonString(Object o) {
        try {
            return mapper.writeValueAsString(o);
        } catch (JsonProcessingException e) {
            log.error("Unable to convert object to Json string", e);
            return "null";
        }
    }
}
