/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.configuration.oauth2;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.SecurityFilterChain;

import static org.opfab.springtools.configuration.oauth.OpfabAuthorizationManager.authenticatedAndIpAllowed;
import static org.opfab.springtools.configuration.oauth.OpfabAuthorizationManager.hasAnyRoleAndIpAllowed;

/**
 * OAuth 2 http authentication configuration and access rules
 *
 *
 */
@Configuration
public class WebSecurityConfiguration {

    public static final String PROMETHEUS_PATH ="/actuator/prometheus**";
    public static final String LOGGERS_PATH ="/actuator/loggers/**";
    public static final String CONFIGURATIONS_ROOT_PATH = "/configurations/";
    public static final String CONFIGURATIONS_USERS_PATH = CONFIGURATIONS_ROOT_PATH + "users/{login}";
    public static final String DEVICES_ROOT_PATH = "/devices/";
    public static final String NOTIFICATIONS_ROOT_PATH = "/notifications";

    public static final String ADMIN_ROLE = "ADMIN";

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           Converter<Jwt, AbstractAuthenticationToken> opfabJwtConverter) throws Exception {
        configureCommon(http);
        http
                .oauth2ResourceServer(oauth2ResourceServer -> oauth2ResourceServer
                    .jwt(jwt -> jwt
                        .jwtAuthenticationConverter(opfabJwtConverter))
                );

        return http.build();
    }

    public static void configureCommon(final HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authorizeHttpRequests -> authorizeHttpRequests
                    .requestMatchers(HttpMethod.GET,PROMETHEUS_PATH).permitAll()
                    .requestMatchers(LOGGERS_PATH).hasRole(ADMIN_ROLE)
                    .requestMatchers(HttpMethod.POST,NOTIFICATIONS_ROOT_PATH).access(authenticatedAndIpAllowed())
                    .requestMatchers(HttpMethod.GET, CONFIGURATIONS_USERS_PATH).access(authenticatedAndIpAllowed())
                    .requestMatchers(CONFIGURATIONS_ROOT_PATH+"**").access(hasAnyRoleAndIpAllowed(ADMIN_ROLE))
                    .requestMatchers(DEVICES_ROOT_PATH+"**").access(hasAnyRoleAndIpAllowed(ADMIN_ROLE))
                    .anyRequest().access(hasAnyRoleAndIpAllowed(ADMIN_ROLE))
                );
    }

}
