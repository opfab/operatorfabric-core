/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.springtools.configuration.oauth;

import org.springframework.security.authorization.AuthenticatedAuthorizationManager;
import org.springframework.security.authorization.AuthorityAuthorizationManager;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.authorization.AuthorizationManagers;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;

public class OpfabAuthorizationManager {

    private OpfabAuthorizationManager() {
    }

    public static AuthorizationManager<RequestAuthorizationContext> authenticatedAndIpAllowed() {
        return AuthorizationManagers.allOf(AuthenticatedAuthorizationManager.authenticated(),
                            new OpfabIpAuthorizationManager());
    }

    public static AuthorizationManager<RequestAuthorizationContext> hasAnyRoleAndIpAllowed(String... roles) {
        return AuthorizationManagers.allOf(AuthorityAuthorizationManager.hasAnyRole(roles),
                            new OpfabIpAuthorizationManager());
    }

    public static AuthorizationManager<RequestAuthorizationContext> hasAnyUsernameAndIpAllowed(String... usernames) {       
        return AuthorizationManagers.allOf(AuthenticatedAuthorizationManager.authenticated(), 
                            new OpfabLoginAuthorizationManager(usernames), new OpfabIpAuthorizationManager());
    }
}
