/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.consultation.configuration.webflux;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.consultation.model.CardConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.model.CardData;
import org.lfenergy.operatorfabric.cards.consultation.repositories.CardRepository;
import org.lfenergy.operatorfabric.users.model.CurrentUserWithPerimeters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.*;
import reactor.core.publisher.Mono;

import java.util.List;

import static org.springframework.web.reactive.function.BodyInserters.fromValue;
import static org.springframework.web.reactive.function.server.ServerResponse.notFound;
import static org.springframework.web.reactive.function.server.ServerResponse.ok;

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
                        .flatMap(currentUserWithPerimeters -> Mono.just(currentUserWithPerimeters).zipWith(cardRepository.findByIdWithUser(request.pathVariable("id"),currentUserWithPerimeters)))
                        .flatMap(userCardT2 -> Mono.just(userCardT2).zipWith(cardRepository.findByParentCardUid(userCardT2.getT2().getUid()).collectList()))
                        .doOnNext(t2 -> {
                            CurrentUserWithPerimeters user = t2.getT1().getT1();
                            CardConsultationData card = t2.getT1().getT2();
                            card.setHasBeenAcknowledged(card.getUsersAcks() != null && card.getUsersAcks().contains(user.getUserData().getLogin()));
                        })
                        .flatMap(t2 -> {
                            CardConsultationData card = t2.getT1().getT2();
                            List<CardConsultationData> childCards = t2.getT2();
                            return ok()
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .body(fromValue(CardData.builder().card(card).childCards(childCards).build()));
                        })
                        .switchIfEmpty(notFound().build());
    }

    private HandlerFunction<ServerResponse> cardOptionRoute() {
        return request -> ok().build();
    }
}