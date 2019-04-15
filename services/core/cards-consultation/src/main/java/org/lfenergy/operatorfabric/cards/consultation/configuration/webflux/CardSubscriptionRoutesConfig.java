/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.configuration.webflux;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.consultation.controllers.CardOperationsController;
import org.lfenergy.operatorfabric.cards.consultation.controllers.CardOperationsGetParameters;
import org.lfenergy.operatorfabric.cards.consultation.model.CardSubscriptionDto;
import org.lfenergy.operatorfabric.springtools.configuration.oauth.OpFabJwtAuthenticationToken;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.*;
import reactor.core.publisher.Mono;

import static org.springframework.web.reactive.function.server.ServerResponse.ok;

@Slf4j
@Configuration
public class CardSubscriptionRoutesConfig {

    public static final String FALSE = "false";
    public static final String TRUE = "true";

    private final CardOperationsController cardOperationsController;

    @Autowired
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
                .route(RequestPredicates.GET("/cardSubscription"), cardSubscriptionGetRoute())
                .andRoute(RequestPredicates.POST("/cardSubscription"),cardSubscriptionPostRoute())
                .andRoute(RequestPredicates.OPTIONS("/cardSubscription"), cardSubscriptionOptionsRoute());
    }

    /**
     * Card Operation POST route
     * @return
     */
    private HandlerFunction<ServerResponse> cardSubscriptionPostRoute() {
        return request -> {
            ServerResponse.BodyBuilder builder = ok()
                    .contentType(MediaType.APPLICATION_JSON);
                return builder.body(cardOperationsController.updateSubscriptionAndPublish
                                (extractCardSubscriptionInfoOnPost(request)),
                        CardSubscriptionDto.class);
        };
    }

    /**
     * Card Operation OPTIONS route
     * @return
     */
    private HandlerFunction<ServerResponse> cardSubscriptionGetRoute() {
        return request -> {
            ServerResponse.BodyBuilder builder = ok()
                    .contentType(MediaType.TEXT_EVENT_STREAM);
            Mono<CardOperationsGetParameters> params = extractCardSubscriptionInfoOnGet(request);
            if (request.queryParam("test").orElse(FALSE).equals(TRUE)) {
                return builder.body(cardOperationsController.publishTestData(params),
                        String.class);
            } else {
                return builder.body(cardOperationsController.registerSubscriptionAndPublish
                                (params),
                        String.class);
            }
        };
    }

    /**
     * CardOperation GET route
     * @return
     */
    private HandlerFunction<ServerResponse> cardSubscriptionOptionsRoute() {
        return request -> ok().build();
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
                            .user((User) jwtPrincipal.getPrincipal())
                            .clientId(request.queryParam("clientId").orElse(null))
                            .rangeStart(parseAsLong(request.queryParam("rangeStart").orElse(null)))
                            .rangeEnd(parseAsLong(request.queryParam("rangeEnd").orElse(null)))
                            .test(request.queryParam("test").orElse(FALSE).equals(TRUE))
                            .notification(request.queryParam("notification").orElse(FALSE).equals(TRUE))
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
                            .user((User) jwtPrincipal.getPrincipal())
                            .clientId(request.queryParam("clientId").orElse(null))
                            .rangeStart(t.getT2().getRangeStart())
                            .rangeEnd(t.getT2().getRangeEnd())
                            .test(false)
                            .notification(true);
                    if(t.getT2().getLoadedCards()!=null)
                        builder.loadedCards(t.getT2().getLoadedCards());
                    return builder.build();
                });
    }

    private static Long parseAsLong(String longAsString) {
        return longAsString==null?null:Long.parseLong(longAsString);
    }
}
