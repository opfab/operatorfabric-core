/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.publication.security.configuration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authorization.AuthorizationContext;
import reactor.core.publisher.Mono;

import java.util.Collection;
import java.util.Collections;


/**
 * Configures web security for cards-publication service
 *
 */
@Configuration
@Slf4j
@EnableWebFluxSecurity
@Profile(value = {"!test"})
public class WebSecurityConfiguration {

    private static final Collection<String> allowedAuthorities= Collections.singletonList("ROLE_ADMIN");
    /**
     * Secures access (all uris are secured)
     * SecurityWebFilterChain
     *
     */
    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http,
                                                            Converter<Jwt, Mono<AbstractAuthenticationToken>>
                                                                    opfabReactiveJwtConverter) {
        configureCommon(http);
        http
                .oauth2ResourceServer()
                .jwt()
                .jwtAuthenticationConverter(opfabReactiveJwtConverter);
        return http.build();
    }

    /**
     * securing webflux endpoints
     * for the moment, secure only /cards/userCard/ endpoint
     * */
    public static void configureCommon(final ServerHttpSecurity http) {
        http
                .headers().frameOptions().disable()
                .and()
                .authorizeExchange()
                .pathMatchers("/cards/userCard/**").access(WebSecurityConfiguration::currentUserHasAllowedRole)
                .pathMatchers("/**").permitAll();

        http.csrf().disable();


    }

    /**
     * */
    private  static Mono<AuthorizationDecision> currentUserHasAllowedRole(Mono<Authentication> authentication, AuthorizationContext context) {
        return authentication
                .filter(Authentication::isAuthenticated)
                .flatMapIterable(Authentication::getAuthorities)
                .map(GrantedAuthority::getAuthority).any(allowedAuthorities::contains)
                .map(AuthorizationDecision::new)
                .defaultIfEmpty(new AuthorizationDecision(false));
    }


}
