/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.users.controllers;

import lombok.extern.slf4j.Slf4j;
import org.opfab.springtools.configuration.oauth.UpdatedUserEvent;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.users.model.*;
import org.opfab.users.repositories.UserRepository;
import org.opfab.users.repositories.UserSettingsRepository;
import org.opfab.users.services.UserService;
import org.opfab.users.model.GroupData;
import org.opfab.users.model.PerimeterData;
import org.opfab.users.model.UserData;
import org.opfab.users.model.UserSettingsData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.bus.ServiceMatcher;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.*;

/**
 * UsersController, documented at {@link UsersApi}
 *
 */
@RestController
@RequestMapping("/users")
@Slf4j
public class UsersController implements UsersApi {

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

    /* These are Spring Cloud Bus beans used to fire an event (UpdatedUserEvent) every time a user is modified.
     *  Other services handle this event by clearing their user cache for the given user. See issue #64*/
    @Autowired
    private ServiceMatcher busServiceMatcher;

    @Autowired
    private ApplicationEventPublisher publisher;

    @Override
    public User createUser(HttpServletRequest request, HttpServletResponse response, User user) throws Exception {
        boolean created = false;
        user.setLogin(user.getLogin().toLowerCase());
        String login = user.getLogin();

        if ((login == null) || (login.length() == 0)) {
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message(MANDATORY_LOGIN_MISSING)
                            .build());
        }

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
            publisher.publishEvent(new UpdatedUserEvent(this, busServiceMatcher.getServiceId(), login));
        
        return user;
    }

    @Override
    public User fetchUser(HttpServletRequest request, HttpServletResponse response, String login) throws Exception {
        return userRepository.findById(login)
                .orElseThrow(()-> new ApiErrorException(
                        ApiError.builder()
                                .status(HttpStatus.NOT_FOUND)
                                .message(String.format(USER_NOT_FOUND_MSG,login))
                                .build()
                ));
    }

    @Override
    public UserSettings fetchUserSetting(HttpServletRequest request, HttpServletResponse response, String login) throws Exception {
        return userSettingsRepository.findById(login)
                .orElseThrow(()->new ApiErrorException(
                        ApiError.builder()
                                .status(HttpStatus.NOT_FOUND)
                                .message(String.format(USER_SETTINGS_NOT_FOUND_MSG,login)).build()
                ));
    }

    @Override
    public List<? extends User> fetchUsers(HttpServletRequest request, HttpServletResponse response) throws Exception {
        return userRepository.findAll();
    }

    @Override
    public UserSettings patchUserSettings(HttpServletRequest request, HttpServletResponse response, String login, UserSettings userSettings) throws Exception {
        UserSettingsData settings = userSettingsRepository.findById(login)
                .orElse(UserSettingsData.builder().login(login).build());
        if (userSettings.getProcessesStatesNotNotified()!=null) publisher.publishEvent(new UpdatedUserEvent(this, busServiceMatcher.getServiceId(), login));
        return userSettingsRepository.save(settings.patch(userSettings));
    }

    @Override
    public UserSettings updateUserSettings(HttpServletRequest request, HttpServletResponse response, String login, UserSettings userSettings) throws Exception {
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
    public User updateUser(HttpServletRequest request, HttpServletResponse response, String login, User user) throws Exception {
        //login from user body parameter should match login path parameter
        if ((user.getLogin() != null) && (!user.getLogin().equalsIgnoreCase(login))) {
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message(NO_MATCHING_USER_NAME_MSG)
                            .build());
        }
        if (user.getLogin() != null)
            user.setLogin(user.getLogin().toLowerCase());
        return createUser(request, response, user);
    }

    @Override
    public List<? extends Perimeter> fetchUserPerimeters(HttpServletRequest request, HttpServletResponse response, String login) throws Exception{

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
    public Void deleteUser(HttpServletRequest request, HttpServletResponse response, String login) throws Exception{

        //Retrieve user from repository for login, throwing an error if login is not found
        UserData foundUser = userRepository.findById(login).orElseThrow(()->new ApiErrorException(
                ApiError.builder()
                        .status(HttpStatus.NOT_FOUND)
                        .message(String.format(USER_NOT_FOUND_MSG, login))
                        .build()
        ));

        if (foundUser != null) {
            publisher.publishEvent(new UpdatedUserEvent(this, busServiceMatcher.getServiceId(), foundUser.getLogin()));
            userRepository.delete(foundUser);
        }
        return null;
    }

    private UserData findUserOrThrow(String login) {
        return userRepository.findById(login).orElseThrow(
                ()-> new ApiErrorException(
                        ApiError.builder()
                                .status(HttpStatus.NOT_FOUND)
                                .message(String.format(USER_NOT_FOUND_MSG, login))
                                .build()
                ));
    }
}
