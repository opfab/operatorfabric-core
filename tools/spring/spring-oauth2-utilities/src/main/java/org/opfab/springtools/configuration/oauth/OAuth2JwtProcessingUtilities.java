/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.springtools.configuration.oauth;

import org.opfab.users.model.PermissionEnum;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Some share utilities
 *
 *
 */
public class OAuth2JwtProcessingUtilities {
    /**
     * Creates Authority list from user's permissions, taking into account only admin role (ROLE_ADMIN)
     * @param user user model data
     * @return list of authority
     */
    public static List<GrantedAuthority> computeAuthorities(List<PermissionEnum> permissions) {
   
        List<GrantedAuthority> authorities = new ArrayList<>();
        if (permissions != null) {
            if (permissions.contains(PermissionEnum.ADMIN))
                authorities.addAll(AuthorityUtils.createAuthorityList("ROLE_ADMIN"));
            if (permissions.contains(PermissionEnum.ADMIN_BUSINESS_PROCESS))
                authorities.addAll(AuthorityUtils.createAuthorityList("ROLE_ADMIN_BUSINESS_PROCESS"));
        }

        return authorities;
    }
}
