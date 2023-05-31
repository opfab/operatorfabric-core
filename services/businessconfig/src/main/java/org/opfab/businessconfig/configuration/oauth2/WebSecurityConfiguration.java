/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.businessconfig.configuration.oauth2;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authorization.AuthorityAuthorizationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.SecurityFilterChain;

import static org.opfab.springtools.configuration.oauth.OpfabAuthorizationManager.hasAnyRoleAndIpAllowed;
import static org.opfab.springtools.configuration.oauth.OpfabAuthorizationManager.authenticatedAndIpAllowed;

/**
 * OAuth 2 http authentication configuration and access rules
 *
 *
 */
@Configuration
public class WebSecurityConfiguration {

    public static final String PROMETHEUS_PATH ="/actuator/prometheus**";
    public static final String LOGGERS_PATH ="/actuator/loggers/**";
    public static final String ADMIN_ROLE = "ADMIN";
    public static final String ADMIN_BUSINESS_PROCESS_ROLE = "ADMIN_BUSINESS_PROCESS";
    public static final String THIRDS_PATH = "/businessconfig/**";
    public static final String BUSINESS_DATA_PATH = "/businessconfig/businessdata/**";


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           Converter<Jwt, AbstractAuthenticationToken> opfabJwtConverter) throws Exception {
        configureCommon(http);

        http
                .oauth2ResourceServer()
                .jwt().jwtAuthenticationConverter(opfabJwtConverter);


        return http.build();
    }

    /* We remove authentication for GET on THIRDS_PATH because :
    1) style is called via <style>, so no token is provided (Static resource)
    2) it is called by CardPublication when checkAuthenticationForCardSending is set to false
    3) it is called for publishing card, for checking if process/state exists in the bundles */
    public static void configureCommon(final HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests()
            .requestMatchers(HttpMethod.GET, PROMETHEUS_PATH).permitAll()
            .requestMatchers(HttpMethod.GET, THIRDS_PATH).permitAll()
            .requestMatchers(HttpMethod.POST, THIRDS_PATH).access(hasAnyRoleAndIpAllowed(ADMIN_ROLE, ADMIN_BUSINESS_PROCESS_ROLE))
            .requestMatchers(HttpMethod.PUT, THIRDS_PATH).access(hasAnyRoleAndIpAllowed(ADMIN_ROLE, ADMIN_BUSINESS_PROCESS_ROLE))
            .requestMatchers(HttpMethod.DELETE, THIRDS_PATH).access(hasAnyRoleAndIpAllowed(ADMIN_ROLE, ADMIN_BUSINESS_PROCESS_ROLE))
            .requestMatchers(LOGGERS_PATH).access(AuthorityAuthorizationManager.hasRole(ADMIN_ROLE))
            .anyRequest().access(authenticatedAndIpAllowed());

    }

}
