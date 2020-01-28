
package org.lfenergy.operatorfabric.springtools.configuration.oauth;

import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;

import feign.FeignException;
import reactor.core.publisher.Mono;

/**
 * <p>Authentication configuration for webflux</p>
 *
 * FIXME probably useless since Spring security 5.1.1. Check it.
 *
 * @author David Binder
 */
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
            	AbstractAuthenticationToken authenticationToken = generateOpFabJwtAuthenticationToken(jwt);
                return Mono.just(authenticationToken);
            }
        };
    }

}
