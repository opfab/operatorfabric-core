/* Copyright (c) 2024, RTE (http://www.rte-france.com)
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
import org.opfab.users.repositories.UserRepository;
import org.opfab.users.repositories.UserSettingsRepository;
import org.opfab.users.services.NotificationService;
import org.opfab.users.services.UserSettingsService;
import org.opfab.utilities.eventbus.EventBus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


@RestController
@RequestMapping("/notificationconfiguration")
public class NotificationConfigurationController {

    private final UserSettingsService userSettingsService;
    private final NotificationService notificationService;

    public NotificationConfigurationController(UserRepository userRepository,
            UserSettingsRepository userSettingsRepository, UserActionLogRepository userActionLogRepository,
            EventBus eventBus, @Value("${operatorfabric.userActionLogActivated:true}") boolean userActionLogActivated) {
        this.notificationService = new NotificationService(userRepository, eventBus);
        UserActionLogService userActionLogService = new UserActionLogService(userActionLogRepository);
        this.userSettingsService = new UserSettingsService(userSettingsRepository, null, notificationService,
                userActionLogService, userActionLogActivated);
    }

    @PostMapping(value = "/processstatenotified/{process}/{state}", produces = { "application/json" })
    public void setNotificationConfiguration(HttpServletRequest request, HttpServletResponse response, @PathVariable("process") String process, @PathVariable("state") String state) {
        userSettingsService.setProcessStateNotified(process, state);
    }

    @DeleteMapping(value = "/processstatenotified/{process}/{state}", produces = { "application/json" })
    public void unsetNotificationConfiguration(HttpServletRequest request, HttpServletResponse response, @PathVariable("process") String process, @PathVariable("state") String state) {
        userSettingsService.unsetProcessStateNotified(process, state);
    }

    @PostMapping(value = "/processstatenotifiedbymail/{process}/{state}", produces = { "application/json" })
    public void setEmailNotificationConfiguration(HttpServletRequest request, HttpServletResponse response, @PathVariable("process") String process, @PathVariable("state") String state) {
        userSettingsService.setProcessStateNotifiedByEmail(process, state);
    }

    @DeleteMapping(value = "/processstatenotifiedbymail/{process}/{state}", produces = { "application/json" })
    public void unsetEmailNotificationConfigurationByEmail(HttpServletRequest request, HttpServletResponse response, @PathVariable("process") String process, @PathVariable("state") String state) {
        userSettingsService.unsetProcessStateNotifiedByEmail(process, state);
    }
}
