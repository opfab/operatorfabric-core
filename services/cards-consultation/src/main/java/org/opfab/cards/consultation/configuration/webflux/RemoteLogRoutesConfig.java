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

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.server.*;
import org.springframework.http.MediaType;

import static org.springframework.web.reactive.function.server.ServerResponse.ok;

@Slf4j
@Configuration
public class RemoteLogRoutesConfig implements UserExtractor {

    @Bean
    public RouterFunction<ServerResponse> remoteLogRoutes() {
        return RouterFunctions
                .route(RequestPredicates.POST("/logs"), logPostRoute());
    }

    private HandlerFunction<ServerResponse> logPostRoute() {
        return request -> request.bodyToFlux(String.class)
                .collectList()
                .zipWith(extractUserFromJwtToken(request))
                .doOnNext(t2 -> t2.getT1().forEach(line -> logMessage( t2.getT2().getUserData().getLogin(), line)))
                .then(ok().contentType(MediaType.APPLICATION_JSON).build());
    }

    private void logMessage(String login, String message) {
        log.info(login + " - " + message);
    }

}
