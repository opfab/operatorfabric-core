/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.configuration.webflux;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.consultation.repositories.CardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.*;

import static org.springframework.web.reactive.function.BodyInserters.fromObject;
import static org.springframework.web.reactive.function.server.ServerResponse.notFound;
import static org.springframework.web.reactive.function.server.ServerResponse.ok;

@Slf4j
@Configuration
public class CardByTimeRoutesConfig {

    private final CardRepository cardRepository;

    @Autowired
    public CardByTimeRoutesConfig(CardRepository cardRepository){
        this.cardRepository = cardRepository;
    }

    /**
     * Card by time route configuration
     * @return route
     */
    @Bean
    public RouterFunction<ServerResponse> cardRoutes() {
        return RouterFunctions
                .route(RequestPredicates.GET("/{millisTime}/next"), cardByNextTimeGetRoute())
                .andRoute(RequestPredicates.OPTIONS("/{millisTime}/next"), cardByNextTimeOptionRoute())
                .andRoute(RequestPredicates.GET("/{millisTime}/previous"), cardByPreviousTimeGetRoute())
                .andRoute(RequestPredicates.OPTIONS("/{millisTime}/previous"), cardByPreviousTimeOptionRoute());
    }


    private HandlerFunction<ServerResponse> cardByNextTimeGetRoute() {
        return request ->
                cardRepository.findFirstByStartDateGreaterThanEqualOrderByStartDateAscIdAsc(Long.parseLong(request.pathVariable("millisTime")))
                .flatMap(card-> ok().contentType(MediaType.APPLICATION_JSON).body(fromObject(card)))
                .switchIfEmpty(notFound().build());
    }

    private HandlerFunction<ServerResponse> cardByPreviousTimeGetRoute() {
        return request ->
                cardRepository.findFirstByStartDateLessThanEqualOrderByStartDateDescIdAsc(Long.parseLong(request.pathVariable("millisTime")))
                .flatMap(card-> ok().contentType(MediaType.APPLICATION_JSON).body(fromObject(card)))
                .switchIfEmpty(notFound().build());
    }

    private HandlerFunction<ServerResponse> cardByNextTimeOptionRoute() {
        return request -> ok().build();
    }
    private HandlerFunction<ServerResponse> cardByPreviousTimeOptionRoute() {
        return request -> ok().build();
    }
}
