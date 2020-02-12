/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.springtools.configuration.oauth;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.data.Holder;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
//import org.springframework.security.oauth2.client.OAuth2ClientContext;

/**
 * <p>Feign interceptor used to add OAuth2  authentication to http headers :</p>
 * {@code Authorization: Bearer [token]}
 *
 *
 */
@Slf4j
public class OAuth2FeignRequestInterceptor implements RequestInterceptor {

    private static final String AUTHORIZATION_HEADER = "Authorization";

    private static final String BEARER_TOKEN_TYPE = "Bearer";
    private final Holder<OpFabJwtAuthenticationToken> authHolder = new Holder<>(null);

    public OAuth2FeignRequestInterceptor(){
        ReactiveSecurityContextHolder.getContext()
                .subscribe(context -> {
                    log.info("context changed");
                    authHolder.setValue((OpFabJwtAuthenticationToken) context.getAuthentication());
                });
    }

    @Override
    public void apply(RequestTemplate template) {
        OpFabJwtAuthenticationToken authentication = extractAuthentication();

        Jwt jwt = null;
        if (template.headers().containsKey(AUTHORIZATION_HEADER)) {
            log.warn("The Authorization token has been already set");
        } else if (authentication != null) {
            jwt = authentication.getToken();
        } else if (authentication == null) {
            log.info("Cannot obtain token data from security context, checking ThreadLocal");
            jwt = OAuth2JwtProcessingUtilities.token.get();
            if (jwt == null)
                log.warn("Can not obtain existing token for request, if it is a non secured request, ignore.");
        }
        if (jwt != null) {
            log.debug("Constructing Header {} for Token {}", AUTHORIZATION_HEADER, BEARER_TOKEN_TYPE);
            template.header(AUTHORIZATION_HEADER, String.format("%s %s", BEARER_TOKEN_TYPE,
                    jwt.getTokenValue()));
        }
    }

    private OpFabJwtAuthenticationToken extractAuthentication() {
        OpFabJwtAuthenticationToken authentication = extractAuthenticationFromContext(SecurityContextHolder.getContext());
        if (authentication == null) {
            authentication = authHolder.getValue();
        }
        return authentication;
    }

    private OpFabJwtAuthenticationToken extractAuthenticationFromContext(SecurityContext context) {
        return (OpFabJwtAuthenticationToken) context
                .getAuthentication();
    }
}
