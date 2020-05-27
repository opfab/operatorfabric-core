/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.consultation.configuration.webflux;

import static org.springframework.web.reactive.function.BodyInserters.fromValue;
import static org.springframework.web.reactive.function.server.ServerResponse.notFound;
import static org.springframework.web.reactive.function.server.ServerResponse.ok;

import org.lfenergy.operatorfabric.cards.consultation.repositories.CardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.HandlerFunction;
import org.springframework.web.reactive.function.server.RequestPredicates;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Configuration
public class CardRoutesConfig implements UserExtractor {

    private final CardRepository cardRepository;

    @Autowired
    public CardRoutesConfig(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    /**
     * Card route configuration
     *
     * @return route
     */
    @Bean
    public RouterFunction<ServerResponse> cardRoutes() {
        return RouterFunctions
                .route(RequestPredicates.GET("/cards/{id}"), cardGetRoute())
                .andRoute(RequestPredicates.OPTIONS("/cards/{id}"), cardOptionRoute());
    }


    private HandlerFunction<ServerResponse> cardGetRoute() {
        return request ->
                extractUserFromJwtToken(request)
                        .flatMap(user -> Mono.just(user).zipWith(cardRepository.findByIdWithUser(request.pathVariable("id"),user)))
                        .doOnNext(t -> t.getT2().setHasBeenAcknowledged(
                        		t.getT2().getUsersAcks() != null && t.getT2().getUsersAcks().contains(t.getT1().getLogin())))
                        .flatMap(t -> ok().contentType(MediaType.APPLICATION_JSON).body(fromValue(t.getT2())))
                        .switchIfEmpty(notFound().build());
    }

    private HandlerFunction<ServerResponse> cardOptionRoute() {
        return request -> ok().build();
    }

}
