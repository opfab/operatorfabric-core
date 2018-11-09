/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.springtools.config.oauth;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;

/**
 * <p>Authentication configuration for webflux</p>
 *
 * FIXME probably useless since Spring security 5.1.1. Check it.
 *
 * @author David Binder
 */
@Configuration
@Slf4j
public class Oauth2ReactiveConfiguration {


    @Bean
    public ReactiveAuthenticationManager opfabJwtReactiveAuthenticationManager(ReactiveJwtDecoder jwtDecoder,Converter<Jwt, AbstractAuthenticationToken> opfabJwtConverter){
        return new OpfabJwtReactiveAuthenticationManager(jwtDecoder,opfabJwtConverter);
    }
}
