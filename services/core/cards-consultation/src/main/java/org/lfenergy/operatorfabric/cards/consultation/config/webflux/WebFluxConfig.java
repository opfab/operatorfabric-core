/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.config.webflux;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.consultation.controllers.CardOperationsController;
import org.lfenergy.operatorfabric.cards.consultation.controllers.CardOperationsGetParameters;
import org.lfenergy.operatorfabric.springtools.config.oauth.OpFabJwtAuthenticationToken;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.config.WebFluxConfigurer;
import org.springframework.web.reactive.config.WebFluxConfigurerComposite;
import org.springframework.web.reactive.function.server.*;
import reactor.core.publisher.Mono;

/**
 * Webflux configuration. configures:
 * <ul>
 *     <li>CORS</li>
 *     <li>REST routes</li>
 * </ul>
 *
 * @author David Binder
 */
@Slf4j
@Configuration
public class WebFluxConfig {

    private final CardOperationsController cardOperationsController;

    @Autowired
    public WebFluxConfig(CardOperationsController cardOperationsController) {
        this.cardOperationsController = cardOperationsController;
    }

    @Bean
    public WebFluxConfigurer corsConfigurer() {
        return new WebFluxConfigurerComposite() {

            @Override
            public void addCorsMappings(org.springframework.web.reactive.config.CorsRegistry registry) {
                registry
                   .addMapping("/cards/**")
                   .allowedOrigins("*")
                   .allowedMethods("*");
            }
        };
    }

    @Bean
    public RouterFunction<ServerResponse> cardOperationRoutes() {
        return RouterFunctions.route(RequestPredicates.GET("/cardOperations"),
           request -> {
               ServerResponse.BodyBuilder builder = ServerResponse.ok()
                  .contentType(MediaType.TEXT_EVENT_STREAM);
               Mono<CardOperationsGetParameters> input = extractCardSubscriptionInfo(request);
               if (request.queryParam("test").orElse("false").equals("true")) {
                   return builder.body(cardOperationsController.publishTestData(input),
                      String.class);
               } else {
                   return builder.body(cardOperationsController.registerSubscriptionAndPublish
                         (input),
                      String.class);
               }
           }
        );
    }

    private Mono<CardOperationsGetParameters> extractCardSubscriptionInfo(ServerRequest request){
        return request.principal()
           .map(principal->{
               OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
               return CardOperationsGetParameters.builder()
                       .user((User) jwtPrincipal.getPrincipal())
                       .clientId(request.queryParam("clientId").orElse(null))
                       .rangeStart(parseAsLong(request.queryParam("rangeStart").orElse(null)))
                       .rangeEnd(parseAsLong(request.queryParam("rangeEnd").orElse(null)))
                       .test(request.queryParam("test").orElse("false").equals("true"))
                       .notification(request.queryParam("notification").orElse("false").equals("true"))
                       .build();
           });
    }

    private Long parseAsLong(String rangeStart) {
        return rangeStart==null?null:Long.parseLong(rangeStart);
    }
}
