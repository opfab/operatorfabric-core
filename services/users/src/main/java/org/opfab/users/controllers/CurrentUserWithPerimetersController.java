/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.users.controllers;

import org.opfab.users.configuration.oauth2.UserExtractor;
import org.opfab.users.model.*;
import org.opfab.users.repositories.EntityRepository;
import org.opfab.users.services.CurrentUserWithPerimetersService;
import org.opfab.users.services.UserServiceImp;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


@RestController
@RequestMapping({"/CurrentUserWithPerimeters","/internal/CurrentUserWithPerimeters"})

public class CurrentUserWithPerimetersController implements CurrentUserWithPerimetersApi, UserExtractor {

    private CurrentUserWithPerimetersService currentUserWithPerimetersService;

    public CurrentUserWithPerimetersController(UserServiceImp userService,EntityRepository entityRepository) {
        this.currentUserWithPerimetersService = new CurrentUserWithPerimetersService(userService,entityRepository); 
    }

    @Override
    public CurrentUserWithPerimeters fetchCurrentUserWithPerimeters(HttpServletRequest request, HttpServletResponse response) throws Exception {

        User userData = extractUserFromJwtToken(request);
        return currentUserWithPerimetersService.fetchCurrentUserWithPerimeters(userData);
    }
}
