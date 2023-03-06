/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.configuration.oauth2;

import java.util.function.Supplier;
import org.opfab.users.model.User;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;


import lombok.extern.slf4j.Slf4j;

@Slf4j
public class OpfabLoginAuthorizationManager implements AuthorizationManager<RequestAuthorizationContext> {

    @Override
    public AuthorizationDecision check(Supplier<Authentication> supplier, RequestAuthorizationContext context) {
        
        return new AuthorizationDecision(checkUserLogin(supplier.get(), context));
    }
    
    boolean checkUserLogin(Authentication authentication, RequestAuthorizationContext context) {

        String login = context.getVariables().get("login");
        String user;

        //authentication.getPrincipal() is UserData type if there is authentication
        //but is String type if there is no authentication (jira : OC-655)
        if (authentication.getPrincipal()  instanceof String principal)
            user = principal;
        else {
            user = ((User) authentication.getPrincipal()).getLogin();
        }

        log.debug("login from the principal {} login parameter {}", user, login);

        return user.equals(login);
    }
}
