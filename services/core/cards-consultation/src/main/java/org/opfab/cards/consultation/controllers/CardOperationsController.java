/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.consultation.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.opfab.cards.consultation.model.CardOperation;
import org.opfab.cards.consultation.model.CardSubscriptionDto;
import org.opfab.cards.consultation.repositories.CardRepository;
import org.opfab.cards.consultation.services.CardSubscription;
import org.opfab.cards.consultation.services.CardSubscriptionService;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;

/**
 * <p>Handles cards access at the rest level. Depends on {@link CardSubscriptionService} for business logic</p>
 */
@Component
@Slf4j
public class CardOperationsController {

    private final CardSubscriptionService cardSubscriptionService;

    private final CardRepository cardRepository;

    private final ObjectMapper mapper;

    @Autowired
    public CardOperationsController(CardSubscriptionService cardSubscriptionService, ObjectMapper mapper, CardRepository cardRepository) {
        this.cardSubscriptionService = cardSubscriptionService;
        this.mapper = mapper;
        this.cardRepository = cardRepository;
    }


    /**
     * Registers to {@link CardSubscriptionService} to get access to a {@link Flux} of String. Those strings are Json
     * {@link org.lfenergy.operatorfabric.cards.consultation.model.CardOperation} representation
     */
    public Flux<String> registerSubscriptionAndPublish(Mono<CardOperationsGetParameters> input) {
        return input
                .flatMapMany(t -> {
                    if (t.getClientId() != null) {
                        CardSubscription subscription = null;
                        if (t.isNotification()) {
                            subscription = cardSubscriptionService.subscribe(t.getCurrentUserWithPerimeters(), t.getClientId());
                            return subscription.getPublisher();
                        } else {
                            return fetchOldCards(t);
                        }
                    } else {
                        log.warn("\"clientId\" is a mandatory request parameter");
                        ApiErrorException e = new ApiErrorException(ApiError.builder()
                                .status(HttpStatus.BAD_REQUEST)
                                .message("\"clientId\" is a mandatory request parameter")
                                .build()
                        );
                        log.debug("4xx error underlying exception", e);
                        return Mono.just(objectToJsonString(e.getError()));
                    }
                });
    }

    public Mono<CardSubscriptionDto> updateSubscriptionAndPublish(Mono<CardOperationsGetParameters> parameters) {
        return parameters.map(p -> {
            try {
                CardSubscription oldSubscription = cardSubscriptionService
                        .findSubscription(p.getCurrentUserWithPerimeters(), p.getClientId());
                if (oldSubscription != null) {
                    log.info("Found subscription: {}", oldSubscription.getId());
                    oldSubscription.updateRange();
                    oldSubscription.publishDataFluxIntoSubscription(fetchOldCards(oldSubscription, p.getPublishFrom(),p.getRangeStart(), p.getRangeEnd()));
                } else {
                    log.info("No subscription found for {}#{}", p.getCurrentUserWithPerimeters().getUserData().getLogin(), p.getClientId());
                }
                return CardSubscriptionDto.builder().rangeStart(p.getRangeStart()).rangeEnd(p.getRangeEnd()).build();
            } catch (IllegalArgumentException e) {
                log.error("Error searching for old subscription", e);
                throw new ApiErrorException(
                        ApiError.builder().status(HttpStatus.BAD_REQUEST).message(e.getMessage()).build());
            }
        });

    }

    /**
     * Fetching old cards for subscription (with possible update)
     *
     * @param subscription
     * @return
     */
    private Flux<String> fetchOldCards(CardSubscription subscription,Instant publishFrom,Instant start,Instant end)  {
        subscription.updateCurrentUserWithPerimeters();
        return fetchOldCards0(publishFrom, start, end, subscription.getCurrentUserWithPerimeters());
    }

    private Flux<String> fetchOldCards(CardOperationsGetParameters parameters) {
        Instant start = parameters.getRangeStart();
        Instant end = parameters.getRangeEnd();
        Instant publishFrom = parameters.getPublishFrom();
        return fetchOldCards0(publishFrom, start, end, parameters.getCurrentUserWithPerimeters());
    }

    private Flux<String> fetchOldCards0(Instant publishFrom, Instant start, Instant end, CurrentUserWithPerimeters currentUserWithPerimeters) {
        Flux<CardOperation> oldCards;
        log.debug("Fetch card with startDate = {} and endDate = {} and publishFrom = {}",start,end,publishFrom);
        if ((end != null && start != null) || (publishFrom!=null)) {
            oldCards = cardRepository.getCardOperations(publishFrom, start, end, currentUserWithPerimeters);
        } else {
            log.info("Not loading published cards as no range or no publish date is provided");
            oldCards = Flux.empty();
        }
        return oldCards.map(this::writeValueAsString);
    }

    private String writeValueAsString(CardOperation cardOperation) {
        try {
            return mapper.writeValueAsString(cardOperation);
        } catch (JsonProcessingException e) {
            log.error(String.format("Unable to linearize %s to Json",cardOperation.getClass().getSimpleName()),e);
            return null;
        }
    }


    /**
     * Converts an object to a JSON string. If conversion problems arise, logs and returns "null" string
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
