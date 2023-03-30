/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.consultation.configuration.webflux;

import lombok.extern.slf4j.Slf4j;

import org.opfab.cards.consultation.model.CardsFilter;
import org.opfab.cards.consultation.model.CardConsultationData;
import org.opfab.cards.consultation.model.CardData;
import org.opfab.cards.consultation.repositories.CardRepository;
import org.opfab.springtools.configuration.oauth.OpFabJwtAuthenticationToken;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.*;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

import java.util.List;

import static org.springframework.web.reactive.function.BodyInserters.fromValue;
import static org.springframework.web.reactive.function.server.ServerResponse.notFound;
import static org.springframework.web.reactive.function.server.ServerResponse.ok;
import static reactor.util.function.Tuples.of;


@Slf4j
@Configuration
public class CardRoutesConfig implements UserExtractor {

    private final CardRepository cardRepository;


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
                .andRoute(RequestPredicates.OPTIONS("/cards/{id}"), cardOptionRoute())
                .andRoute(RequestPredicates.POST("/cards"),queryCardPostRoute());
    }


    private HandlerFunction<ServerResponse> cardGetRoute() {
        return request ->
                extractUserFromJwtToken(request)
                        .flatMap(currentUserWithPerimeters -> Mono.just(currentUserWithPerimeters).zipWith(cardRepository.findByIdWithUser(request.pathVariable("id"),currentUserWithPerimeters)))
                        .flatMap(userCardT2 -> Mono.just(userCardT2).zipWith(cardRepository.findByParentCardId(userCardT2.getT2().getId()).collectList()))
                        .doOnNext(t2 -> {
                            CurrentUserWithPerimeters user = t2.getT1().getT1();
                            CardConsultationData card = t2.getT1().getT2();
                            card.setHasBeenAcknowledged(card.getUsersAcks() != null && card.getUsersAcks().contains(user.getUserData().getLogin()));
                            card.setHasBeenRead(card.getUsersReads() != null && card.getUsersReads().contains(user.getUserData().getLogin()));
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

    private HandlerFunction<ServerResponse> queryCardPostRoute() {
        return request -> extractFilterOnPost(request).flatMap(params -> cardRepository.findWithUserAndFilter(params)
                .flatMap(cards-> ok().contentType(MediaType.APPLICATION_JSON)
                        .body(fromValue(cards))));
    }

    private Mono<Tuple2<CurrentUserWithPerimeters, CardsFilter>> extractFilterOnPost(ServerRequest request){
        Mono<CardsFilter> filter = request.bodyToMono(CardsFilter.class);
        return request.principal().zipWith(filter)
                .map(t->{
                    OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) t.getT1();
                    CurrentUserWithPerimeters c = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();
                    return of(c,t.getT2());
                });
    }
}