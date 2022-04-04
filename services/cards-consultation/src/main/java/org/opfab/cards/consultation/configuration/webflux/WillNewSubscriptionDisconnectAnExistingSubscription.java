/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.consultation.configuration.webflux;

import lombok.extern.slf4j.Slf4j;
import org.opfab.cards.consultation.services.CardSubscriptionService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.server.HandlerFunction;
import org.springframework.web.reactive.function.server.RequestPredicates;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;

import static org.springframework.web.reactive.function.server.ServerResponse.ok;

@Slf4j
@Configuration
public class WillNewSubscriptionDisconnectAnExistingSubscription implements UserExtractor {

    private final CardSubscriptionService cardSubscriptionService;

    public WillNewSubscriptionDisconnectAnExistingSubscription(CardSubscriptionService cardSubscriptionService) {
        this.cardSubscriptionService = cardSubscriptionService;
    }

    @Bean
    public RouterFunction<ServerResponse> willNewSubscriptionDisconnectAnExistingSubscriptionRoute() {
        return RouterFunctions
                .route(RequestPredicates.GET("/willNewSubscriptionDisconnectAnExistingSubscription"), willNewSubscriptionDisconnectAnExistingSubscriptionQueryRoute());
    }

    private HandlerFunction<ServerResponse> willNewSubscriptionDisconnectAnExistingSubscriptionQueryRoute() {
        return request -> extractUserFromJwtToken(request)
                .flatMap(currentUserWithPerimeters -> {

                    String login = currentUserWithPerimeters.getUserData().getLogin();
                    boolean willNewSubscriptionDisconnectAnExistingSubscription = cardSubscriptionService.willDisconnectAnExistingSubscriptionWhenLoggingIn(login);

                    log.debug("Will user {} disconnect subscriptions at log in : {}", login, willNewSubscriptionDisconnectAnExistingSubscription);
                    return ok().bodyValue(willNewSubscriptionDisconnectAnExistingSubscription);
                });
    }

}
