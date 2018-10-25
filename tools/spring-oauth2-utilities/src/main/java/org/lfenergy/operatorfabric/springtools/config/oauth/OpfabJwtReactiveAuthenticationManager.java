/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.springtools.config.oauth;

import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.server.resource.BearerTokenAuthenticationToken;
import org.springframework.security.oauth2.server.resource.BearerTokenError;
import org.springframework.security.oauth2.server.resource.BearerTokenErrorCodes;
import org.springframework.util.Assert;
import reactor.core.publisher.Mono;

/**
 * A {@link ReactiveAuthenticationManager} for Jwt tokens.
 *
 * @author Rob Winch
 * @since 5.1
 */
public final class OpfabJwtReactiveAuthenticationManager implements ReactiveAuthenticationManager {
    private final Converter<Jwt, AbstractAuthenticationToken> jwtAuthenticationConverter;

    private final ReactiveJwtDecoder jwtDecoder;

    public OpfabJwtReactiveAuthenticationManager(ReactiveJwtDecoder jwtDecoder, Converter<Jwt, AbstractAuthenticationToken> authenticationConverter) {
        Assert.notNull(jwtDecoder, "jwtDecoder cannot be null");
        Assert.notNull(authenticationConverter, "authenticationConverter cannot be null");
        this.jwtDecoder = jwtDecoder;
        jwtAuthenticationConverter = authenticationConverter;
    }

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        return Mono.justOrEmpty(authentication)
                .filter(a -> a instanceof  BearerTokenAuthenticationToken)
                .cast(BearerTokenAuthenticationToken.class)
                .map(BearerTokenAuthenticationToken::getToken)
                .flatMap(this.jwtDecoder::decode)
                .map(this.jwtAuthenticationConverter::convert)
                .cast(Authentication.class)
                .onErrorMap(JwtException.class, this::onError);
    }

    private OAuth2AuthenticationException onError(JwtException e) {
        OAuth2Error invalidRequest = invalidToken(e.getMessage());
        return new OAuth2AuthenticationException(invalidRequest, e.getMessage());
    }

    private static OAuth2Error invalidToken(String message) {
        return new BearerTokenError(
                BearerTokenErrorCodes.INVALID_TOKEN,
                HttpStatus.UNAUTHORIZED,
                message,
                "https://tools.ietf.org/html/rfc6750#section-3.1");
    }
}
