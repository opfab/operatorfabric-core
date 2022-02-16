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
import net.minidev.json.JSONObject;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.server.*;
import org.springframework.http.MediaType;

import static org.springframework.web.reactive.function.server.ServerResponse.ok;

import java.util.ArrayList;
import java.util.Iterator;

@Slf4j
@Configuration
public class RemoteLogRoutesConfig implements UserExtractor {

    @Bean
    public RouterFunction<ServerResponse> remoteLogRoutes() {
        return RouterFunctions
                .route(RequestPredicates.POST("/logs"), logPostRoute());
    }

    private HandlerFunction<ServerResponse> logPostRoute() {
        return request -> extractUserFromJwtToken(request)
                .flatMap(currentUserWithPerimeters -> {
                    request.bodyToMono(JSONObject.class).subscribe(bodyData -> {
                        try {
                            ArrayList<String> logs = (ArrayList<String>) bodyData.get("logs");
                            Iterator<String> iterator = logs.iterator();
                            while (iterator.hasNext()) {
                                log.info(currentUserWithPerimeters.getUserData().getLogin() + " - "
                                        + iterator.next());
                            }
                        } catch (ClassCastException exc) {
                            log.info("Impossible to parse log ", exc);
                        }

                    });
                    return ok()
                            .contentType(MediaType.APPLICATION_JSON).build();
                });
    }

}
