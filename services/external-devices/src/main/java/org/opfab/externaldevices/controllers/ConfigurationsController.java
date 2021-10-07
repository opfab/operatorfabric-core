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
import org.opfab.externaldevices.model.DeviceConfiguration;
import org.opfab.externaldevices.model.SignalMapping;
import org.opfab.externaldevices.model.UserConfiguration;
import org.opfab.externaldevices.services.DevicesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * DevicesController, documented at {@link ConfigurationsApi}
 *
 */
@RestController
@Slf4j
public class ConfigurationsController implements ConfigurationsApi {

    public static final String DEVICE_CONFIGURATION_CREATED = "Device configuration %s is created";

    private final DevicesService devicesService;

    @Autowired
    public ConfigurationsController(DevicesService devicesService) {
        this.devicesService = devicesService;
    }

    @Override
    public Void createDeviceConfiguration(HttpServletRequest request, HttpServletResponse response, DeviceConfiguration deviceConfiguration) {

        //TODO Distinguish between creation and update
        //TODO Make path constant
        String id = deviceConfiguration.getId();

        devicesService.insertDeviceConfiguration(deviceConfiguration);

        response.addHeader("Location", request.getContextPath() + "/configurations/devices/" + id);
        response.setStatus(201);
        log.debug(String.format(DEVICE_CONFIGURATION_CREATED, id));

        return null;

    }

    @Override
    public Void deleteDeviceConfiguration(HttpServletRequest request, HttpServletResponse response, String deviceId) {

        //TODO Check if there are users with this device, if so, error can't be deleted
        //TODO Check if found if not 404
        //TODO disconnect and remove any corresponding driver from pool

        //TODO Implement
        response.setStatus(200);
        return null;

    }

    @Override
    public Void createSignalMapping(HttpServletRequest request, HttpServletResponse response, SignalMapping signalMapping) throws Exception {

        String id = signalMapping.getId();
        //TODO Bad request if duplicate

        return null;
    }

    @Override
    public Void createUserConfiguration(HttpServletRequest request, HttpServletResponse response, UserConfiguration userConfiguration) throws Exception {

        //TODO
        return null;
    }


}
