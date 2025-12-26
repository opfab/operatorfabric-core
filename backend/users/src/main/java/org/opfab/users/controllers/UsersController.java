/* Copyright (c) 2018-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.controllers;

import org.opfab.common.users.User;

import org.opfab.configuration.oauth.jwt.JwtProperties;
import org.opfab.error.model.ApiError;
import org.opfab.error.model.ApiErrorException;
import org.opfab.useractiontracing.model.UserActionEnum;
import org.opfab.useractiontracing.repositories.LastUserActionRepository;
import org.opfab.useractiontracing.repositories.UserActionLogRepository;
import org.opfab.useractiontracing.services.UserActionLogService;
import org.opfab.users.configuration.jwt.groups.GroupsMode;
import org.opfab.users.configuration.jwt.groups.GroupsProperties;
import org.opfab.users.model.EntityCreationReport;
import org.opfab.users.model.OperationResult;
import org.opfab.users.model.Perimeter;
import org.opfab.users.model.UserSettings;
import org.opfab.users.configuration.authorization.UserExtractor;
import org.opfab.users.repositories.EntityRepository;
import org.opfab.users.repositories.GroupRepository;
import org.opfab.users.repositories.PerimeterRepository;
import org.opfab.users.repositories.UserRepository;
import org.opfab.users.repositories.UserSettingsRepository;
import org.opfab.users.services.NotificationService;
import org.opfab.users.services.UserSettingsService;
import org.opfab.users.services.UsersService;
import org.opfab.utilities.eventbus.EventBus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import java.util.*;

@RestController
@RequestMapping("/users")
public class UsersController implements UserExtractor {

    private static final String NO_MATCHING_USER_NAME_MSG = "Payload User login does not match URL User login";

    private final JwtProperties jwtProperties;
    private final GroupsProperties groupsProperties;

    private final UsersService usersService;
    private final UserSettingsService userSettingsService;
    private final NotificationService notificationService;
    private final UserActionLogService userActionLogService;

    private @Value("${operatorfabric.userActionLogActivated:true}") boolean userActionLogActivated;

    @Autowired
    public UsersController(UserRepository userRepository, UserSettingsRepository userSettingsRepository,
            GroupRepository groupRepository, EntityRepository entityRepository, PerimeterRepository perimeterRepository,
            UserActionLogRepository userActionLogRepository, EventBus eventBus, JwtProperties jwtProperties,
            GroupsProperties groupsProperties,
            @Value("${operatorfabric.userActionLogActivated:true}") boolean userActionLogActivated,
            LastUserActionRepository lastUserActionRepository) {
        this.jwtProperties = jwtProperties;
        this.groupsProperties = groupsProperties;
        this.notificationService = new NotificationService(userRepository, eventBus);
        this.usersService = new UsersService(userRepository, groupRepository, entityRepository, perimeterRepository,
                userSettingsRepository, notificationService);
        this.userActionLogService = new UserActionLogService(userActionLogRepository, lastUserActionRepository);
        this.userSettingsService = new UserSettingsService(userSettingsRepository, usersService, notificationService,
                this.userActionLogService, userActionLogActivated);
    }

    @GetMapping(produces = { "application/json" })
    public List<User> fetchUsers(HttpServletRequest request, HttpServletResponse response) {
        return usersService.fetchUsers();
    }

    @GetMapping(value = "/{login}", produces = { "application/json" })
    public User fetchUser(HttpServletRequest request, HttpServletResponse response, @PathVariable("login") String login)
            throws ApiErrorException {
        OperationResult<User> operationResult = usersService.fetchUser(login);
        if (!operationResult.isSuccess())
            throw createExceptionFromOperationResult(operationResult);
        return operationResult.getResult();
    }

    private <S extends Object> ApiErrorException createExceptionFromOperationResult(
            OperationResult<S> operationResult) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (operationResult.getErrorType().equals(OperationResult.ErrorType.NOT_FOUND))
            status = HttpStatus.NOT_FOUND;
        if (operationResult.getErrorType().equals(OperationResult.ErrorType.BAD_REQUEST))
            status = HttpStatus.BAD_REQUEST;
        return new ApiErrorException(
                new ApiError(status, operationResult.getErrorMessage()));
    }

    @SuppressWarnings("java:S4684") // No security issue as each field of the object can be set via the API
    @PostMapping(produces = { "application/json" }, consumes = { "application/json" })
    public User createUser(HttpServletRequest request, HttpServletResponse response,
            @Valid @RequestBody User userToCreate)
            throws ApiErrorException {

        User user = this.extractUserFromJwtToken(request);

        OperationResult<EntityCreationReport<User>> result = usersService.createUser(userToCreate);
        if (result.isSuccess()) {
            String comment = "Update user ";

            if (!result.getResult().isUpdate()) {
                response.addHeader("Location",
                        request.getContextPath() + "/users/" + result.getResult().getEntity().getLogin());
                response.setStatus(201);
                comment = "Create user ";
            }

            logUserAction(user.getLogin(), user.getEntities(), comment + userToCreate.getLogin());

            return result.getResult().getEntity();
        } else
            throw createExceptionFromOperationResult(result);
    }

    @SuppressWarnings("java:S4684") // No security issue as each field of the object can be set via the API
    @PutMapping(value = "/{login}", produces = { "application/json" }, consumes = {
            "application/json" })
    public User updateUser(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("login") String login, @Valid @RequestBody User user)
            throws ApiErrorException {
        // login from user body parameter should match login path parameter
        if (!user.getLogin().equalsIgnoreCase(login)) {
            throw buildApiException(HttpStatus.BAD_REQUEST, NO_MATCHING_USER_NAME_MSG);
        }
        return createUser(request, response, user);
    }

    @DeleteMapping(value = "/{login}", produces = { "application/json" })
    public Void deleteUser(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("login") String login)
            throws ApiErrorException {
        User user = this.extractUserFromJwtToken(request);

        OperationResult<String> result = usersService.deleteUser(login);
        if (result.isSuccess()) {
            logUserAction(user.getLogin(), user.getEntities(), "Delete user " + login);
            return null;
        } else {
            throw createExceptionFromOperationResult(result);
        }
    }

    @GetMapping(value = "/{login}/perimeters", produces = { "application/json" })
    public List<Perimeter> fetchUserPerimeters(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("login") String login)
            throws ApiErrorException {
        OperationResult<List<Perimeter>> operationResult = usersService.fetchUserPerimeters(login);
        if (!operationResult.isSuccess())
            throw createExceptionFromOperationResult(operationResult);
        return operationResult.getResult();
    }

    @GetMapping(value = "/{login}/settings", produces = { "application/json" })
    public UserSettings fetchUserSetting(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("login") String login)
            throws ApiErrorException {
        OperationResult<UserSettings> operationResult = userSettingsService.fetchUserSettings(login);
        if (!operationResult.isSuccess())
            throw createExceptionFromOperationResult(operationResult);
        return operationResult.getResult();
    }

    @SuppressWarnings("java:S4684") // No security issue as each field of the object can be set via the API
    @PatchMapping(value = "/{login}/settings", produces = { "application/json" }, consumes = {
            "application/json" })
    public UserSettings patchUserSettings(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("login") String login,
            @Valid @RequestBody UserSettings userSettings) throws ApiErrorException {
        User user = this.extractUserFromJwtToken(request);
        OperationResult<UserSettings> result = userSettingsService.patchUserSettings(user, login, userSettings);
        if (result.isSuccess())
            return result.getResult();
        else
            throw createExceptionFromOperationResult(result);
    }

    @SuppressWarnings("java:S4684") // No security issue as each field of the object can be set via the API
    @PutMapping(value = "/{login}/settings", produces = { "application/json" }, consumes = {
            "application/json" })
    public UserSettings updateUserSettings(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("login") String login,
            @Valid @RequestBody UserSettings userSettings) throws ApiErrorException {
        if (!userSettings.getLogin().equals(login)) {
            throw buildApiException(HttpStatus.BAD_REQUEST, NO_MATCHING_USER_NAME_MSG);
        }

        OperationResult<UserSettings> result = userSettingsService.updateUserSettings(login, userSettings);
        if (result.isSuccess())
            return result.getResult();
        else
            throw createExceptionFromOperationResult(result);
    }

    @PostMapping(value = "/synchronizeWithToken", produces = { "application/json" })
    public User synchronizeWithToken(HttpServletRequest request, HttpServletResponse response) {
        User user = this.extractUserFromJwtToken(request);
        OperationResult<User> result = usersService.updateOrCreateUser(user, jwtProperties.isGettingEntitiesFromToken(),
                (groupsProperties.getMode() == GroupsMode.JWT));
        if (result.isSuccess())
            return result.getResult();
        else
            throw createExceptionFromOperationResult(result);
    }

    private ApiErrorException buildApiException(HttpStatus httpStatus, String errorMessage) {
        return new ApiErrorException(
                new ApiError(httpStatus, errorMessage));
    }

    private void logUserAction(String login, List<String> entities, String comment) {
        if (userActionLogActivated) {
            userActionLogService.insertUserActionLog(login, UserActionEnum.USER, entities, null, comment);
        }
    }

}
