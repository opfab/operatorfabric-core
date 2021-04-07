/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.users.configuration.oauth2;

import lombok.Getter;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Collection;

/**
 * Custom OperatorFabric Jwt Authentication Token whose custom principal is a {@link User} object
 * A specific token class is necessary for the Users service because it uses its own representation of user objects
 * (namely the UserData class, extending the User interface) rather than the User class like other services.
 *
 */
public class OpFabUsersJwtAuthenticationToken extends JwtAuthenticationToken {
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
    public OpFabUsersJwtAuthenticationToken(Jwt jwt, User principal, Collection<? extends GrantedAuthority>
       authorities) {
        super(jwt, authorities);
        this.principal = principal;
    }

}
