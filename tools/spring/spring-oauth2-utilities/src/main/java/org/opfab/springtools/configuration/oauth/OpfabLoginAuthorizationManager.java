/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.springtools.configuration.oauth;

import java.util.Arrays;
import java.util.function.Supplier;

import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.User;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;


public class OpfabLoginAuthorizationManager implements AuthorizationManager<RequestAuthorizationContext> {


    private String[] usernames;

    public OpfabLoginAuthorizationManager(String... usernames) {
        this.usernames = usernames;
    }

    @Override
    public AuthorizationDecision check(Supplier<Authentication> supplier, RequestAuthorizationContext context) {
        return new AuthorizationDecision(checkUserLogin(supplier.get()));
    }
    
    private boolean checkUserLogin(Authentication authentication) {
        User userData = null;
        String user = null;
        //authentication.getPrincipal() is UserData type if there is authentication
        //but is String type if there is no authentication (jira : OC-655)
        if (authentication.getPrincipal()  instanceof String principal) {
            user = principal;
        }
        else if (authentication.getPrincipal()  instanceof CurrentUserWithPerimeters currentUserWithPerimeters){
            userData = currentUserWithPerimeters.getUserData();
            user = userData.getLogin();
            
        } else {
            userData = (User) authentication.getPrincipal();
            user = userData.getLogin();
        }

        return usernames != null && Arrays.asList(usernames).contains(user);
    }
}
