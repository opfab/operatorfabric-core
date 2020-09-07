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
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Mono;


/**
 * Configures web security for cards-publication service
 *
 */
@Configuration
@Slf4j
@EnableWebFluxSecurity
@Profile(value = {"!test"})
public class WebSecurityConfiguration {

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
                .pathMatchers("/cards/userCard/**").authenticated()
                .pathMatchers("/**").permitAll();

        http.csrf().disable();


    }




}
