/* Copyright (c) 2018-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.configuration.webflux;

import org.opfab.cards.consultation.model.CardActionEnum;
import org.opfab.cards.consultation.model.Card;
import org.opfab.cards.consultation.model.CardWithChildCards;
import org.opfab.cards.consultation.model.CardsFilter;
import org.opfab.cards.consultation.repositories.CardRepository;
import org.opfab.configuration.oauth.OpFabJwtAuthenticationToken;
import org.opfab.common.users.CurrentUserWithPerimeters;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

@Configuration
public class CardRoutesConfig implements UserExtractor {

    public static final String CARDS_PATH = "/cards";
    public static final String DEPRECATED_CARDS_PATH = "/cards/{id}";

    private static final Logger LOGGER = LoggerFactory.getLogger(CardRoutesConfig.class);

    private final CardRepository cardRepository;

    public CardRoutesConfig(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    /**
     * Card route configuration
     */
    @Bean
    public RouterFunction<ServerResponse> cardRoutes() {
        return RouterFunctions
                .route(RequestPredicates.GET(DEPRECATED_CARDS_PATH), cardGetRouteDeprecated())
                .andRoute(RequestPredicates.GET(CARDS_PATH).and(RequestPredicates.queryParam("cardId", t -> true)),
                        cardGetRouteWithQueryParam())
                .andRoute(RequestPredicates.OPTIONS(DEPRECATED_CARDS_PATH), cardOptionRoute())
                .andRoute(RequestPredicates.OPTIONS(CARDS_PATH), cardOptionRoute())
                .andRoute(RequestPredicates.POST(CARDS_PATH), queryCardPostRoute());
    }

    private HandlerFunction<ServerResponse> cardGetRouteWithQueryParam() {
        return request -> {
            String cardId = request.queryParam("cardId").orElse("");
            return getCardWithChildren(request, cardId);
        };
    }

    /**
     * This endpoint is deprecated. Use GET /cards?cardId={id} instead
     * to avoid issues with special characters (especially slashes) in
     * card IDs.
     */
    private HandlerFunction<ServerResponse> cardGetRouteDeprecated() {
        return request -> {
            String cardId = request.pathVariable("id");
            LOGGER.warn("DEPRECATED API USAGE: GET /cards/{} is deprecated. Use GET /cards?cardId={} instead.", cardId,
                    cardId);
            return getCardWithChildren(request, cardId);
        };
    }

    /**
     * Common method to get a card with its child cards
     */
    private Mono<ServerResponse> getCardWithChildren(ServerRequest request, String cardId) {
        return extractUserFromJwtToken(request)
                .flatMap(currentUserWithPerimeters -> Mono.just(currentUserWithPerimeters).zipWith(
                        cardRepository.findByIdWithUser(cardId, currentUserWithPerimeters)))
                .flatMap(userCardT2 -> Mono.just(userCardT2)
                        .zipWith(cardRepository.findByParentCardId(userCardT2.getT2().id).collectList()))
                .doOnNext(t2 -> {
                    CurrentUserWithPerimeters user = t2.getT1().getT1();
                    Card card = t2.getT1().getT2();
                    card.hasBeenAcknowledged = card.usersAcks != null
                            && card.usersAcks.contains(user.getUserData().getLogin());
                    card.hasBeenRead = card.usersReads != null
                            && card.usersReads.contains(user.getUserData().getLogin());
                })
                .flatMap(t2 -> {
                    CurrentUserWithPerimeters user = t2.getT1().getT1();
                    Card card = t2.getT1().getT2();
                    List<Card> childCards = t2.getT2();
                    childCards.forEach(child -> {
                        if (child.actions != null
                                && child.actions.contains(CardActionEnum.PROPAGATE_READ_ACK_TO_PARENT_CARD)) {
                            child.hasBeenAcknowledged = child.usersAcks != null
                                    && child.usersAcks.contains(user.getUserData().getLogin());
                            child.hasBeenRead = child.usersReads != null
                                    && child.usersReads.contains(user.getUserData().getLogin());
                        }
                    });

                    return ok()
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(fromValue(new CardWithChildCards(card, childCards)));
                })
                .switchIfEmpty(notFound().build());
    }

    private HandlerFunction<ServerResponse> cardOptionRoute() {
        return request -> ok().build();
    }

    private HandlerFunction<ServerResponse> queryCardPostRoute() {
        return request -> extractFilterOnPost(request).flatMap(params -> cardRepository.findWithUserAndFilter(params)
                .flatMap(cards -> ok().contentType(MediaType.APPLICATION_JSON)
                        .body(fromValue(cards))));
    }

    private Mono<Tuple2<CurrentUserWithPerimeters, CardsFilter>> extractFilterOnPost(ServerRequest request) {
        Mono<CardsFilter> filter = request.bodyToMono(CardsFilter.class);
        return request.principal().zipWith(filter)
                .map(t -> {
                    OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) t.getT1();
                    CurrentUserWithPerimeters c = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();
                    return of(c, t.getT2());
                });
    }
}
