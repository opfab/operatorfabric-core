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
import org.opfab.externaldevices.drivers.ExternalDeviceConfigurationException;
import org.opfab.externaldevices.drivers.ExternalDeviceDriverException;
import org.opfab.externaldevices.model.Device;
import org.opfab.externaldevices.model.DeviceConfiguration;
import org.opfab.externaldevices.model.SignalMapping;
import org.opfab.externaldevices.model.UserConfiguration;
import org.opfab.externaldevices.services.DevicesService;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;

/**
 * DevicesController, documented at {@link DevicesApi}
 *
 */
@RestController
@Slf4j
public class DevicesController implements DevicesApi {

    private static final String CONNECT_FAILED_DUE_TO_CONFIG = "Could not connect to device %1$s due to a configuration issue.";
    private static final String CONNECT_FAILED = "Connection to device %1$s failed.";

    private final DevicesService devicesService;

    @Autowired
    public DevicesController(DevicesService devicesService) {
        this.devicesService = devicesService;
    }


    @Override
    public Void connectDevice(HttpServletRequest request, HttpServletResponse response, String deviceId) {

        try {
            this.devicesService.connectDevice(deviceId);
        } catch (ExternalDeviceConfigurationException e) {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .message(String.format(CONNECT_FAILED_DUE_TO_CONFIG,deviceId))
                    .build(), e);
        }        catch (ExternalDeviceDriverException e) {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .message(String.format(CONNECT_FAILED,deviceId))
                    .build(), e);

        }
        response.setStatus(200);
        return null;
    }

    @Override
    public Void disconnectDevice(HttpServletRequest request, HttpServletResponse response, String deviceId) {

        return null;
    }

    @Override
    public Device getDevice(HttpServletRequest request, HttpServletResponse response, String deviceId) {

        return null;
    }

    @Override
    public List<Device> getDevices(HttpServletRequest request, HttpServletResponse response) {

        return null;
    }
}
