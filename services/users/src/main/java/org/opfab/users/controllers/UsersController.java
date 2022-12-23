/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.users.controllers;

import org.opfab.springtools.configuration.oauth.jwt.JwtProperties;
import org.opfab.springtools.configuration.oauth.jwt.groups.GroupsProperties;
import org.opfab.springtools.configuration.oauth.jwt.groups.GroupsMode;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.users.configuration.oauth2.UserExtractor;
import org.opfab.users.model.*;
import org.opfab.users.repositories.EntityRepository;
import org.opfab.users.repositories.GroupRepository;
import org.opfab.users.repositories.PerimeterRepository;
import org.opfab.users.repositories.UserRepository;
import org.opfab.users.repositories.UserSettingsRepository;
import org.opfab.users.services.NotificationService;
import org.opfab.users.services.UserSettingsService;
import org.opfab.users.services.UsersService;
import org.opfab.users.rabbit.RabbitEventBus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.*;


@RestController
@RequestMapping("/users")
public class UsersController implements UsersApi, UserExtractor {

    private static final String NO_MATCHING_USER_NAME_MSG = "Payload User login does not match URL User login";

    @Autowired
    private JwtProperties jwtProperties;

    @Autowired
    private GroupsProperties groupsProperties;

    private UsersService usersService;
    private UserSettingsService userSettingsService;
    private NotificationService notificationService;

    public UsersController(UserRepository userRepository,UserSettingsRepository userSettingsRepository, GroupRepository groupRepository, EntityRepository entityRepository, PerimeterRepository perimeterRepository,RabbitEventBus rabbitEventBus) {
        this.notificationService = new NotificationService(userRepository, rabbitEventBus);
        usersService = new UsersService(userRepository,groupRepository,entityRepository,perimeterRepository,notificationService);
        userSettingsService = new UserSettingsService(userSettingsRepository,usersService,notificationService);
        }


    @Override
    public List<User> fetchUsers(HttpServletRequest request, HttpServletResponse response) {
        return usersService.fetchUsers();
    }

    @Override
    public User fetchUser(HttpServletRequest request, HttpServletResponse response, String login) throws ApiErrorException {
        OperationResult<User>  operationResult = usersService.fetchUser(login);
        if (!operationResult.isSuccess()) throw createExceptionFromOperationResult(operationResult);
        return operationResult.getResult();
    }

    private  <S extends Object>  ApiErrorException createExceptionFromOperationResult(OperationResult<S> operationResult) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (operationResult.getErrorType().equals(OperationResult.ErrorType.NOT_FOUND)) status = HttpStatus.NOT_FOUND;
        if (operationResult.getErrorType().equals(OperationResult.ErrorType.BAD_REQUEST)) status = HttpStatus.BAD_REQUEST;
        return  new ApiErrorException(
            ApiError.builder()
                    .status(status)
                    .message(operationResult.getErrorMessage())
                    .build());
    }

    @Override
    public User createUser(HttpServletRequest request, HttpServletResponse response, User user) throws ApiErrorException {

        OperationResult<EntityCreationReport<User>> result = usersService.createUser(user);
        if (result.isSuccess()) {
            if (!result.getResult().isUpdate()) {
                response.addHeader("Location", request.getContextPath() + "/users/" + result.getResult().getEntity().getLogin());
                response.setStatus(201);
            }
            return result.getResult().getEntity();
        }
        else throw createExceptionFromOperationResult(result);
    }    

    @Override
    public User updateUser(HttpServletRequest request, HttpServletResponse response, String login, User user) throws ApiErrorException {
        //login from user body parameter should match login path parameter
        if (!user.getLogin().equalsIgnoreCase(login)) {
            throw buildApiException(HttpStatus.BAD_REQUEST, NO_MATCHING_USER_NAME_MSG);
        }
        return createUser(request, response, user);
    }

    @Override
    public Void deleteUser(HttpServletRequest request, HttpServletResponse response, String login) throws ApiErrorException{
        OperationResult<String> result = usersService.deleteUser(login);
        if (result.isSuccess()) return null;
        else throw  createExceptionFromOperationResult(result);

    }

    @Override
    public List<Perimeter> fetchUserPerimeters(HttpServletRequest request, HttpServletResponse response, String login) throws ApiErrorException {
        OperationResult<List<Perimeter>>  operationResult = usersService.fetchUserPerimeters(login);
        if (!operationResult.isSuccess()) throw createExceptionFromOperationResult(operationResult);
        return operationResult.getResult();
    }


    @Override
    public UserSettings fetchUserSetting(HttpServletRequest request, HttpServletResponse response, String login) throws ApiErrorException {
        OperationResult<UserSettings>  operationResult = userSettingsService.fetchUserSettings(login);
        if (!operationResult.isSuccess()) throw createExceptionFromOperationResult(operationResult);
        return operationResult.getResult();
    }

    @Override
    public UserSettings patchUserSettings(HttpServletRequest request, HttpServletResponse response, String login, UserSettings userSettings) throws Exception {
        OperationResult<UserSettings> result = userSettingsService.patchUserSettings(login,userSettings);
        if (result.isSuccess()) return result.getResult();
        else throw  createExceptionFromOperationResult(result);
    }

    @Override
    public UserSettings updateUserSettings(HttpServletRequest request, HttpServletResponse response, String login, UserSettings userSettings) throws ApiErrorException {
        if (!userSettings.getLogin().equals(login)) {
            throw buildApiException(HttpStatus.BAD_REQUEST, NO_MATCHING_USER_NAME_MSG);
        }

        OperationResult<UserSettings> result = userSettingsService.updateUserSettings(login,userSettings);
        if (result.isSuccess()) return result.getResult();
        else throw  createExceptionFromOperationResult(result);
    }

    @Override
    public User synchronizeWithToken(HttpServletRequest request, HttpServletResponse response) {
        User user = this.extractUserFromJwtToken(request);
        OperationResult<User> result = usersService.updateOrCreateUser(user, jwtProperties.isGettingEntitiesFromToken(), (groupsProperties.getMode() == GroupsMode.JWT));
        if (result.isSuccess()) return result.getResult();
        else throw  createExceptionFromOperationResult(result);       
    }

    private ApiErrorException buildApiException(HttpStatus httpStatus, String errorMessage) {
        return new ApiErrorException(
                ApiError.builder()
                        .status(httpStatus)
                        .message(errorMessage)
                        .build());
    }

}
