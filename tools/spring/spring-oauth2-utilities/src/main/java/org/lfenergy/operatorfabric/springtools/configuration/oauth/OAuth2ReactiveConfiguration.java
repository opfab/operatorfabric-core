/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.springtools.configuration.oauth;

import java.util.List;

import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import feign.FeignException;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

/**
 * <p>Authentication configuration for webflux</p>
 *
 * FIXME probably useless since Spring security 5.1.1. Check it.
 *
 * @author David Binder
 */
@Slf4j
@Configuration
public class OAuth2ReactiveConfiguration extends OAuth2GenericConfiguration{

    /**
     * Generates a converter that converts {@link Jwt} to {@link OpFabJwtAuthenticationToken} whose principal is  a
     * {@link User} model object
     * @return Converter from {@link Jwt} to {@link OpFabJwtAuthenticationToken}
     */
    @Bean
    public Converter<Jwt, Mono<AbstractAuthenticationToken>> opfabReactiveJwtConverter() {

        return new Converter<Jwt, Mono<AbstractAuthenticationToken>>(){
            @Override
            public Mono<AbstractAuthenticationToken> convert(Jwt jwt) throws FeignException {
                String principalId = jwt.getClaimAsString("sub");
                OAuth2JwtProcessingUtilities.token.set(jwt);
                User user = userServiceCache.fetchUserFromCacheOrProxy(principalId);
				OAuth2JwtProcessingUtilities.token.remove();
                
				List<GrantedAuthority> authorities = null;
				switch (groupsProperties.getMode()) {
					case JWT :
						// override the groups list from JWT mode
						user.setGroups(getGroupsList(jwt));
					case OPERATOR_FABRIC : 
						authorities = OAuth2JwtProcessingUtilities.computeAuthorities(user);
						break;
					default : authorities = null;	
				}
				
				log.debug("user ["+principalId+"] has these roles " + authorities.toString() + " through the " + groupsProperties.getMode()+ " mode");

                return Mono.just(new OpFabJwtAuthenticationToken(jwt, user, authorities));
            }
        };
    }

}
