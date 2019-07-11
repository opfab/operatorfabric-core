/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.actions.configuration.webflux;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.actions.model.Action;
import org.lfenergy.operatorfabric.actions.model.ActionStatusData;
import org.lfenergy.operatorfabric.actions.services.feign.CardConsultationServiceProxy;
import org.lfenergy.operatorfabric.actions.services.feign.ThirdsServiceProxy;
import org.lfenergy.operatorfabric.cards.model.Card;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.*;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple3;
import reactor.util.function.Tuples;

import static org.springframework.web.reactive.function.BodyInserters.fromObject;
import static org.springframework.web.reactive.function.server.ServerResponse.notFound;
import static org.springframework.web.reactive.function.server.ServerResponse.ok;

@Slf4j
@Configuration
public class ActionRoutesConfig {

    private final CardConsultationServiceProxy cardService;
    private final ThirdsServiceProxy thirdsService;

    @Autowired
    public ActionRoutesConfig(CardConsultationServiceProxy cardService, ThirdsServiceProxy thirdsService){
        this.cardService = cardService;
        this.thirdsService = thirdsService;
    }

    /**
     * Card route configuration
     * @return route
     */
    @Bean
    public RouterFunction<ServerResponse> cardRoutes() {
        return RouterFunctions
                .route(RequestPredicates.GET("/process/{processInstanceId}/states/{state}/actions/{actionKey}"),actionGetRoute())
                .andRoute(RequestPredicates.POST("/process/{processInstanceId}/states/{state}/actions/{actionKey}"),actionPostRoute())
                .andRoute(RequestPredicates.OPTIONS("/process/{processInstanceId}/states/{state}/actions/{actionKey}"),actionOptionRoute());
    }


    private HandlerFunction<ServerResponse> actionGetRoute() {
        return request -> extractParameters(request)
                    .flatMap(t -> {
                        Action action = lookUpAction(t.getT1(),t.getT3());
                        if(action != null) {
                            if (action.getUpdateState() || action.getUpdateStateBeforeAction())
                                return ok().contentType(MediaType.APPLICATION_JSON).body(fromObject(ActionStatusData.fromAction(action)));
                            else
                                return ok().contentType(MediaType.APPLICATION_JSON).body(fromObject(ActionStatusData.fromAction(action)));
                        }
                        return notFound().build();
                    });
    }

    private HandlerFunction<ServerResponse> actionPostRoute() {
        return request -> extractParameters(request)
                .flatMap(t -> {
                    Action action = lookUpAction(t.getT1(),t.getT3());
                    if(action != null) {
                        return ok().contentType(MediaType.APPLICATION_JSON).body(fromObject(ActionStatusData.fromAction(action)));
                    }
                    return notFound().build();
                });
    }

    private Action lookUpAction(String cardId, String actionKey){
        Card card = this.cardService.fetchCard(cardId);
        if (card != null) {
            Action action = this.thirdsService.fetchAction(card.getPublisher(), card.getProcess(), card.getState(), actionKey);
            if (action != null) {
                return action;
            }
        }
        return null;
    }

    private Mono<Tuple3<String, String, String>> extractParameters(ServerRequest request) {
        return Mono.just(Tuples.of(request.pathVariable("processInstanceId"),
                request.pathVariable("state"),
                request.pathVariable("actionKey")));
    }

    private HandlerFunction<ServerResponse> actionOptionRoute() {
        return request -> ok().build();
    }
}
