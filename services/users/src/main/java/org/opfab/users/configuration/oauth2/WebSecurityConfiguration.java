/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.users.configuration.oauth2;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authorization.AuthenticatedAuthorizationManager;
import org.springframework.security.authorization.AuthorityAuthorizationManager;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.authorization.AuthorizationManagers;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.Jwt;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;


/**
 * OAuth 2 http authentication configuration and access rules
 *
 *
 */
@Configuration
public class WebSecurityConfiguration {

    public static final String PROMETHEUS_PATH ="/actuator/prometheus**";
    public static final String LOGGERS_PATH ="/actuator/loggers/**";

    public static final String USER_PATH = "/users/{login}";
    public static final String USERS_SETTINGS_PATH = "/users/{login}/settings";
    public static final String USERS_PERIMETERS_PATH = "/users/{login}/perimeters";
    public static final String USER_TOKEN_SYNCHRONIZATION_PATH = "/users/synchronizeWithToken";
    public static final String USERS_PATH = "/users/**";
    public static final String USERS = "/users";
    public static final String GROUPS_PATH = "/groups/**";
    public static final String GROUPS = "/groups";
    public static final String ENTITIES_PATH = "/entities/**";
    public static final String ENTITIES = "/entities";
    public static final String PERIMETERS_PATH = "/perimeters/**";
    public static final String USER_ACTION_LOGS = "/userActionLogs";
    public static final String CURRENTUSER_INTERNAL_PATH = "/internal/CurrentUserWithPerimeters";
    public static final String ADMIN_ROLE = "ADMIN";

    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           Converter<Jwt, AbstractAuthenticationToken> opfabJwtConverter) throws Exception {
        configureCommon(http);
        http
                .oauth2ResourceServer()
                .jwt()
                .jwtAuthenticationConverter(opfabJwtConverter);

        return http.build();
    }

    /**This method handles the configuration to be shared with the test WebSecurityConfiguration class (access rules to be tested)
     * */
    public static void configureCommon(final HttpSecurity http) throws Exception {
        http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .and()
                .authorizeHttpRequests()
                .requestMatchers(HttpMethod.GET,PROMETHEUS_PATH).permitAll()
                .requestMatchers(HttpMethod.POST, USER_TOKEN_SYNCHRONIZATION_PATH).access(authenticatedAndIpAllowed())
                .requestMatchers(HttpMethod.GET, USER_PATH).access(hasRoleOrLoginAndIpAllowed(ADMIN_ROLE))
                .requestMatchers(HttpMethod.PUT, USER_PATH).access(hasRoleOrLoginAndIpAllowed(ADMIN_ROLE))
                .requestMatchers(HttpMethod.DELETE, USER_PATH).access(hasRoleAndLoginNotEqualAndIpAllowed(ADMIN_ROLE))
                .requestMatchers(HttpMethod.GET, USERS_SETTINGS_PATH).access(hasRoleOrLoginAndIpAllowed(ADMIN_ROLE))
                .requestMatchers(HttpMethod.PUT, USERS_SETTINGS_PATH).access(hasRoleOrLoginAndIpAllowed(ADMIN_ROLE))
                .requestMatchers(HttpMethod.PATCH, USERS_SETTINGS_PATH).access(hasRoleOrLoginAndIpAllowed(ADMIN_ROLE))
                .requestMatchers(HttpMethod.GET, USERS_PERIMETERS_PATH).access(hasRoleOrLoginAndIpAllowed(ADMIN_ROLE))
                .requestMatchers(HttpMethod.GET, USERS) .access(authenticatedAndIpAllowed())
                .requestMatchers(USERS_PATH).access(hasAnyRoleAndIpAllowed(ADMIN_ROLE))
                .requestMatchers(HttpMethod.GET, GROUPS).access(authenticatedAndIpAllowed())
                .requestMatchers(GROUPS_PATH).access(hasAnyRoleAndIpAllowed(ADMIN_ROLE))
                .requestMatchers(HttpMethod.GET, ENTITIES).access(authenticatedAndIpAllowed())   // OC-1067 : we authorize all users for GET /entities
                .requestMatchers(ENTITIES_PATH).access(hasAnyRoleAndIpAllowed(ADMIN_ROLE))
                .requestMatchers(PERIMETERS_PATH).access(hasAnyRoleAndIpAllowed(ADMIN_ROLE))
                .requestMatchers(USER_ACTION_LOGS).access(hasAnyRoleAndIpAllowed(ADMIN_ROLE))
                .requestMatchers(CURRENTUSER_INTERNAL_PATH).authenticated()
                .requestMatchers(LOGGERS_PATH).hasRole(ADMIN_ROLE)
                .anyRequest().access(authenticatedAndIpAllowed());
    }


    public static AuthorizationManager<RequestAuthorizationContext> authenticatedAndIpAllowed() {
        return AuthorizationManagers.allOf(AuthenticatedAuthorizationManager.authenticated(),
                            new OpfabIpAuthorizationManager());
    }

    public static AuthorizationManager<RequestAuthorizationContext> authenticatedAndLoginAllowed() {
        return AuthorizationManagers.allOf(AuthenticatedAuthorizationManager.authenticated(),
                            new OpfabLoginAuthorizationManager());
    }

    public static AuthorizationManager<RequestAuthorizationContext> hasAnyRoleAndIpAllowed(String... roles) {
        return AuthorizationManagers.allOf(AuthorityAuthorizationManager.hasAnyRole(roles),
                            new OpfabIpAuthorizationManager());
    }

    public static AuthorizationManager<RequestAuthorizationContext> hasRoleAndLoginAndIpAllowed(String role) {
        return AuthorizationManagers.allOf(AuthorityAuthorizationManager.hasAnyRole(role),
                            new OpfabLoginAuthorizationManager(),
                            new OpfabIpAuthorizationManager());
    }

    public static AuthorizationManager<RequestAuthorizationContext> hasRoleOrLoginAndIpAllowed(String role) {
        return AuthorizationManagers.allOf(
                            AuthorizationManagers.anyOf(AuthorityAuthorizationManager.hasAnyRole(role), 
                            new OpfabLoginAuthorizationManager()),
                            new OpfabIpAuthorizationManager());
    }

    public static AuthorizationManager<RequestAuthorizationContext> hasRoleAndLoginNotEqualAndIpAllowed(String role) {
        return AuthorizationManagers.allOf(AuthorityAuthorizationManager.hasAnyRole(role),
                            new OpfabLoginNotEqualAuthorizationManager(),
                            new OpfabIpAuthorizationManager());
    }
}
