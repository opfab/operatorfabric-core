/* Copyright (c) 2021, RTE (http://www.rte-france.com)
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
import org.springframework.web.reactive.function.server.*;


import static org.springframework.web.reactive.function.BodyInserters.fromObject;
import static org.springframework.web.reactive.function.server.ServerResponse.notFound;
import static org.springframework.web.reactive.function.server.ServerResponse.ok;
import static reactor.util.function.Tuples.of;

import java.util.ArrayList;
import java.util.List;

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

    private List<Connection> getSubscriptions()
    {
        List<Connection> connectionData = new ArrayList<>(); 
        cardSubscriptionService.getSubscriptions().forEach( subscription -> connectionData.add(ConnectionData.builder().login(subscription.getUserLogin()).build()));
        return connectionData;
    }
    

}
