/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.springtools.configuration.test;

import org.lfenergy.operatorfabric.springtools.configuration.oauth.OAuth2JwtProcessingUtilities;
import org.lfenergy.operatorfabric.springtools.configuration.oauth.OpFabJwtAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

/**
 * Creates {@link SecurityContext} containing token holding {@link WithMockOpFabUser} principal
 *
 * @author Alexandra Guironnet
 */
public class WithMockOpFabUserSecurityContextFactory implements WithSecurityContextFactory<WithMockOpFabUser> {

    @Override
    public SecurityContext createSecurityContext(WithMockOpFabUser customUser) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();

        OpFabUserDetails principal = new OpFabUserDetails(
                        customUser.login(),
                        customUser.firstName(),
                        customUser.lastName(),
                Arrays.asList(customUser.roles()));

        //Authentication auth = new UsernamePasswordAuthenticationToken(principal, "password", principal.getAuthorities());
        //TODO do the same for User service if proven useful
        String tokenValue = "dummyTokenValue";
        Instant issuedAt = Instant.now();
        Instant expiresAt = Instant.now().plus(365, ChronoUnit.DAYS);
        Map<String, Object> headers = new HashMap<>();
        headers.put("dummyHeaderKey","dummyHeaderValue");
        Map<String, Object> claim = new HashMap<>();
        claim.put("sub",customUser.login());
        Collection<GrantedAuthority> authorities = OAuth2JwtProcessingUtilities.computeAuthorities(principal);

        Authentication auth = new OpFabJwtAuthenticationToken(
                new Jwt(tokenValue, issuedAt,expiresAt,headers,claim
                ),principal,authorities);

        context.setAuthentication(auth);

        return context;
    }
}
