/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.consultation.configuration.webflux;

import lombok.extern.slf4j.Slf4j;
import org.opfab.cards.consultation.repositories.ArchivedCardRepository;
import org.opfab.springtools.configuration.oauth.OpFabJwtAuthenticationToken;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.server.*;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

import static org.springframework.web.reactive.function.BodyInserters.fromObject;
import static org.springframework.web.reactive.function.server.ServerResponse.notFound;
import static org.springframework.web.reactive.function.server.ServerResponse.ok;
import static reactor.util.function.Tuples.of;

@Slf4j
@Configuration
public class ArchivedCardRoutesConfig implements UserExtractor {

    private final ArchivedCardRepository archivedCardRepository;

    @Autowired
    public ArchivedCardRoutesConfig(ArchivedCardRepository archivedCardRepository) { this.archivedCardRepository = archivedCardRepository; }

    /**
     * Archived cards route configuration
     * @return route
     */
    @Bean
    public RouterFunction<ServerResponse> archivedCardRoutes() {
        return RouterFunctions
                .route(RequestPredicates.GET("/archives/{id}"),archivedCardGetRoute())
                .andRoute(RequestPredicates.GET("/archives/**"),archivedCardGetWithQueryRoute())
                .andRoute(RequestPredicates.OPTIONS("/archives/**"),archivedCardOptionRoute());
    }

    private HandlerFunction<ServerResponse> archivedCardGetWithQueryRoute() {
        return request ->
                extractParameters(request)
                        .flatMap(params -> archivedCardRepository.findWithUserAndParams(params)
                                .flatMap(archivedCards-> ok().contentType(MediaType.APPLICATION_JSON)
                                                .body(fromObject(archivedCards))));
    }

    private HandlerFunction<ServerResponse> archivedCardGetRoute() {
        return request ->
                extractUserFromJwtToken(request)
                        .flatMap(user -> archivedCardRepository.findByIdWithUser(request.pathVariable("id"),user))
                        .flatMap(card-> ok().contentType(MediaType.APPLICATION_JSON).body(fromObject(card)))
                        .switchIfEmpty(notFound().build());
    }

    private HandlerFunction<ServerResponse> archivedCardOptionRoute() {
        return request -> ok().build();
    }

    /**
     * Extracts request parameters from Authentication and Query parameters
     * @param request the http request
     * @return a Tuple containing the principal as a {@link User} and query parameters as a {@link MultiValueMap}
     */
    private Mono<Tuple2<CurrentUserWithPerimeters,MultiValueMap<String, String>>> extractParameters(ServerRequest request) {
        return request.principal()
                .map( principal ->  {
                    OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
                    CurrentUserWithPerimeters c = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();
                    return of(c, request.queryParams());
                });
    }

}
