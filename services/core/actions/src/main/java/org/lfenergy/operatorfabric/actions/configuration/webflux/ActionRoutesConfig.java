/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.actions.configuration.webflux;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.actions.model.ActionStatus;
import org.lfenergy.operatorfabric.actions.services.ActionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.*;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple3;
import reactor.util.function.Tuple4;
import reactor.util.function.Tuples;

import java.util.List;

import static org.springframework.web.reactive.function.BodyInserters.fromObject;
import static org.springframework.web.reactive.function.server.ServerResponse.notFound;
import static org.springframework.web.reactive.function.server.ServerResponse.ok;

@Slf4j
@Configuration
public class ActionRoutesConfig {


    private final ActionService actionService;

    @Autowired
    public ActionRoutesConfig(ActionService actionService) {
        this.actionService = actionService;
    }

    /**
     * Card route configuration
     *
     * @return route
     */
    @Bean
    public RouterFunction<ServerResponse> cardRoutes() {
        return RouterFunctions
                .route(RequestPredicates.GET("/process/{processInstanceId}/states/{state}/actions/{actionKey}"), actionGetRoute())
                .andRoute(RequestPredicates.POST("/process/{processInstanceId}/states/{state}/actions/{actionKey}"), actionPostRoute())
                .andRoute(RequestPredicates.OPTIONS("/process/{processInstanceId}/states/{state}/actions/{actionKey}"), actionOptionRoute());
    }


    private HandlerFunction<ServerResponse> actionGetRoute() {
        return request -> extractParameters(request)
                .flatMap(t -> {
                        ActionStatus actionStatus = this.actionService.lookUpActionStatus(t.getT1(),t.getT3());
                    if (actionStatus != null) {
                            return ok().contentType(MediaType.APPLICATION_JSON).body(fromObject(actionStatus));
                    }
                    return notFound().build();
                });
    }

    private HandlerFunction<ServerResponse> actionPostRoute() {
        return request -> extractParameters(request)
                .flatMap(t -> {
                    ActionStatus actionStatus = this.actionService.submitAction(t.getT1(),t.getT3(), t.getT4());
                    if (actionStatus != null) {
                        return ok().contentType(MediaType.APPLICATION_JSON).body(fromObject(actionStatus));
                    }
                    return ok().build();
                });
    }



    private Mono<Tuple4<String, String, String, String>> extractParameters(ServerRequest request) {
        String jwt = null;
        List<String> authorizations = request.headers().header("Authorization");
        if(authorizations.size()>0){
            jwt = authorizations.get(0).replaceAll("Bearer (.+)","$1");

        }
        return Mono.just(Tuples.of(request.pathVariable("processInstanceId"),
                request.pathVariable("state"),
                request.pathVariable("actionKey"),
                jwt));
    }

    private HandlerFunction<ServerResponse> actionOptionRoute() {
        return request -> ok().build();
    }
}
