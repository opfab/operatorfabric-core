/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.springtools.configuration.oauth;

import org.opfab.springtools.configuration.oauth.jwt.JwtProperties;
import org.opfab.springtools.configuration.oauth.jwt.groups.GroupsProperties;
import org.opfab.springtools.configuration.oauth.jwt.groups.GroupsUtils;
import org.opfab.users.model.User;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;

import reactor.core.publisher.Mono;

/**
 * <p>Authentication configuration for webflux</p>
 *
 */
@Configuration
public class OAuth2ReactiveConfiguration extends OAuth2GenericConfiguration{

    
    public OAuth2ReactiveConfiguration(UserServiceCache userServiceCache,GroupsProperties groupsProperties,JwtProperties jwtProperties, GroupsUtils groupsUtils) {
        super(userServiceCache, groupsProperties,jwtProperties,groupsUtils);
    }

    /**
     * Generates a converter that converts {@link Jwt} to {@link OpFabJwtAuthenticationToken} whose principal is  a
     * {@link User} model object
     * @return Converter from {@link Jwt} to {@link OpFabJwtAuthenticationToken}
     */
    @Bean
    public Converter<Jwt, Mono<AbstractAuthenticationToken>> opfabReactiveJwtConverter() throws IllegalArgumentException {
        return new Converter<Jwt, Mono<AbstractAuthenticationToken>>(){
            @Override
            public Mono<AbstractAuthenticationToken> convert(Jwt jwt) throws IllegalArgumentException {
            	AbstractAuthenticationToken authenticationToken = generateOpFabJwtAuthenticationToken(jwt);
                return Mono.just(authenticationToken);
            }
        };
    }


}
