/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.springtools.configuration.oauth;

import org.opfab.client.users.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;

import java.util.List;

/**
 * Some share utilities
 *
 *
 */
public class OAuth2JwtProcessingUtilities {
    /**
     * Creates Authority list from user's groups (ROLE_[group name])
     * @param user user model data
     * @return list of authority
     */
    public static List<GrantedAuthority> computeAuthorities(User user) {
        return AuthorityUtils.createAuthorityList(user.getGroups().stream().map(g -> "ROLE_" + g).toArray(size ->
           new
              String[size]));
    }
}
