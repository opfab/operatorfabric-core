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
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;

import reactor.core.publisher.Mono;

/**
 * JWT configuration for cards consultation service which is a reactive service
 *
 * It extends the generic JwtConfiguration to adjust the converter to the
 * reactive library
 *
 */
@Configuration
public class JwtReactiveConfiguration extends JwtConfiguration {

    public JwtReactiveConfiguration(UserServiceCache userServiceCache, JwtProperties jwtProperties) {
        super(userServiceCache, jwtProperties);
    }

    @Bean
    public Converter<Jwt, Mono<AbstractAuthenticationToken>> opfabReactiveJwtConverter()
            throws IllegalArgumentException {
        return new Converter<Jwt, Mono<AbstractAuthenticationToken>>() {
            @Override
            public Mono<AbstractAuthenticationToken> convert(Jwt jwt) throws IllegalArgumentException {
                AbstractAuthenticationToken authenticationToken = generateOpFabJwtAuthenticationToken(jwt);
                return Mono.just(authenticationToken);
            }
        };
    }

}
