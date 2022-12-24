/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.users.controllers;

import lombok.extern.slf4j.Slf4j;

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
import org.opfab.users.utils.LoginFormatChecker;
import org.opfab.users.model.UserData;
import org.opfab.users.rabbit.RabbitEventBus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.*;
import java.util.stream.Collectors;

/**
 * UsersController, documented at {@link UsersApi}
 *
 */
@RestController
@RequestMapping("/users")
@Slf4j
public class UsersController implements UsersApi, UserExtractor {

    public static final String USER_NOT_FOUND_MSG = "User %s not found";
    public static final String USER_SETTINGS_NOT_FOUND_MSG = "User setting for user %s not found";
    public static final String NO_MATCHING_USER_NAME_MSG = "Payload User login does not match URL User login";
    public static final String MANDATORY_LOGIN_MISSING = "Mandatory 'login' field is missing";
    public static final String CANNOT_REMOVE_ADMIN_USER_FROM_ADMIN_GROUP = "Removing group ADMIN from user admin is not allowed";
    public static final String FILTERING_NOTIFICATION_NOT_ALLOWED = "Filtering notification not allowed for at least one process/state";

    public static final String USER_CREATED = "User %s is created";
    public static final String USER_UPDATED = "User %s is updated";

    public static final String ADMIN_LOGIN = "admin";

    
    private UserRepository userRepository;

    private GroupRepository groupRepository;

    @Autowired
    private EntityRepository entityRepository;

    @Autowired
    private JwtProperties jwtProperties;

    @Autowired
    private GroupsProperties groupsProperties;

    private UsersService usersService;
    private UserSettingsService userSettingsService;
    private NotificationService notificationService;

    public UsersController(UserRepository userRepository,UserSettingsRepository userSettingsRepository, GroupRepository groupRepository, PerimeterRepository perimeterRepository,RabbitEventBus rabbitEventBus) {
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.notificationService = new NotificationService(userRepository, rabbitEventBus);
        usersService = new UsersService(userRepository,groupRepository,perimeterRepository,notificationService);
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

        LoginFormatChecker.LoginCheckResult result =  LoginFormatChecker.check(user.getLogin());
        if (!result.isValid()) {
            throw new ApiErrorException(
                ApiError.builder()
                        .status(HttpStatus.BAD_REQUEST)
                        .message(result.getErrorMessage())
                        .build());
        }

        user.setLogin(user.getLogin().toLowerCase());
        String login = user.getLogin();

        if (groupsProperties.getMode() == GroupsMode.JWT) {
            List<String> missingGroups = user.getGroups().stream()
                    .filter(groupId -> this.groupRepository.findById(groupId).isEmpty()).collect(Collectors.toList());
            if (!missingGroups.isEmpty()) {
                missingGroups.forEach(id -> log.warn("Group id from token not found in db: {}", id));
                List<String> goodGroups = user.getGroups();
                goodGroups.removeAll(missingGroups);
                user.setGroups(goodGroups);
            }
        }

        if (jwtProperties.isGettingEntitiesFromToken()) {
            List<String> missingEntities = user.getEntities().stream()
                    .filter(entityId -> this.entityRepository.findById(entityId).isEmpty())
                    .collect(Collectors.toList());
            if (!missingEntities.isEmpty()) {
                missingEntities.forEach(id -> log.warn("Entity id from token not found in db: {}", id));
                List<String> goodEntities = user.getEntities();
                goodEntities.removeAll(missingEntities);
                user.setEntities(goodEntities);
            }
        }

        User existingUser = userRepository.findById(login).orElse(null);

        if (existingUser == null) {
            log.debug(String.format(USER_CREATED, login));
            usersService.createUser(user);
        } else {
            boolean updatedFromToken = false;
            if (groupsProperties.getMode() == GroupsMode.JWT) {
                updatedFromToken = !((UserData) existingUser).getGroupSet().equals(new HashSet<String>(user.getGroups()));
            }
            if (!updatedFromToken && jwtProperties.isGettingEntitiesFromToken()) {
                updatedFromToken = !new HashSet<String>(existingUser.getEntities()).equals(new HashSet<String>(user.getEntities()));
            }
            if (updatedFromToken) {
                log.debug(String.format(USER_UPDATED, login));
                usersService.createUser(user);
                notificationService.publishUpdatedUserMessage(login);
            }
        }

        return user;
    }


    private ApiErrorException buildApiException(HttpStatus httpStatus, String errorMessage) {
        return new ApiErrorException(
                ApiError.builder()
                        .status(httpStatus)
                        .message(errorMessage)
                        .build());
    }

}
