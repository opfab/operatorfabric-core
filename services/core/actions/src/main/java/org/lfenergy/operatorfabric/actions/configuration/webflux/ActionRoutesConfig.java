/* Copyright (c) 2020, RTE (http://www.rte-france.com)
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
import reactor.util.function.Tuple6;
import reactor.util.function.Tuples;

import java.util.List;

import static org.springframework.web.reactive.function.BodyInserters.fromObject;
import static org.springframework.web.reactive.function.server.ServerResponse.noContent;
import static org.springframework.web.reactive.function.server.ServerResponse.ok;

@Slf4j
@Configuration
public class ActionRoutesConfig {


    public static final String ACTION_ROUTE = "/publisher/{publisher}/process/{processInstanceId}/states/{state}/actions/{actionKey}";
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
    public RouterFunction<ServerResponse> actionRoutes() {
        return RouterFunctions
                .route(RequestPredicates.GET(ACTION_ROUTE), actionGetRoute())
                .andRoute(RequestPredicates.POST(ACTION_ROUTE), actionPostRoute())
                .andRoute(RequestPredicates.OPTIONS(ACTION_ROUTE), actionOptionRoute())
                ;
    }


    private HandlerFunction<ServerResponse> actionGetRoute() {
        return request -> extractParameters(request)
                .flatMap(t -> {
                        ActionStatus actionStatus = this.actionService.lookUpActionStatus(t.getT1(),t.getT2(),t.getT3(),t.getT4(),t.getT5());
                    if (actionStatus != null) {
                            return ok().contentType(MediaType.APPLICATION_JSON).body(fromObject(actionStatus));
                    }else{
                        return noContent().build();
                    }
                });
    }

    private HandlerFunction<ServerResponse> actionPostRoute() {
        return request -> extractParameters(request)
                .flatMap(t -> {
                    ActionStatus actionStatus = this.actionService.submitAction(t.getT1(),t.getT2(),t.getT3(),t.getT4(),t.getT5(),t.getT6());
                    if (actionStatus != null) {
                        return ok().contentType(MediaType.APPLICATION_JSON).body(fromObject(actionStatus));
                    }else{
                        return noContent().build();
                    }
                });
    }



    private Mono<Tuple6<String, String, String, String, String,String>> extractParameters(ServerRequest request) {
        String jwt = null;
        List<String> authorizations = request.headers().header("Authorization");
        if(!authorizations.isEmpty()){
            jwt = authorizations.get(0).replaceAll("Bearer (.+)","$1");

        }
        final String finalJwt = jwt;
        return request.bodyToMono(String.class)
                .switchIfEmpty(Mono.just(""))
                .map(body->Tuples.of(
                request.pathVariable("publisher"),
                request.pathVariable("processInstanceId"),
                request.pathVariable("state"),
                request.pathVariable("actionKey"),
                finalJwt,
                body));
    }

    private HandlerFunction<ServerResponse> actionOptionRoute() {
        return request -> ok().build();
    }
}
