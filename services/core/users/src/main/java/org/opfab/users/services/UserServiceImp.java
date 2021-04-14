/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.users.services;

import lombok.extern.slf4j.Slf4j;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.users.model.*;
import org.opfab.users.repositories.GroupRepository;
import org.opfab.users.repositories.PerimeterRepository;
import org.opfab.users.repositories.UserRepository;
import org.opfab.springtools.configuration.oauth.UpdatedUserEvent;
import org.opfab.users.repositories.UserSettingsRepository;
import org.opfab.users.model.GroupData;
import org.opfab.users.model.PerimeterData;
import org.opfab.users.model.UserData;
import org.opfab.users.model.UserSettingsData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.bus.ServiceMatcher;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
public class UserServiceImp implements UserService {

    public static final String GROUP_ID_IMPOSSIBLE_TO_FETCH_MSG = "Group id impossible to fetch : %s";
    public static final String PERIMETER_ID_IMPOSSIBLE_TO_FETCH_MSG = "Perimeter id impossible to fetch : %s";

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private PerimeterRepository perimeterRepository;
    @Autowired
    private UserSettingsRepository userSettingsRepository;

    /* These are Spring Cloud Bus beans used to fire an event (UpdatedUserEvent) every time a user is modified.
     *  Other services handle this event by clearing their user cache for the given user. See issue #64*/
    @Autowired
    private ServiceMatcher busServiceMatcher;
    @Autowired
    private ApplicationEventPublisher publisher;

    /** Retrieve user_settings from repository for the user **/
    public UserSettingsData retrieveUserSettings(String login) {

        return userSettingsRepository.findById(login)
                .orElse(UserSettingsData.builder().login(login).build());
    }

    /** Retrieve groups from repository for groups list, throwing an error if a group id is not found
     * */
    public List<GroupData> retrieveGroups(List<String> groupIds) {
        List<GroupData> foundGroups = new ArrayList<>();
        for(String id : groupIds){
            GroupData foundGroup = groupRepository.findById(id).orElseThrow(
                    () -> new ApiErrorException(
                            ApiError.builder()
                                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                    .message(String.format(GROUP_ID_IMPOSSIBLE_TO_FETCH_MSG, id))
                                    .build()
                    ));
            foundGroups.add(foundGroup);
        }
        return foundGroups;
    }

    /** Retrieve perimeters from repository for perimeter list, throwing an error if a perimeter is not found
     * */
    public List<PerimeterData> retrievePerimeters(List<String> perimeterIds) {
        List<PerimeterData> foundPerimeters = new ArrayList<>();
        for(String perimeterId : perimeterIds){
            PerimeterData foundPerimeter = perimeterRepository.findById(perimeterId).orElseThrow(
                    () -> new ApiErrorException(
                            ApiError.builder()
                                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                    .message(String.format(PERIMETER_ID_IMPOSSIBLE_TO_FETCH_MSG, perimeterId))
                                    .build()
                    ));
            foundPerimeters.add(foundPerimeter);
        }
        return foundPerimeters;
    }

    public boolean isEachStateUniqueInPerimeter(Perimeter perimeter){

        if ((perimeter != null) && (perimeter.getStateRights().size() > 1)) {

            Set<String> mySet = new HashSet<>();
            for (StateRight stateRight : perimeter.getStateRights()) {

                String state = stateRight.getState();
                if (! mySet.contains(state))
                    mySet.add(state);
                else
                    return false;
            }
        }
        return true;
    }

    //Retrieve users from repository for the group and publish an UpdatedUserEvent
    public void publishUpdatedUserEvent(String groupId){
        List<UserData> foundUsers = userRepository.findByGroupSetContaining(groupId);
        if (foundUsers != null) {
            for (UserData userData : foundUsers)
                publisher.publishEvent(new UpdatedUserEvent(this, busServiceMatcher.getServiceId(), userData.getLogin()));
        }
    }

    @Override
    public User createUser(User user) {
        userRepository.save(new UserData(user));
        return user;
    }
}

