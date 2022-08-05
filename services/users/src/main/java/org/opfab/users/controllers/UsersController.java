/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
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
import org.opfab.users.repositories.UserRepository;
import org.opfab.users.repositories.UserSettingsRepository;
import org.opfab.users.services.UserService;
import org.opfab.users.model.GroupData;
import org.opfab.users.model.PerimeterData;
import org.opfab.users.model.UserData;
import org.opfab.users.model.UserSettingsData;

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

    public static final String USER_CREATED = "User %s is created";
    public static final String USER_UPDATED = "User %s is updated";
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSettingsRepository userSettingsRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private EntityRepository entityRepository;

    @Autowired
    private JwtProperties jwtProperties;

    @Autowired
    private GroupsProperties groupsProperties;

    @Override
    public User createUser(HttpServletRequest request, HttpServletResponse response, User user) {
        boolean created = false;
        checkAndsetUserLogin(user);

        String login = user.getLogin();

        if (userRepository.findById(login).orElse(null) == null){
            response.addHeader("Location", request.getContextPath() + "/users/" + login);
            response.setStatus(201);
            created = true;
            log.debug(String.format(USER_CREATED, login));
        } else {
        	log.debug(String.format(USER_UPDATED, login));
        }

        userService.createUser(user);

        if(!created)
            userService.publishUpdatedUserMessage(login);
        
        return user;
    }

    @Override
    public User fetchUser(HttpServletRequest request, HttpServletResponse response, String login) throws ApiErrorException {
        return userRepository.findById(login)
                .orElseThrow(()-> new ApiErrorException(
                        ApiError.builder()
                                .status(HttpStatus.NOT_FOUND)
                                .message(String.format(USER_NOT_FOUND_MSG,login))
                                .build()
                ));
    }

    @Override
    public UserSettings fetchUserSetting(HttpServletRequest request, HttpServletResponse response, String login) throws ApiErrorException {
        return userSettingsRepository.findById(login)
                .orElseThrow(()->new ApiErrorException(
                        ApiError.builder()
                                .status(HttpStatus.NOT_FOUND)
                                .message(String.format(USER_SETTINGS_NOT_FOUND_MSG,login)).build()
                ));
    }

    @Override
    public List<User> fetchUsers(HttpServletRequest request, HttpServletResponse response) {
        return userRepository.findAll().stream().map( User.class::cast).collect(Collectors.toList());
    }
    @Override
    public UserSettings patchUserSettings(HttpServletRequest request, HttpServletResponse response, String login, UserSettings userSettings) {
        UserSettingsData settings = userSettingsRepository.findById(login)
                .orElse(UserSettingsData.builder().login(login).build());

        UserSettings newUserSettings = userSettingsRepository.save(settings.patch(userSettings));

        if ((userSettings.getProcessesStatesNotNotified() != null) || (userSettings.getEntitiesDisconnected() != null))
            userService.publishUpdatedUserMessage(login);

        return newUserSettings;
    }

    @Override
    public UserSettings updateUserSettings(HttpServletRequest request, HttpServletResponse response, String login, UserSettings userSettings) throws ApiErrorException {
        if(!userSettings.getLogin().equals(login)) {
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message(NO_MATCHING_USER_NAME_MSG)
                            .build());
        }
        return userSettingsRepository.save(new UserSettingsData(userSettings));
    }

    @Override
    public User updateUser(HttpServletRequest request, HttpServletResponse response, String login, User user) throws ApiErrorException {
        //login from user body parameter should match login path parameter
        if (!user.getLogin().equalsIgnoreCase(login)) {
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message(NO_MATCHING_USER_NAME_MSG)
                            .build());
        }
        user.setLogin(user.getLogin().toLowerCase());
        return createUser(request, response, user);
    }

    @Override
    public List<Perimeter> fetchUserPerimeters(HttpServletRequest request, HttpServletResponse response, String login) throws ApiErrorException {

        List<String> groups = findUserOrThrow(login).getGroups(); //First, we recover the groups to which the user belongs

        if ((groups != null) && (! groups.isEmpty())) {     //Then, we recover the groups data
            List<GroupData> groupsData = userService.retrieveGroups(groups);

            if (! groupsData.isEmpty()){
                Set<PerimeterData> perimetersData = new HashSet<>(); //We use a set because we don't want to have a duplicate
                groupsData.forEach(     //For each group, we recover its perimeters
                        groupData -> {
                            List<PerimeterData> list = userService.retrievePerimeters(groupData.getPerimeters());
                            if (list != null)
                                perimetersData.addAll(list);
                        });
                return new ArrayList<>(perimetersData);
            }
        }
        return Collections.emptyList();
    }

    @Override
    public Void deleteUser(HttpServletRequest request, HttpServletResponse response, String login) throws ApiErrorException{

        //Retrieve user from repository for login, throwing an error if login is not found
        UserData foundUser = userRepository.findById(login).orElseThrow(()->new ApiErrorException(
                ApiError.builder()
                        .status(HttpStatus.NOT_FOUND)
                        .message(String.format(USER_NOT_FOUND_MSG, login))
                        .build()
        ));

        if (foundUser != null) {
            userRepository.delete(foundUser);
            userService.publishUpdatedUserMessage(foundUser.getLogin());
        }
        return null;
    }



    @Override
    public User synchronizeWithToken(HttpServletRequest request, HttpServletResponse response) {
        User user = this.extractUserFromJwtToken(request);

        checkAndsetUserLogin(user);

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

        UserData existingUser = userRepository.findById(login).orElse(null);

        if (existingUser == null) {
            log.debug(String.format(USER_CREATED, login));
            userService.createUser(user);
        } else {
            boolean updatedFromToken = false;
            if (groupsProperties.getMode() == GroupsMode.JWT) {
                updatedFromToken = !existingUser.getGroupSet().equals(new HashSet<String>(user.getGroups()));
            }
            if (!updatedFromToken && jwtProperties.isGettingEntitiesFromToken()) {
                updatedFromToken = !new HashSet<String>(existingUser.getEntities()).equals(new HashSet<String>(user.getEntities()));
            }
            if (updatedFromToken) {
                log.debug(String.format(USER_UPDATED, login));
                userService.createUser(user);
                userService.publishUpdatedUserMessage(login);
            }
        }

        return user;
    }

    private UserData findUserOrThrow(String login) throws ApiErrorException {
        return userRepository.findById(login).orElseThrow(
                ()-> new ApiErrorException(
                        ApiError.builder()
                                .status(HttpStatus.NOT_FOUND)
                                .message(String.format(USER_NOT_FOUND_MSG, login))
                                .build()
                ));
    }

    private void checkAndsetUserLogin(User user) {
        String login = user.getLogin();

        if (login.length() == 0) {
            throw new ApiErrorException(
                    ApiError.builder()
                                .status(HttpStatus.BAD_REQUEST)
                                .message(MANDATORY_LOGIN_MISSING)
                                .build());
        }
        user.setLogin(user.getLogin().toLowerCase());
    }
    
}
