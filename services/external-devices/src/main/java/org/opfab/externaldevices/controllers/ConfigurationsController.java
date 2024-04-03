/* Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
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
import org.opfab.externaldevices.model.DeviceConfiguration;
import org.opfab.externaldevices.model.SignalMapping;
import org.opfab.externaldevices.model.UserConfiguration;
import org.opfab.externaldevices.services.ConfigService;
import org.opfab.externaldevices.services.DevicesService;
import org.opfab.springtools.configuration.oauth.OpFabJwtAuthenticationToken;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Optional;

/**
 * DevicesController, documented at {@link ConfigurationsApi}
 *
 */
@RestController
@Slf4j
@RequestMapping("/configurations")
public class ConfigurationsController {

    public static final String CREATED_LOG = "{} {} was created.";
    public static final String DELETED_LOG = "{} {} was deleted.";
    public static final String NOT_FOUND_MESSAGE = "%1$s %2$s was not found.";
    public static final String LOCATION_HEADER_NAME = "Location";
    public static final String DEVICE_CONFIGURATION_NAME = "DeviceConfiguration";
    public static final String SIGNAL_MAPPING_NAME = "SignalMapping";
    public static final String USER_CONFIGURATION_NAME = "UserConfiguration";

    private final ConfigService configService;
    private final DevicesService devicesService;

    @Autowired
    public ConfigurationsController(ConfigService configService, DevicesService devicesService) {
        this.configService = configService;
        this.devicesService = devicesService;
    }

    @SuppressWarnings("java:S4684") // No security issue as each field of the object can be set via the API
    @PostMapping(value = "/devices", produces = { "application/json" }, consumes = { "application/json" })
    public Void createDeviceConfiguration(HttpServletRequest request, HttpServletResponse response,
            @Valid @RequestBody DeviceConfiguration deviceConfiguration) {

        String id = deviceConfiguration.id;
        configService.saveDeviceConfiguration(deviceConfiguration);
        if (Boolean.TRUE.equals(deviceConfiguration.isEnabled)) {
            try {
                devicesService.enableDevice(id);
            } catch (Exception exc) {
                log.warn("Impossible to enable driver {} ", id, exc);
            }
        }
        response.addHeader(LOCATION_HEADER_NAME, request.getContextPath() + "/configurations/devices/" + id);
        response.setStatus(201);
        log.info(CREATED_LOG, DEVICE_CONFIGURATION_NAME, id);
        return null;

    }

    @GetMapping(value = "/devices", produces = { "application/json" })
    public List<DeviceConfiguration> getDeviceConfigurations(HttpServletRequest request, HttpServletResponse response) {
        response.setStatus(200);
        return this.configService.getDeviceConfigurations();
    }

    @GetMapping(value = "/devices/{deviceId}", produces = { "application/json" })
    public DeviceConfiguration getDeviceConfiguration(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("deviceId") String deviceId) {
        try {
            DeviceConfiguration deviceConfiguration = this.configService.retrieveDeviceConfiguration(deviceId);
            response.setStatus(200);
            return deviceConfiguration;
        } catch (ExternalDeviceConfigurationException | UnknownExternalDeviceException e) {
            throw buildApiNotFoundException(e, String.format(NOT_FOUND_MESSAGE, DEVICE_CONFIGURATION_NAME, deviceId));
        }
    }

    private ApiErrorException buildApiNotFoundException(Exception e, String errorMessage) {
        return new ApiErrorException(ApiError.builder()
                .status(HttpStatus.NOT_FOUND)
                .message(errorMessage)
                .build(), e);
    }

    @DeleteMapping(value = "/devices/{deviceId}", produces = { "application/json" })
    public Void deleteDeviceConfiguration(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("deviceId") String deviceId) throws ExternalDeviceDriverException {

        try {
            devicesService.disableDevice(deviceId);
            configService.deleteDeviceConfiguration(deviceId);
        } catch (ExternalDeviceConfigurationException | UnknownExternalDeviceException e) {
            throw buildApiNotFoundException(e, String.format(NOT_FOUND_MESSAGE, DEVICE_CONFIGURATION_NAME, deviceId));
        }
        response.setStatus(200);
        log.info(DELETED_LOG, DEVICE_CONFIGURATION_NAME, deviceId);
        return null;

    }
    @SuppressWarnings("java:S4684") // No security issue as each field of the object can be set via the API
    @PostMapping(value = "/signals", produces = { "application/json" }, consumes = {
            "application/json" })
    public Void createSignalMapping(HttpServletRequest request, HttpServletResponse response,
            @Valid @RequestBody SignalMapping signalMapping) {

        String id = signalMapping.id;
        configService.insertSignalMapping(signalMapping);
        response.addHeader(LOCATION_HEADER_NAME, request.getContextPath() + "/configurations/signals/" + id);
        response.setStatus(201);
        log.info(CREATED_LOG, SIGNAL_MAPPING_NAME, id);
        return null;
    }

    @GetMapping(value = "/signals", produces = { "application/json" })
    public List<SignalMapping> getSignalMappings(HttpServletRequest request, HttpServletResponse response) {
        response.setStatus(200);
        return this.configService.getSignalMappings();
    }

    @GetMapping(value = "/signals/{signalMappingId}", produces = { "application/json" })
    public SignalMapping getSignalMapping(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("signalMappingId") String signalMappingId) {
        try {
            SignalMapping signalMapping = this.configService.retrieveSignalMapping(signalMappingId);
            response.setStatus(200);
            return signalMapping;
        } catch (ExternalDeviceConfigurationException e) {
            throw buildApiNotFoundException(e, String.format(NOT_FOUND_MESSAGE, SIGNAL_MAPPING_NAME, signalMappingId));
        }
    }

    @DeleteMapping(value = "/signals/{signalMappingId}", produces = {
            "application/json" })
    public Void deleteSignalMapping(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("signalMappingId") String signalMappingId) {

        try {
            configService.deleteSignalMapping(signalMappingId);
        } catch (ExternalDeviceConfigurationException e) {
            throw buildApiNotFoundException(e, String.format(NOT_FOUND_MESSAGE, SIGNAL_MAPPING_NAME, signalMappingId));
        }
        response.setStatus(200);
        log.debug(DELETED_LOG, SIGNAL_MAPPING_NAME, signalMappingId);
        return null;
    }

    @SuppressWarnings("java:S4684") // No security issue as each field of the object can be set via the API
    @PostMapping(value = "/users", produces = { "application/json" }, consumes = {
        "application/json" })
    public Void createUserConfiguration(HttpServletRequest request, HttpServletResponse response,
        @Valid @RequestBody UserConfiguration userConfiguration) {
        String id = userConfiguration.userLogin;
        configService.saveUserConfiguration(userConfiguration);
        response.addHeader(LOCATION_HEADER_NAME, request.getContextPath() + "/configurations/signals/" + id);
        response.setStatus(201);
        log.info(CREATED_LOG, SIGNAL_MAPPING_NAME, id);
        return null;
    }

    @GetMapping(value = "/users", produces = { "application/json" })
    public List<UserConfiguration> getUserConfigurations(HttpServletRequest request, HttpServletResponse response) {
        response.setStatus(200);
        return this.configService.getUserConfigurations();
    }

    @GetMapping(value = "/users/{userLogin}", produces = { "application/json" })
    public UserConfiguration getUserConfiguration(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("userLogin") String userLogin) {
        try {
            UserConfiguration userConfiguration = this.configService.retrieveUserConfiguration(userLogin);
            response.setStatus(200);
            return userConfiguration;
        } catch (ExternalDeviceConfigurationException e) {
            throw buildApiNotFoundException(e, String.format(NOT_FOUND_MESSAGE, USER_CONFIGURATION_NAME, userLogin));
        }
    }

    @DeleteMapping(value = "/users/{userLogin}", produces = { "application/json" })
    public Void deleteUserConfiguration(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("userLogin") String userLogin) {
        try {
            OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) request.getUserPrincipal();
            Jwt token = null;
            if (jwtPrincipal != null) {
                token = jwtPrincipal.getToken();
            }

            configService.deleteUserConfiguration(userLogin, Optional.ofNullable(token));
        } catch (ExternalDeviceConfigurationException e) {
            throw buildApiNotFoundException(e, String.format(NOT_FOUND_MESSAGE, USER_CONFIGURATION_NAME, userLogin));
        }
        response.setStatus(200);
        log.info(DELETED_LOG, USER_CONFIGURATION_NAME, userLogin);
        return null;
    }

}
