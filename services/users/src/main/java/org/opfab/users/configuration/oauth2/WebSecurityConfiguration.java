/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.users.configuration.oauth2;

import org.opfab.springtools.configuration.oauth.CustomAccessDeniedHandler;
import org.opfab.springtools.configuration.oauth.CustomAuthenticationEntryPoint;
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
    public static final String PERIMETERS_PATH = "/perimeters/**";
    public static final String USER_ACTION_LOGS = "/userActionLogs";
    public static final String NOTIFICATION_CONFIGURATION_PATH = "/notificationconfiguration/processstatenotified/**";
    public static final String EMAIL_NOTIFICATION_CONFIGURATION_PATH = "/notificationconfiguration/processstatenotifiedbymail/**";

    
    public static final String CURRENTUSER_INTERNAL_PATH = "/internal/CurrentUserWithPerimeters";
    public static final String USER_WITH_PERIMETERS_PATH = "/UserWithPerimeters";
    public static final String ADMIN_ROLE = "ADMIN";
    public static final String VIEW_USER_ACTION_LOGS_ROLE = "VIEW_USER_ACTION_LOGS";

    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           Converter<Jwt, AbstractAuthenticationToken> opfabJwtConverter) throws Exception {
        configureCommon(http);
        http
                .oauth2ResourceServer(oauth2ResourceServer -> oauth2ResourceServer
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(opfabJwtConverter))
                        .authenticationEntryPoint(new CustomAuthenticationEntryPoint()));

        return http.build();
    }

    /**This method handles the configuration to be shared with the test WebSecurityConfiguration class (access rules to be tested)
     * */
    public static void configureCommon(final HttpSecurity http) throws Exception {
        http
                .sessionManagement(sessionManagement -> sessionManagement
                    .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .accessDeniedHandler(new CustomAccessDeniedHandler())
                        .authenticationEntryPoint(new CustomAuthenticationEntryPoint()))
                .authorizeHttpRequests(authorizeHttpRequests -> authorizeHttpRequests
                    .requestMatchers(HttpMethod.GET,PROMETHEUS_PATH).permitAll()
                    .requestMatchers(HttpMethod.POST, USER_TOKEN_SYNCHRONIZATION_PATH).access(authenticated())
                    .requestMatchers(HttpMethod.GET, USER_PATH).access(hasRoleOrLogin(ADMIN_ROLE))
                    .requestMatchers(HttpMethod.PUT, USER_PATH).access(hasRoleOrLogin(ADMIN_ROLE))
                    .requestMatchers(HttpMethod.DELETE, USER_PATH).access(hasRoleAndLoginNotEqual(ADMIN_ROLE))
                    .requestMatchers(HttpMethod.GET, USERS_SETTINGS_PATH).access(hasRoleOrLogin(ADMIN_ROLE))
                    .requestMatchers(HttpMethod.PUT, USERS_SETTINGS_PATH).access(hasRoleOrLogin(ADMIN_ROLE))
                    .requestMatchers(HttpMethod.PATCH, USERS_SETTINGS_PATH).access(hasRoleOrLogin(ADMIN_ROLE))
                    .requestMatchers(HttpMethod.GET, USERS_PERIMETERS_PATH).access(hasRoleOrLogin(ADMIN_ROLE))
                    .requestMatchers(HttpMethod.GET, USERS) .access(authenticated())
                    .requestMatchers(USERS_PATH).access(hasAnyRole(ADMIN_ROLE))
                    .requestMatchers(HttpMethod.GET, GROUPS).access(authenticated())
                    .requestMatchers(GROUPS_PATH).access(hasAnyRole(ADMIN_ROLE))
                    .requestMatchers(HttpMethod.GET, ENTITIES_PATH).access(authenticated())
                    .requestMatchers(ENTITIES_PATH).access(hasAnyRole(ADMIN_ROLE))
                    .requestMatchers(PERIMETERS_PATH).access(hasAnyRole(ADMIN_ROLE))
                    .requestMatchers(USER_ACTION_LOGS).access(hasAnyRole(ADMIN_ROLE,VIEW_USER_ACTION_LOGS_ROLE))
                    .requestMatchers(USER_WITH_PERIMETERS_PATH).access(hasAnyRole(ADMIN_ROLE))
                    .requestMatchers(CURRENTUSER_INTERNAL_PATH).authenticated()
                    .requestMatchers(LOGGERS_PATH).hasRole(ADMIN_ROLE)
                    .requestMatchers(NOTIFICATION_CONFIGURATION_PATH).hasRole(ADMIN_ROLE)
                    .requestMatchers(EMAIL_NOTIFICATION_CONFIGURATION_PATH).hasRole(ADMIN_ROLE)
                    .anyRequest().access(authenticated())
                );
    }


    public static AuthorizationManager<RequestAuthorizationContext> authenticated() {
        return AuthenticatedAuthorizationManager.authenticated();
    }

    public static AuthorizationManager<RequestAuthorizationContext> hasAnyRole(String... roles) {
        return AuthorityAuthorizationManager.hasAnyRole(roles);
    }

    public static AuthorizationManager<RequestAuthorizationContext> hasRoleOrLogin(String role) {
        return AuthorizationManagers.allOf(
                            AuthorizationManagers.anyOf(AuthorityAuthorizationManager.hasAnyRole(role), 
                            new OpfabLoginAuthorizationManager()));
    }

    public static AuthorizationManager<RequestAuthorizationContext> hasRoleAndLoginNotEqual(String role) {
        return AuthorizationManagers.allOf(AuthorityAuthorizationManager.hasAnyRole(role),
                            new OpfabLoginNotEqualAuthorizationManager());
    }
}
