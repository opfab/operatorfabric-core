/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.auth.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

/**
 * <p></p>
 * Created on 10/08/18
 *
 * @author davibind
 */
@RestController
@Slf4j
@RequestMapping("/user")
public class UserController {
    @GetMapping("/me")
    public Principal user(Principal principal) {
//        Object principal = auth.getPrincipal();
        log.info("Accessing Data for "+principal);
        return principal;
    }
}
