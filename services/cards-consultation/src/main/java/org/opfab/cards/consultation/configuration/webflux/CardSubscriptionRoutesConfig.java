/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.consultation.configuration.webflux;

import lombok.extern.slf4j.Slf4j;
import org.opfab.cards.consultation.controllers.CardOperationsController;
import org.opfab.cards.consultation.controllers.CardOperationsGetParameters;
import org.opfab.cards.consultation.model.CardSubscriptionDto;
import org.opfab.springtools.configuration.oauth.OpFabJwtAuthenticationToken;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.*;
import reactor.core.publisher.Mono;

import java.time.Instant;

import static org.springframework.web.reactive.function.server.ServerResponse.ok;

@Slf4j
@Configuration
public class CardSubscriptionRoutesConfig {

    public static final String FALSE = "false";
    public static final String TRUE = "true";
    public static final String CARD_SUBSCRIPTION_PATH = "/cardSubscription";
    public static final String CLIENT_ID = "clientId";

    private final CardOperationsController cardOperationsController;

    public CardSubscriptionRoutesConfig(CardOperationsController cardOperationsController){
        this.cardOperationsController = cardOperationsController;
    }

    /**
     * Card operation route configuration
     * @return route
     */
    @Bean
    public RouterFunction<ServerResponse> cardOperationRoutes() {
        return RouterFunctions
                .route(RequestPredicates.GET(CARD_SUBSCRIPTION_PATH), cardSubscriptionGetRoute())
                .andRoute(RequestPredicates.POST(CARD_SUBSCRIPTION_PATH),cardSubscriptionPostRoute())
                .andRoute(RequestPredicates.OPTIONS(CARD_SUBSCRIPTION_PATH), cardSubscriptionOptionsRoute())
                .andRoute(RequestPredicates.DELETE(CARD_SUBSCRIPTION_PATH), cardSubscriptionDeleteRoute());
    }

    private HandlerFunction<ServerResponse> cardSubscriptionPostRoute() {
        return request -> {
            ServerResponse.BodyBuilder builder = ok()
                    .contentType(MediaType.APPLICATION_JSON);
                return builder.body(cardOperationsController.updateSubscriptionAndPublish
                                (extractCardSubscriptionInfoOnPost(request)),
                        CardSubscriptionDto.class);
        };
    }

    private HandlerFunction<ServerResponse> cardSubscriptionGetRoute() {
        return request -> {
            ServerResponse.BodyBuilder builder = ok()
                    .contentType(MediaType.TEXT_EVENT_STREAM);
            return builder.body(cardOperationsController.registerSubscriptionAndPublish
                                (extractCardSubscriptionInfoOnGet(request)),
                        String.class);

        };
    }

    private HandlerFunction<ServerResponse> cardSubscriptionOptionsRoute() {
        return request -> ok().build();
    }

    private HandlerFunction<ServerResponse> cardSubscriptionDeleteRoute() {
        return request -> {
            ServerResponse.BodyBuilder builder = ok()
                    .contentType(MediaType.APPLICATION_JSON);
            return builder.body(cardOperationsController.deleteSubscription(extractCardSubscriptionInfoOnDelete(request)), String.class);
        };
    }

    /**
     * Extracts card operation parameters from Authentication and Query parameters GET context
     * @param request the http request
     * @return a parameter aggregation DTO
     */
    private Mono<CardOperationsGetParameters> extractCardSubscriptionInfoOnGet(ServerRequest request){
        return request.principal()
                .map(principal->{
                    OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
                    return CardOperationsGetParameters.builder()
                            .currentUserWithPerimeters((CurrentUserWithPerimeters)jwtPrincipal.getPrincipal())
                            .clientId(request.queryParam(CLIENT_ID).orElse(null))
                            .uiVersion(request.queryParam("version").orElse(null))
                            .rangeStart(parseAsInstant(request.queryParam("rangeStart").orElse(null)))
                            .rangeEnd(parseAsInstant(request.queryParam("rangeEnd").orElse(null)))
                            .publishFrom(parseAsInstant(request.queryParam("publishFrom").orElse(null)))
                            .test(request.queryParam("test").orElse(FALSE).equals(TRUE))
                            .notification(request.queryParam("notification").orElse(FALSE).equals(TRUE))
                            .build();
                });
    }

    /**
     * Extracts card operation parameters from Authentication and Query parameters DELETE context
     * @param request the http request
     * @return a parameter aggregation DTO
     */
    private Mono<CardOperationsGetParameters> extractCardSubscriptionInfoOnDelete(ServerRequest request){
        return request.principal()
                .map(principal->{
                    OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
                    return CardOperationsGetParameters.builder()
                            .currentUserWithPerimeters((CurrentUserWithPerimeters)jwtPrincipal.getPrincipal())
                            .clientId(request.queryParam(CLIENT_ID).orElse(null))
                            .build();
                });
    }

    /**
     * Extracts card operation parameters from Authentication and Query parameters in POST context
     * @param request the http request
     * @return a parameter aggregation DTO
     */
    private Mono<CardOperationsGetParameters> extractCardSubscriptionInfoOnPost(ServerRequest request){
        Mono<CardSubscriptionDto> inputSubscription = request.bodyToMono(CardSubscriptionDto.class);
        return request.principal().zipWith(inputSubscription)
                .map(t->{
                    OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) t.getT1();
                    CardOperationsGetParameters.CardOperationsGetParametersBuilder builder = CardOperationsGetParameters.builder()
                            .currentUserWithPerimeters((CurrentUserWithPerimeters)jwtPrincipal.getPrincipal())
                            .clientId(request.queryParam(CLIENT_ID).orElse(null))
                            .rangeStart(t.getT2().getRangeStart())
                            .rangeEnd(t.getT2().getRangeEnd())
                            .publishFrom(t.getT2().getPublishFrom())
                            .test(false)
                            .notification(true);
                    return builder.build();
                });
    }

    /** Takes string representing number of milliseconds since Epoch and returns corresponding Instant
     * */
    private static Instant parseAsInstant(String instantAsEpochMillString) {
        return instantAsEpochMillString==null?null:Instant.ofEpochMilli(Long.parseLong(instantAsEpochMillString));
    }
}
