/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
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
import org.opfab.users.rabbit.RabbitEventBus;
import org.opfab.users.repositories.EntityRepository;
import org.opfab.users.repositories.GroupRepository;
import org.opfab.users.repositories.PerimeterRepository;
import org.opfab.users.repositories.UserRepository;
import org.opfab.users.repositories.UserSettingsRepository;
import org.opfab.users.services.CurrentUserWithPerimetersService;
import org.opfab.users.services.NotificationService;
import org.opfab.users.services.UserSettingsService;
import org.opfab.users.services.UsersService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping({ "/CurrentUserWithPerimeters", "/internal/CurrentUserWithPerimeters" })

public class CurrentUserWithPerimetersController implements CurrentUserWithPerimetersApi, UserExtractor {

    private CurrentUserWithPerimetersService currentUserWithPerimetersService;

    public CurrentUserWithPerimetersController(UserRepository userRepository, GroupRepository groupRepository,
            PerimeterRepository perimeterRepository, EntityRepository entityRepository, UserSettingsRepository userSettingsRepository, RabbitEventBus rabbitEventBus) {
        
                NotificationService notificationService = new NotificationService(userRepository,rabbitEventBus);
        UsersService usersService = new UsersService(userRepository, groupRepository, entityRepository, perimeterRepository,notificationService);
        UserSettingsService userSettingsService = new UserSettingsService(userSettingsRepository, usersService, notificationService);
        this.currentUserWithPerimetersService = new CurrentUserWithPerimetersService(usersService, userSettingsService,
                entityRepository);
    }

    @Override
    public CurrentUserWithPerimeters fetchCurrentUserWithPerimeters(HttpServletRequest request,
            HttpServletResponse response) throws Exception {

        User userData = extractUserFromJwtToken(request);
        return currentUserWithPerimetersService.fetchCurrentUserWithPerimeters(userData);
    }
}
