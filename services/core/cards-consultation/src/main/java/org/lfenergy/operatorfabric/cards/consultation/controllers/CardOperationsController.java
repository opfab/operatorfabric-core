/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.consultation.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

import org.lfenergy.operatorfabric.cards.consultation.model.CardOperation;
import org.lfenergy.operatorfabric.cards.consultation.model.CardSubscriptionDto;
import org.lfenergy.operatorfabric.cards.consultation.repositories.CardRepository;
import org.lfenergy.operatorfabric.cards.consultation.services.CardSubscription;
import org.lfenergy.operatorfabric.cards.consultation.services.CardSubscriptionService;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

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
     *
     * @param input o tuple containing 1) user data 2) client id
     * @return message publisher
     */
    public Flux<String> registerSubscriptionAndPublish(Mono<CardOperationsGetParameters> input) {
        return input
                .flatMapMany(t -> {
                    if (t.getClientId() != null) {
                        //init subscription if needed
                        CardSubscription subscription = null;
                        if (t.isNotification()) {
                            subscription = cardSubscriptionService.subscribe(t.getUser(), t.getClientId(), t.getRangeStart(), t.getRangeEnd(), false);
                            subscription.publishInto(fetchOldCards(subscription));
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
        return parameters
                .map(p -> {
                    try {
                        CardSubscription oldSubscription = cardSubscriptionService.findSubscription(p.getUser(), p.getClientId());
                        if (oldSubscription != null) {
                            log.info("Found subscription: {}", oldSubscription.getId());
                        } else {
                            log.info("No subscription found for {}#{}", p.getUser().getLogin(), p.getClientId());
                        }
                        return Tuples.of(p, oldSubscription);
                    } catch (IllegalArgumentException e) {
                        log.error("Error searching for old subscription", e);
                        throw new ApiErrorException(ApiError.builder().status(HttpStatus.BAD_REQUEST).message(e.getMessage()).build());
                    }
                })
                .doOnNext(t -> {
                    log.info("UPDATING Subscription {} updated with rangeStart: {}, rangeEnd: {}",
                            t.getT2().getId(),
                            t.getT1().getRangeStart(),
                            t.getT1().getRangeEnd());
                    t.getT2().updateRange(t.getT1().getRangeStart(), t.getT1().getRangeEnd());
                    t.getT2().publishInto(fetchOldCards(t.getT2()));
                })
                .map(t -> CardSubscriptionDto.builder()
                        .rangeStart(t.getT2().getRangeStart())
                        .rangeEnd(t.getT2().getRangeEnd())
                        .build())
                ;
    }

    /**
     * Fetching old cards for subscription (with possible update)
     *
     * @param subscription
     * @return
     */
    private Flux<String> fetchOldCards(CardSubscription subscription) {
        Instant start = subscription.getRangeStart();
        Instant end = subscription.getRangeEnd();
        return fetchOldCards0(subscription.getStartingPublishDate(), start, end, subscription.getUser());
    }

    private Flux<String> fetchOldCards(CardOperationsGetParameters parameters) {
        Instant start = parameters.getRangeStart();
        Instant end = parameters.getRangeEnd();
        return fetchOldCards0(null, start, end, parameters.getUser());
    }

    private Flux<String> fetchOldCards0(Instant referencePublishDate, Instant start, Instant end, User user) {
        Flux<CardOperation> oldCards;
        referencePublishDate = referencePublishDate == null ? Instant.now() : referencePublishDate;
        String login = user.getLogin();
        String[] groups = user.getGroups().toArray(new String[user.getGroups().size()]);

        String[] entities = new String[]{};
        if (user.getEntities() != null)
            entities = user.getEntities().toArray(new String[user.getEntities().size()]);

        if (end != null && start != null) {
            oldCards = cardRepository.findUrgent(referencePublishDate, start, end, login, groups, entities);
        } else if (end != null) {
            oldCards = cardRepository.findPastOnly(referencePublishDate, end, login, groups, entities);
        } else if (start != null) {
            oldCards = cardRepository.findFutureOnly(referencePublishDate, start, login, groups, entities);
        } else {
            log.info("Not loading published cards as no range is provided");
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
