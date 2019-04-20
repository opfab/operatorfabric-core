/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.application.configuration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authorization.AuthorizationContext;
import reactor.core.publisher.Mono;


/**
 * Configures web security

 * This should match the main WebSecurity configuration for the service, with the following changes:
 *  - Disable csrf
 *  - Remove configuration of OAuth2ResourceServer
 *
 * @author David Binder
 */
@Configuration
@Slf4j
@EnableWebFluxSecurity
public class WebSecurityConfiguration {

    /**
     * Secures access (all uris are secured)
     *
     * @param httpSecurity
     *    http security configuration
     * @return http security filter chain
     */
    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity httpSecurity) {
        httpSecurity.headers().frameOptions().disable();
        httpSecurity.csrf().disable();
        httpSecurity
                .authorizeExchange()
                .pathMatchers(HttpMethod.OPTIONS).permitAll()
                .pathMatchers("/cards/**").access(this::currentUserHasAnyRole)
                .pathMatchers("/cardSubscription/**").access(this::currentUserHasAnyRole)
                .anyExchange().authenticated();
        return httpSecurity.build();
    }

    private Mono<AuthorizationDecision> currentUserHasAnyRole(Mono<Authentication> authentication, AuthorizationContext context) {
        log.info("currentUserHasAnyRole was called");
        return authentication
                .filter(a -> a.isAuthenticated())
                .flatMapIterable( a -> a.getAuthorities())
                .hasElements()
                .map(hasAuthorities -> new AuthorizationDecision(hasAuthorities))
                .defaultIfEmpty(new AuthorizationDecision(false))
                .log()
                ;
    }

}
