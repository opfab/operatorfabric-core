/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externaldevices.controllers;

import lombok.extern.slf4j.Slf4j;
import org.opfab.externaldevices.configuration.oauth2.UserExtractor;
import org.opfab.externaldevices.drivers.ExternalDeviceConfigurationException;
import org.opfab.externaldevices.drivers.ExternalDeviceDriverException;
import org.opfab.externaldevices.model.Notification;
import org.opfab.externaldevices.services.DevicesService;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * NotificationsController, documented at {@link NotificationsApi}
 *
 */
@RestController
@Slf4j
public class NotificationsController implements NotificationsApi, UserExtractor {

    private static final String RECEIVED_NOTIFICATION = "Notification {} for user {} was received to be passed on to an external device.";
    private static final String UNHANDLED_NOTIFICATION = "Notification %1$s for user %2$s couldn't be handled.";


    private final DevicesService devicesService;

    @Autowired
    public NotificationsController(DevicesService devicesService) {
        this.devicesService = devicesService;
    }

    @Override
    public Void handleNotification(HttpServletRequest request, HttpServletResponse response, Notification notification) {
        User user = extractUserFromJwtToken(request).getUserData();
        log.debug(RECEIVED_NOTIFICATION, notification.toString(), user.getLogin());

        try {
            devicesService.sendSignalForUser(notification.getSignalId(), user.getLogin());
        } catch (ExternalDeviceConfigurationException | ExternalDeviceDriverException e) {
            e.printStackTrace();
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .message(String.format(UNHANDLED_NOTIFICATION,notification.getSignalId(),user.getLogin()))
                    .build(), e);
        }
        response.setStatus(200);
        return null;
    }
}