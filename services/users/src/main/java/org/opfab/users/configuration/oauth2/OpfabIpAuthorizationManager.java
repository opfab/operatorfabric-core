/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.configuration.oauth2;

import java.util.List;
import java.util.function.Supplier;

import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.User;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.util.CollectionUtils;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class OpfabIpAuthorizationManager implements AuthorizationManager<RequestAuthorizationContext> {

    @Override
    public AuthorizationDecision check(Supplier<Authentication> supplier, RequestAuthorizationContext context) {
        return new AuthorizationDecision(checkUserIpAddress(supplier.get()));
    }
    
    private boolean checkUserIpAddress(Authentication authentication) {
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

        WebAuthenticationDetails details = (WebAuthenticationDetails) authentication.getDetails();

        if (userData != null && details != null) {
            
            String userIp = details.getRemoteAddress();
            
            List<String> ipAddresses = userData.getAuthorizedIPAddresses();

            if (!CollectionUtils.isEmpty(ipAddresses) && !ipAddresses.contains(userIp)){
                log.info("Call from ip address {} not allowed for user {}", userIp, user);
                return false;
            }
            return true;
        }
        log.info("Call not allowed from not authenticated user: " + user);
        return false;
    }
}
