/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.consultation.config.webflux;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.consultation.controllers.CardOperationsController;
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
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

import java.util.Optional;

/**
 * <p></p>
 * Created on 22/05/18
 *
 * @author davibind
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
               if (request.queryParam("publishTestData").orElse("false").equals("true")) {
                   return builder.body(cardOperationsController.publishTestData(extractCardSubscriptionInfo(request)),
                      String.class);
               } else {
                   return builder.body(cardOperationsController.registerSubscriptionAndPublish
                         (extractCardSubscriptionInfo(request)),
                      String.class);
               }
           }
        );
    }

    private Mono<Tuple2<User, Optional<String>>> extractCardSubscriptionInfo(ServerRequest request){
        return request.principal()
           .map(principal->{
               OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
               return Tuples.of((User) jwtPrincipal.getPrincipal(),request.queryParam("clientId"));
           });
    }
}
