/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.springtools.configuration.oauth;

import org.lfenergy.operatorfabric.users.model.CurrentUserWithPerimeters;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign proxy for User service
 *
 *
 */
@FeignClient("users")
public interface UserServiceProxy {
    @GetMapping(value = "/users/{login}",
       produces = { "application/json" })
    User fetchUser(@PathVariable("login") String login) ;

    @GetMapping(value = "/CurrentUserWithPerimeters",
            produces = { "application/json" })
    CurrentUserWithPerimeters fetchCurrentUserWithPerimeters() ;
}
