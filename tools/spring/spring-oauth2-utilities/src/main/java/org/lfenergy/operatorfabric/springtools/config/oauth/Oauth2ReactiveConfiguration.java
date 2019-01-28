/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.springtools.config.oauth;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * <p>Authentication configuration for webflux</p>
 *
 * FIXME probably useless since Spring security 5.1.1. Check it.
 *
 * @author David Binder
 */
@Slf4j
@Configuration
public class Oauth2ReactiveConfiguration extends Oauth2GenericConfiguration{

    /**
     * Generates a converter that converts {@link Jwt} to {@link OpFabJwtAuthenticationToken} whose principal is  a
     * {@link User} model object
     *
     * @return Converter from {@link Jwt} to {@link OpFabJwtAuthenticationToken}
     */
    @Bean
    public Converter<Jwt, Mono<AbstractAuthenticationToken>> opfabReactiveJwtConverter(UserServiceProxy proxy) {

        return new Converter<Jwt, Mono<AbstractAuthenticationToken>>(){
            @Override
            public Mono<AbstractAuthenticationToken> convert(Jwt jwt) {
                String principalId = jwt.getClaimAsString("sub");
                Oauth2JwtProcessingUtilities.token.set(jwt);
                log.info("TestCache : User info is needed from ReactiveConfig for principal : {}", principalId);
                User user = userServiceCache.fetchUserFromCacheOrProxy(principalId);
                Oauth2JwtProcessingUtilities.token.remove();
                List<GrantedAuthority> authorities = Oauth2JwtProcessingUtilities.computeAuthorities(user);
                return Mono.just(new OpFabJwtAuthenticationToken(jwt, user, authorities));
            }
        };
    }

}
