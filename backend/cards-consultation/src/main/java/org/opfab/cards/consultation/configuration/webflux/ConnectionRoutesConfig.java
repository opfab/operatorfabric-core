/* Copyright (c) 2021-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.configuration.webflux;

import org.opfab.cards.consultation.model.Connection;
import org.opfab.cards.consultation.services.CardSubscriptionService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.server.HandlerFunction;
import org.springframework.web.reactive.function.server.RequestPredicates;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.web.reactive.function.server.ServerResponse.ok;

@Configuration
public class ConnectionRoutesConfig implements UserExtractor {

    private final CardSubscriptionService cardSubscriptionService;

    public ConnectionRoutesConfig(CardSubscriptionService cardSubscriptionService) {
        this.cardSubscriptionService = cardSubscriptionService;
    }

    @Bean
    public RouterFunction<ServerResponse> connectionRoutes() {
        return RouterFunctions
                .route(RequestPredicates.GET("/connections"), subscriptionManagementRoute());
    }

    private HandlerFunction<ServerResponse> subscriptionManagementRoute() {
        return request -> ok().bodyValue(getSubscriptions());
    }

    private List<Connection> getSubscriptions() {
        List<Connection> connectionsData = new ArrayList<>();
        cardSubscriptionService.getSubscriptions().forEach(subscription -> {
            Connection connection;
            if (subscription.getCurrentUserWithPerimeters().getUserData() != null) {
                connection = new Connection(subscription.getUserLogin(),
                        subscription.getCurrentUserWithPerimeters().getUserData().getFirstName(),
                        subscription.getCurrentUserWithPerimeters().getUserData().getLastName(),
                        subscription.getCurrentUserWithPerimeters().getUserData().getEntities(),
                        subscription.getCurrentUserWithPerimeters().getUserData().getGroups());
            } else {
                connection = new Connection(subscription.getUserLogin(), null, null,null, null);
            }
            connectionsData.add(connection);
        });
        return connectionsData;
    }

}
