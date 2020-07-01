/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.consultation.configuration.webflux;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Mono;


/**
 * Configures web security
 *
 */
@Configuration
@Slf4j
@EnableWebFluxSecurity
public class WebSecurityConfiguration {

    /**
     * Secures access (all uris are secured)
     *
     * @param http
     *    http security configuration
     * @param opfabReactiveJwtConverter
     *    OperatorFabric authentication converter
     * @return http security filter chain
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

    /**This method handles the configuration to be shared with the test WebSecurityConfiguration class (access rules to be tested)
     * */
    public static void configureCommon(final ServerHttpSecurity http) {
        http
                .headers().frameOptions().disable()
                .and()
                .authorizeExchange()
                .anyExchange().authenticated();
    }
}
