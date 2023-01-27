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
import org.opfab.cards.consultation.controllers.CardOperationsController;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.*;
import reactor.core.publisher.Mono;

import static org.springframework.web.reactive.function.server.ServerResponse.ok;

@Slf4j
@Configuration
public class MessageToSubscriptionsRoutesConfig {

    private final CardOperationsController cardOperationsController;

    
    public MessageToSubscriptionsRoutesConfig(CardOperationsController cardOperationsController){
        this.cardOperationsController = cardOperationsController;
    }

    @Bean
    public RouterFunction<ServerResponse> messageToSubscriptionsRoutes() {
        return RouterFunctions
                .route(RequestPredicates.POST("/messageToSubscriptions"), messageToSubscriptionsPostRoute());
    }

    private HandlerFunction<ServerResponse> messageToSubscriptionsPostRoute() {
        return request -> {
            Mono<String> messageToSend = request.bodyToMono(String.class);
            ServerResponse.BodyBuilder builder = ok()
                    .contentType(MediaType.APPLICATION_JSON);
            return builder.body(cardOperationsController.postMessageToSubscriptions(messageToSend), String.class);
        };
    }
}

