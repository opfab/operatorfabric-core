/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.springtools.configuration.test;

import org.opfab.springtools.configuration.oauth.OAuth2JwtProcessingUtilities;
import org.opfab.springtools.configuration.oauth.OpFabJwtAuthenticationToken;
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
 *
 */
public class WithMockOpFabUserSecurityContextFactory implements WithSecurityContextFactory<WithMockOpFabUser> {

    @Override
    public SecurityContext createSecurityContext(WithMockOpFabUser customUser) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();

        OpFabUserDetails principal = new OpFabUserDetails(
                        customUser.login(),
                        customUser.firstName(),
                        customUser.lastName(),
                Arrays.asList(customUser.roles()),
                customUser.entities() != null ? Arrays.asList(customUser.entities()) : null);

        String tokenValue = "dummyTokenValue";
        Instant issuedAt = Instant.now();
        Instant expiresAt = Instant.now().plus(365, ChronoUnit.DAYS);
        Map<String, Object> headers = new HashMap<>();
        headers.put("dummyHeaderKey","dummyHeaderValue");
        Map<String, Object> claim = new HashMap<>();
        claim.put("sub",customUser.login());
        Collection<GrantedAuthority> authorities = OAuth2JwtProcessingUtilities.computeAuthorities(principal.getUserData());

        Authentication auth = new OpFabJwtAuthenticationToken(
                new Jwt(tokenValue, issuedAt,expiresAt,headers,claim
                ),principal,authorities);

        context.setAuthentication(auth);

        return context;
    }
}
