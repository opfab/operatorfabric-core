/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.controllers;

import org.opfab.useractiontracing.repositories.UserActionLogRepository;
import org.opfab.useractiontracing.services.UserActionLogService;
import org.opfab.users.configuration.oauth2.UserExtractor;
import org.opfab.users.model.*;
import org.opfab.utilities.eventbus.EventBus;
import org.opfab.users.repositories.EntityRepository;
import org.opfab.users.repositories.GroupRepository;
import org.opfab.users.repositories.PerimeterRepository;
import org.opfab.users.repositories.UserRepository;
import org.opfab.users.repositories.UserSettingsRepository;
import org.opfab.users.services.CurrentUserWithPerimetersService;
import org.opfab.users.services.NotificationService;
import org.opfab.users.services.UserSettingsService;
import org.opfab.users.services.UsersService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping({ "/CurrentUserWithPerimeters", "/internal/CurrentUserWithPerimeters" })

public class CurrentUserWithPerimetersController implements UserExtractor {

    private CurrentUserWithPerimetersService currentUserWithPerimetersService;

    public CurrentUserWithPerimetersController(UserRepository userRepository, GroupRepository groupRepository,
                    PerimeterRepository perimeterRepository, EntityRepository entityRepository,
                    UserSettingsRepository userSettingsRepository, UserActionLogRepository userActionLogRepository,
                    EventBus eventBus,
                    @Value("${operatorfabric.userActionLogActivated:true}") boolean userActionLogActivated) {

            NotificationService notificationService = new NotificationService(userRepository, eventBus);
            UsersService usersService = new UsersService(userRepository, groupRepository, entityRepository,
                            perimeterRepository, notificationService);
            UserActionLogService userActionLogService = new UserActionLogService(userActionLogRepository);
            UserSettingsService userSettingsService = new UserSettingsService(userSettingsRepository, usersService,
                            notificationService, userActionLogService, userActionLogActivated);
            this.currentUserWithPerimetersService = new CurrentUserWithPerimetersService(usersService,
                            userSettingsService,
                            entityRepository);
    }

    @GetMapping(produces = { "application/json" })
    public CurrentUserWithPerimeters fetchCurrentUserWithPerimeters(HttpServletRequest request,
            HttpServletResponse response) {

        User userData = extractUserFromJwtToken(request);
        return currentUserWithPerimetersService.fetchCurrentUserWithPerimeters(userData);
    }
}
