/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.consultation.configuration.webflux;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Mono;


@Configuration
@EnableWebFluxSecurity
public class WebSecurityConfiguration {

    public static final String PROMETHEUS_PATH = "/actuator/prometheus**";
    public static final String LOGGERS_PATH = "/actuator/loggers/**";
    public static final String CONNECTIONS = "/connections";
    public static final String CONNECTIONS_PATH = "/connections**";
    public static final String MESSAGE_TO_SUBSCRIPTIONS = "/messageToSubscriptions";
    public static final String ADMIN_ROLE = "ADMIN";


    /**
     * Secures access (all uris are secured)
     *
     * @param http                      http security configuration
     * @param opfabReactiveJwtConverter OperatorFabric authentication converter
     * @return http security filter chain
     */
    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http,
            Converter<Jwt, Mono<AbstractAuthenticationToken>> opfabReactiveJwtConverter) {
        configureCommon(http);
        http
                .oauth2ResourceServer(oauth2ResourceServer -> oauth2ResourceServer
                    .jwt(jwt -> jwt
                        .jwtAuthenticationConverter(opfabReactiveJwtConverter))
                );

        return http.build();
    }

    /**
     * This method handles the configuration to be shared with the test
     * WebSecurityConfiguration class (access rules to be tested)
     */
    public static void configureCommon(final ServerHttpSecurity http) {
        http
                .headers(headers -> headers
                    .frameOptions(frameOptions -> frameOptions
                        .disable()
                    )
                )
                .authorizeExchange(authorizeExchange -> authorizeExchange
                    .pathMatchers(HttpMethod.GET, PROMETHEUS_PATH).permitAll()
                    .pathMatchers(HttpMethod.GET, CONNECTIONS).authenticated()
                    .pathMatchers(CONNECTIONS_PATH).hasRole(ADMIN_ROLE)
                    .pathMatchers(LOGGERS_PATH).hasRole(ADMIN_ROLE)
                    .pathMatchers(MESSAGE_TO_SUBSCRIPTIONS).hasRole(ADMIN_ROLE)
                    .anyExchange().access(new IpAddressAuthorizationManager())
                );
    }
}
