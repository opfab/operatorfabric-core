/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.users.configuration.oauth2;

import org.opfab.springtools.configuration.oauth.OpFabJwtAuthenticationToken;
import org.opfab.users.model.User;

import javax.servlet.http.HttpServletRequest;
import java.security.Principal;

public interface UserExtractor {
    /**
     * Extracts User from Authentication request parameters
     * @param request the HttpServlet request
     * @return a {@link User}
     */
    default User extractUserFromJwtToken(HttpServletRequest request){
        Principal principal = request.getUserPrincipal();

        if (principal != null){
            OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
            return (User) jwtPrincipal.getPrincipal();
        }
        return null;
    }
}
