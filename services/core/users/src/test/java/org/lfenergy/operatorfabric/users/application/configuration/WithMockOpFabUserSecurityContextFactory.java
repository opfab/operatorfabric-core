/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.users.application.configuration;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

import java.util.Arrays;

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
                        Arrays.asList(customUser.entities()));

        Authentication auth = new UsernamePasswordAuthenticationToken(principal, "password", principal.getAuthorities());

        context.setAuthentication(auth);

        return context;
    }
}
