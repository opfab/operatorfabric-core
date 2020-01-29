/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.users.configuration.oauth2;

import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

/**
 * WebSecurityChecks
 * This class defines the access checks that can be performed, for use in {@link WebSecurityConfiguration}
 *
 * @author Alexandra Guironnet
 */

@Component
@Slf4j
public class WebSecurityChecks {

    public boolean checkUserLogin(Authentication authentication, String login) {
    	
        User user = (User) authentication.getPrincipal();
    	
    	if (log.isDebugEnabled())
    		log.debug("login from the principal " + user.getLogin() + " login parameter " + login); 
    	
        return user.getLogin().equals(login);
    }
      
}
