/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.springtools.configuration.oauth;

import org.opfab.springtools.configuration.oauth.jwt.JwtProperties;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.User;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.io.IOException;
import java.util.List;

/**
 * Common JWT configuration for services
 * The aim of the converter is to convert the JWT default object to a new
 * OpFabJwtAuthenticationToken that contains the user information
 * and the permissions of the user. These information are fetched from the
 * UserServiceCache that is a cache of the user information populated
 * by the user service.
 */
@Configuration
@Import({ UpdateUserListenerConfiguration.class, JwtProperties.class })
public class JwtConfiguration {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(JwtConfiguration.class);

    protected UserServiceCache userServiceCache;
    protected JwtProperties jwtProperties;

    public JwtConfiguration(UserServiceCache userServiceCache,
            JwtProperties jwtProperties) {
        this.userServiceCache = userServiceCache;
        this.jwtProperties = jwtProperties;
    }

    @Bean
    public Converter<Jwt, AbstractAuthenticationToken> opfabJwtConverter() {

        return new Converter<Jwt, AbstractAuthenticationToken>() {
            @Override
            public AbstractAuthenticationToken convert(Jwt jwt) throws IllegalArgumentException {
                return generateOpFabJwtAuthenticationToken(jwt);
            }
        };
    }

    protected AbstractAuthenticationToken generateOpFabJwtAuthenticationToken(Jwt jwt) throws IllegalArgumentException {

        String principalId = jwt.getClaimAsString(jwtProperties.getLoginClaim()).toLowerCase();
        userServiceCache.setTokenForUserRequest(principalId, jwt.getTokenValue());
        CurrentUserWithPerimeters currentUserWithPerimeters;
        try {
            currentUserWithPerimeters = userServiceCache.fetchCurrentUserWithPerimetersFromCacheOrProxy(principalId);

            if (currentUserWithPerimeters != null) {
                User user = currentUserWithPerimeters.getUserData();

                if (user != null) {
                    List<GrantedAuthority> authorities = PermissionConverter
                            .computeAuthorities(currentUserWithPerimeters.getPermissions());
                    return new OpFabJwtAuthenticationToken(jwt, currentUserWithPerimeters, authorities);
                }
            }
        } catch (IOException e) {
            log.error("Error getting user information", e);
            throw new IllegalArgumentException("Error getting user information", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Error getting user information (Interrupted Exception)", e);
            throw new IllegalArgumentException("Error getting user information (Interrupted Exception)", e);
        }
        return null;
    }

}
