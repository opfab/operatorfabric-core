/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
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
import org.opfab.users.repositories.UserSettingsRepository;
import org.opfab.users.model.GroupData;
import org.opfab.users.model.PerimeterData;
import org.opfab.users.model.UserData;
import org.opfab.users.model.UserSettingsData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
public class UserServiceImp implements UserService {

    public static final String PERIMETER_ID_IMPOSSIBLE_TO_FETCH_MSG = "Perimeter id impossible to fetch : %s";

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private PerimeterRepository perimeterRepository;
    @Autowired
    private UserSettingsRepository userSettingsRepository;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public UserData retrieveUser(String login) {

        Optional<UserData> foundUser = userRepository.findById(login);
        if (foundUser.isPresent()) {
            return foundUser.get();
        } else {
            log.warn("User not found: {}", login);
            return null;
        }
    }

    public UserSettingsData retrieveUserSettings(String login) {

        return userSettingsRepository.findById(login)
                .orElse(UserSettingsData.builder().login(login).build());
    }

    public List<GroupData> retrieveGroups(List<String> groupIds) {
        List<GroupData> foundGroups = new ArrayList<>();
        for(String id : groupIds){
            Optional<GroupData> foundGroup = groupRepository.findById(id);
            if (foundGroup.isPresent()) {
                foundGroups.add(foundGroup.get());
            } else {
                log.warn("Group id not found: {}", id);
            }
        }
        return foundGroups;
    }

    public Set<Perimeter> findPerimetersAttachedToGroups(List<String> groups) {
        if ((groups != null) && (!groups.isEmpty())) {
            List<GroupData> groupsData = retrieveGroups(groups);

            if ((groupsData != null) && (!groupsData.isEmpty())) {
                Set<Perimeter> perimetersData = new HashSet<>(); //We use a set because we don't want to have a duplicate
                groupsData.forEach(     //For each group, we recover its perimeters
                        groupData -> {
                            List<PerimeterData> list = retrievePerimeters(groupData.getPerimeters());
                            if (list != null)
                                perimetersData.addAll(list);
                        });
                return perimetersData;
            }
        }
        return Collections.emptySet();
    }

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

    public boolean checkFilteringNotificationIsAllowedForAllProcessesStates(String login, UserSettings userSettings) {
        if ((userSettings.getProcessesStatesNotNotified() != null) && (!userSettings.getProcessesStatesNotNotified().isEmpty())) {
            UserData userData = retrieveUser(login);

            if (userData != null) {
                List<String> groups = userData.getGroups();
                Set<Perimeter> perimeters = findPerimetersAttachedToGroups(groups);

                CurrentUserWithPerimetersData userWithPerimetersData = CurrentUserWithPerimetersData.builder().userData(userData).build();
                userWithPerimetersData.computePerimeters(perimeters);
                if (!isFilteringNotificationAllowedForAllProcessesStates(userWithPerimetersData,
                        userSettings.getProcessesStatesNotNotified()))
                    return false;
            }
        }
        return true;
    }

    private boolean isFilteringNotificationAllowedForAllProcessesStates(CurrentUserWithPerimeters currentUserWithPerimeters,
                                                                       Map<String, List<String>> processesStates){

        if ((processesStates != null) && (processesStates.size() > 0)) {
            for (Map.Entry<String, List<String>> entry : processesStates.entrySet()) {
                List <String> stateIds = entry.getValue();
                String processId = entry.getKey();

                if (! isFilteringNotificationAllowedForAllProcessStates(currentUserWithPerimeters, processId, stateIds))
                    return false;
            }
        }
        return true;
    }

    private boolean isFilteringNotificationAllowedForAllProcessStates(CurrentUserWithPerimeters currentUserWithPerimeters,
                                                              String processId,
                                                              List<String> stateIds) {
        if (stateIds != null) {
            for (String stateId : stateIds) {
                if (!isFilteringNotificationAllowedForThisProcessState(currentUserWithPerimeters, processId, stateId))
                    return false;
            }
        }
        return true;
    }

    private boolean isFilteringNotificationAllowedForThisProcessState(CurrentUserWithPerimeters currentUserWithPerimeters,
                                                                     String processId, String stateId){

        for (ComputedPerimeter computedPerimeter: currentUserWithPerimeters.getComputedPerimeters()) {

            if ((computedPerimeter.getProcess().equals(processId)) && (computedPerimeter.getState().equals(stateId)) &&
                (computedPerimeter.getFilteringNotificationAllowed() != null) && (!computedPerimeter.getFilteringNotificationAllowed())) {
                log.info("Filtering notification not allowed for user={} process={} state={}",
                        currentUserWithPerimeters.getUserData().getLogin(), processId, stateId);
                return false;
            }
        }
        return true;
    }

    //Retrieve users from repository for the group and publish a message to USER_EXCHANGE
    public void publishUpdatedGroupMessage(String groupId){
        List<UserData> foundUsers = userRepository.findByGroupSetContaining(groupId);
        if (foundUsers != null && !foundUsers.isEmpty()) {
            for (UserData userData : foundUsers)
                publishUpdatedUserMessage(userData.getLogin());
        } else publishUpdatedConfigMessage();
    }

    @Override
    public void publishUpdatedConfigMessage(){
        publishUpdatedUserMessage("");
    }

    public void publishUpdatedUserMessage(String userLogin){
        rabbitTemplate.convertAndSend("USER_EXCHANGE", "", userLogin);
    }

    @Override
    public User createUser(User user) {
        userRepository.save(new UserData(user));
        return user;
    }
}

