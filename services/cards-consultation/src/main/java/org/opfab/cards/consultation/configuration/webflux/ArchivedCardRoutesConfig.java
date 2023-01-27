/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.consultation.configuration.webflux;

import java.util.List;

import lombok.extern.slf4j.Slf4j;

import org.opfab.cards.consultation.model.ArchivedCardConsultationData;
import org.opfab.cards.consultation.model.ArchivedCardData;
import org.opfab.cards.consultation.model.ArchivedCardsFilter;
import org.opfab.cards.consultation.repositories.ArchivedCardRepository;
import org.opfab.springtools.configuration.oauth.OpFabJwtAuthenticationToken;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.*;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

import static org.springframework.web.reactive.function.BodyInserters.fromValue;
import static org.springframework.web.reactive.function.server.ServerResponse.notFound;
import static org.springframework.web.reactive.function.server.ServerResponse.ok;
import static reactor.util.function.Tuples.of;

@Slf4j
@Configuration
public class ArchivedCardRoutesConfig implements UserExtractor {

    private final ArchivedCardRepository archivedCardRepository;

    
    public ArchivedCardRoutesConfig(ArchivedCardRepository archivedCardRepository) { this.archivedCardRepository = archivedCardRepository; }

    /**
     * Archived cards route configuration
     * @return route
     */
    @Bean
    public RouterFunction<ServerResponse> archivedCardRoutes() {
        return RouterFunctions
                .route(RequestPredicates.GET("/archives/{id}"),archivedCardGetRoute())
                .andRoute(RequestPredicates.OPTIONS("/archives/**"),archivedCardOptionRoute())
                .andRoute(RequestPredicates.POST("/archives"),archivedCardPostRoute());
    }

    private HandlerFunction<ServerResponse> archivedCardPostRoute() {
        return request -> extractFilterOnPost(request).flatMap(params -> archivedCardRepository.findWithUserAndFilter(params)
                .flatMap(archivedCards-> ok().contentType(MediaType.APPLICATION_JSON)
                        .body(fromValue(archivedCards))));
    }

    private Mono<Tuple2<CurrentUserWithPerimeters, ArchivedCardsFilter>> extractFilterOnPost(ServerRequest request){
        Mono<ArchivedCardsFilter> filter = request.bodyToMono(ArchivedCardsFilter.class);
        return request.principal().zipWith(filter)
                .map(t->{
                    OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) t.getT1();
                    CurrentUserWithPerimeters c = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();
                    return of(c,t.getT2());
                });
    }

    private HandlerFunction<ServerResponse> archivedCardGetRoute() {
        return request ->
        
                extractUserFromJwtToken(request)
                        .flatMap(user -> Mono.just(user).zipWith(archivedCardRepository.findByIdWithUser(request.pathVariable("id"),user)))
                        .flatMap(userCardT2 -> Mono.just(userCardT2).zipWith(archivedCardRepository.findByParentCard(userCardT2.getT2()).collectList()))
                        .flatMap(t2 -> {
                            
                            ArchivedCardConsultationData card = t2.getT1().getT2();
                            List<ArchivedCardConsultationData> childCards = t2.getT2();
                            return ok()
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .body(fromValue(ArchivedCardData.builder().card(card).childCards(childCards).build()));

                        })
                        .switchIfEmpty(notFound().build());
    }

    private HandlerFunction<ServerResponse> archivedCardOptionRoute() {
        return request -> ok().build();
    }

}
