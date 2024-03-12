/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.consultation.configuration.webflux;

import java.util.List;

import org.opfab.cards.consultation.model.ArchivedCard;
import org.opfab.cards.consultation.model.ArchivedCardWithChildCards;
import org.opfab.cards.consultation.model.CardsFilter;
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

    private Mono<Tuple2<CurrentUserWithPerimeters, CardsFilter>> extractFilterOnPost(ServerRequest request){
        Mono<CardsFilter> filter = request.bodyToMono(CardsFilter.class);
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
                            
                            ArchivedCard card = t2.getT1().getT2();
                            List<ArchivedCard> childCards = t2.getT2();
                            return ok()
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .body(fromValue(new ArchivedCardWithChildCards(card, childCards)));

                        })
                        .switchIfEmpty(notFound().build());
    }

    private HandlerFunction<ServerResponse> archivedCardOptionRoute() {
        return request -> ok().build();
    }

}
