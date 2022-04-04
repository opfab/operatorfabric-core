/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.consultation.configuration.webflux;

import lombok.extern.slf4j.Slf4j;
import org.opfab.cards.consultation.model.Connection;
import org.opfab.cards.consultation.model.ConnectionData;
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

@Slf4j
@Configuration
public class ConnectionRoutesConfig implements UserExtractor {

    private final CardSubscriptionService cardSubscriptionService;

    public ConnectionRoutesConfig(CardSubscriptionService cardSubscriptionService) {
        this.cardSubscriptionService = cardSubscriptionService;
    }

    @Bean
    public RouterFunction<ServerResponse> connectionRoutes() {
        return RouterFunctions
                .route(RequestPredicates.GET("/connections"),subscriptionManagementRoute());
    }

    private HandlerFunction<ServerResponse> subscriptionManagementRoute() {
        return request -> ok().bodyValue(getSubscriptions());
    }

    private List<Connection> getSubscriptions()  {
        List<Connection> connectionsData = new ArrayList<>();
        cardSubscriptionService.getSubscriptions().forEach( subscription -> {
            ConnectionData connection = ConnectionData.builder()
                            .login(subscription.getUserLogin())
                            .build();
            if (subscription.getCurrentUserWithPerimeters().getUserData() != null) {
                connection.setEntitiesConnected(subscription.getCurrentUserWithPerimeters().getUserData().getEntities());
                connection.setGroups(subscription.getCurrentUserWithPerimeters().getUserData().getGroups());
            }
            connectionsData.add(connection);
        });
        return connectionsData;
    }
    

}
