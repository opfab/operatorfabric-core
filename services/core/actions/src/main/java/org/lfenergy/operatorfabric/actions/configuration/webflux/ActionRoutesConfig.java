/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.actions.configuration.webflux;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.*;
import reactor.core.publisher.Mono;

import static org.springframework.web.reactive.function.BodyInserters.fromObject;
import static org.springframework.web.reactive.function.server.ServerResponse.notFound;
import static org.springframework.web.reactive.function.server.ServerResponse.ok;

@Slf4j
@Configuration
public class ActionRoutesConfig {

//    private final CardRepository cardRepository;
//
//    @Autowired
//    public CardRoutesConfig(CardRepository cardRepository){
//        this.cardRepository = cardRepository;
//    }

    /**
     * Card route configuration
     * @return route
     */
    @Bean
    public RouterFunction<ServerResponse> cardRoutes() {
        return RouterFunctions
                .route(RequestPredicates.GET("/actions/{id}"),actionGetRoute());
    }


    private HandlerFunction<ServerResponse> actionGetRoute() {
        return request -> Mono.empty()
                    .flatMap(action-> ok().contentType(MediaType.APPLICATION_JSON).body(fromObject(action)))
                    .switchIfEmpty(notFound().build());
    }

    private HandlerFunction<ServerResponse> cardOptionRoute() {
        return request -> ok().build();
    }
}
