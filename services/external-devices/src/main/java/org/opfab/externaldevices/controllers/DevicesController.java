/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
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
import org.opfab.externaldevices.drivers.UnknownExternalDeviceException;
import org.opfab.externaldevices.model.Device;
import org.opfab.externaldevices.model.DeviceConfiguration;
import org.opfab.externaldevices.services.ConfigService;
import org.opfab.externaldevices.services.DevicesService;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
    private static final String ENABLED_FAILED = "Activation of device %1$s failed.";
    private static final String DEVICE_NOT_FOUND_MSG = "Device %s not found.";
    private static final String UNKNOWN_DRIVER = "No known driver for device %1$s.";

    private final DevicesService devicesService;
    private final ConfigService configService;

    @Autowired
    public DevicesController(DevicesService devicesService,
                             ConfigService configService) {
        this.devicesService = devicesService;
        this.configService = configService;

        List<DeviceConfiguration> deviceConfigurationList = this.configService.getDeviceConfigurations();

        if (deviceConfigurationList != null) {
            deviceConfigurationList.forEach(deviceConfiguration -> {
                try {
                    if (Boolean.TRUE.equals(deviceConfiguration.getIsEnabled())) {
                        this.devicesService.enableDevice(deviceConfiguration.getId());
                        log.info("External device id={} connected to opfab", deviceConfiguration.getId());
                    }
                } catch (ExternalDeviceConfigurationException e) {
                    log.warn(String.format(CONNECT_FAILED_DUE_TO_CONFIG, deviceConfiguration.getId()));
                } catch (ExternalDeviceDriverException e) {
                    log.warn(String.format(CONNECT_FAILED, deviceConfiguration.getId()));
                }catch (UnknownExternalDeviceException e) {
                    log.warn(String.format(UNKNOWN_DRIVER, deviceConfiguration.getId()));
                }
            });
        }
    }

    @Override
    public Void enableDevice(HttpServletRequest request, HttpServletResponse response, String deviceId) throws ExternalDeviceDriverException {
        log.info("Enable device {}", deviceId);
        try {
            configService.enableDevice(deviceId);
            this.devicesService.enableDevice(deviceId);
        } catch (ExternalDeviceConfigurationException e) {
            return throwApiException(e, HttpStatus.INTERNAL_SERVER_ERROR, String.format(ENABLED_FAILED, deviceId));
        } catch (UnknownExternalDeviceException e) {
            return throwApiException(e, HttpStatus.NOT_FOUND, String.format(UNKNOWN_DRIVER, deviceId));
        }
        response.setStatus(200);
        return null;
    }

    @Override
    public Void disableDevice(HttpServletRequest request, HttpServletResponse response, String deviceId) throws ExternalDeviceDriverException{
        log.info("Disable device {}", deviceId);
        try {
            configService.disableDevice(deviceId);
            this.devicesService.disableDevice(deviceId);
        } 
        catch (UnknownExternalDeviceException e) {
            return throwApiException(e, HttpStatus.NOT_FOUND, String.format(UNKNOWN_DRIVER, deviceId));
        }
        response.setStatus(200);
        return null;
    }

    @Override
    public Device getDevice(HttpServletRequest request, HttpServletResponse response, String deviceId) {
        response.setStatus(200);
        return this.devicesService.getDevice(deviceId)
                .orElseThrow(
                ()-> new ApiErrorException(
                        ApiError.builder()
                                .status(HttpStatus.NOT_FOUND)
                                .message(String.format(DEVICE_NOT_FOUND_MSG,deviceId))
                                .build()
                )
        );
    }

    @Override
    public List<Device> getDevices(HttpServletRequest request, HttpServletResponse response) {
        response.setStatus(200);
        return this.devicesService.getDevices();
    }

    private Void throwApiException(Exception e, HttpStatus errorStatus, String errorMessage) {
        throw new ApiErrorException(ApiError.builder()
                .status(errorStatus)
                .message(errorMessage)
                .build(), e);
    }
}
