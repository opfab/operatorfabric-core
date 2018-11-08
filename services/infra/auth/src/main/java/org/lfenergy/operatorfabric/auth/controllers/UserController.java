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
 * Endpoint to expose user info for an authorized user
 *
 * @author David Binder
 */
@RestController
@Slf4j
@RequestMapping("/user")
public class UserController {
    /**
     * Return authenticated user info
     * @param principal
     * @return
     */
    @GetMapping("/me")
    public Principal user(Principal principal) {
        log.info("Accessing Data for "+principal);
        return principal;
    }
}
