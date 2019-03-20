/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.springtools.configuration.oauth;

import lombok.Getter;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Collection;

/**
 * Custom OperatorFabric Jwt Authentication Token whose custom principal is a {@link User} object
 *
 * @author David Binder
 */
public class OpFabJwtAuthenticationToken extends JwtAuthenticationToken {
    @Getter
    private final Object principal;

    /**
     * @param jwt
     *    original Jwt object from http call
     * @param principal
     *    custom principal
     * @param authorities
     *    list of authorities
     */
    public OpFabJwtAuthenticationToken(Jwt jwt, User principal, Collection<? extends GrantedAuthority>
       authorities) {
        super(jwt, authorities);
        this.principal = principal;
    }
}
