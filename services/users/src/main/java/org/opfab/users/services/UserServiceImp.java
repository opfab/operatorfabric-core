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
import org.opfab.users.model.UserData;
import org.opfab.users.model.UserSettingsData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
public class UserServiceImp implements UserService {

    public static final String PERIMETER_ID_IMPOSSIBLE_TO_FETCH_MSG = "Perimeter id impossible to fetch : %s";

    public static final String ID_IS_REQUIRED_MSG = "Id is required.";
    public static final String ID_FIELD_PATTERN_MSG = "Id should only contain the following characters: letters, _, - or digits (id=%s).";
    public static final String ID_FIELD_MIN_LENGTH_MSG = "Id should be minimum 2 characters (id=%s).";
    public static final String ID_FIELD_PATTERN = "^[A-Za-z0-9-_]+$";

    public static final String MANDATORY_LOGIN_MISSING = "Mandatory 'login' field is missing.";
    public static final String LOGIN_FIELD_PATTERN_MSG = "Login should only contain the following characters: letters, _, -, . or digits (login=%s).";
    public static final String LOGIN_FIELD_MIN_LENGTH_MSG = "Login should be minimum 2 characters (login=%s).";
    public static final String LOGIN_FIELD_PATTERN = "^[A-Za-z0-9-_.]+$";

    private UserRepository userRepository;
    private GroupRepository groupRepository;
    private PerimeterRepository perimeterRepository;
    private UserSettingsRepository userSettingsRepository;
    private RabbitTemplate rabbitTemplate;

    public UserServiceImp(UserRepository userRepository, GroupRepository groupRepository,
            PerimeterRepository perimeterRepository, UserSettingsRepository userSettingsRepository,
            RabbitTemplate rabbitTemplate) {
                this.userRepository = userRepository;
                this.groupRepository = groupRepository;
                this.perimeterRepository = perimeterRepository;
                this.userSettingsRepository = userSettingsRepository;
                this.rabbitTemplate = rabbitTemplate;
    }

    public UserData retrieveUser(String login) {

        Optional<UserData> foundUser = userRepository.findById(login);
        if (foundUser.isPresent()) {
            return foundUser.get();
        } else {
            log.warn("User not found: {}", login);
            return null;
        }
    }

    @Override
    public UserSettingsData retrieveUserSettings(String login) {

        return userSettingsRepository.findById(login)
                .orElse(UserSettingsData.builder().login(login).build());
    }

    public List<Group> retrieveGroups(List<String> groupIds) {
        List<Group> foundGroups = new ArrayList<>();
        for (String id : groupIds) {
            Optional<Group> foundGroup = groupRepository.findById(id);
            if (foundGroup.isPresent()) {
                foundGroups.add(foundGroup.get());
            } else {
                log.warn("Group id not found: {}", id);
            }
        }
        return foundGroups;
    }

    public Set<Perimeter> findPerimetersAttachedToGroups(List<String> groupIds) {
        if ((groupIds != null) && (!groupIds.isEmpty())) {
            List<Group> groups = retrieveGroups(groupIds);

            if ((groups != null) && (!groups.isEmpty())) {
                Set<Perimeter> perimetersData = new HashSet<>(); // We use a set because we don't want to have a
                                                                 // duplicate
                groups.forEach( // For each group, we recover its perimeters
                        groupData -> {
                            List<Perimeter> list = retrievePerimeters(groupData.getPerimeters());
                            if (list != null)
                                perimetersData.addAll(list);
                        });
                return perimetersData;
            }
        }
        return Collections.emptySet();
    }

    public List<Perimeter> retrievePerimeters(List<String> perimeterIds) {
        List<Perimeter> foundPerimeters = new ArrayList<>();
        for (String perimeterId : perimeterIds) {
            Perimeter foundPerimeter = perimeterRepository.findById(perimeterId).orElseThrow(
                    () -> new ApiErrorException(
                            ApiError.builder()
                                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                    .message(String.format(PERIMETER_ID_IMPOSSIBLE_TO_FETCH_MSG, perimeterId))
                                    .build()));
            foundPerimeters.add(foundPerimeter);
        }
        return foundPerimeters;
    }

    public boolean isEachStateUniqueInPerimeter(Perimeter perimeter) {

        if ((perimeter != null) && (perimeter.getStateRights().size() > 1)) {

            Set<String> mySet = new HashSet<>();
            for (StateRight stateRight : perimeter.getStateRights()) {

                String state = stateRight.getState();
                if (!mySet.contains(state))
                    mySet.add(state);
                else
                    return false;
            }
        }
        return true;
    }

    public boolean checkFilteringNotificationIsAllowedForAllProcessesStates(String login, UserSettings userSettings) {
        if ((userSettings.getProcessesStatesNotNotified() != null)
                && (!userSettings.getProcessesStatesNotNotified().isEmpty())) {
            UserData userData = retrieveUser(login);

            if (userData != null) {
                List<String> groups = userData.getGroups();
                Set<Perimeter> perimeters = findPerimetersAttachedToGroups(groups);

                CurrentUserWithPerimetersData userWithPerimetersData = CurrentUserWithPerimetersData.builder()
                        .userData(userData).build();
                userWithPerimetersData.computePerimeters(perimeters);
                Map<String, Integer> processStatesWithFilteringNotificationNotAllowed = computeProcessStatesWithFilteringNotificationNotAllowed(
                        userWithPerimetersData);
                if (!isFilteringNotificationAllowedForAllProcessesStates(
                        processStatesWithFilteringNotificationNotAllowed,
                        userSettings.getProcessesStatesNotNotified()))
                    return false;
            }
        }
        return true;
    }

    private Map<String, Integer> computeProcessStatesWithFilteringNotificationNotAllowed(
            CurrentUserWithPerimeters currentUserWithPerimeters) {
        Map<String, Integer> processStatesWithFilteringNotificationNotAllowed = new HashMap<>();

        for (ComputedPerimeter computedPerimeter : currentUserWithPerimeters.getComputedPerimeters()) {
            if ((computedPerimeter.getFilteringNotificationAllowed() != null)
                    && (!computedPerimeter.getFilteringNotificationAllowed()))
                processStatesWithFilteringNotificationNotAllowed
                        .put(computedPerimeter.getProcess() + "." + computedPerimeter.getState(), 1);
        }
        return processStatesWithFilteringNotificationNotAllowed;
    }

    private boolean isFilteringNotificationAllowedForAllProcessesStates(
            Map<String, Integer> processStatesWithFilteringNotificationNotAllowed,
            Map<String, List<String>> processesStates) {

        if ((processesStates != null) && (processesStates.size() > 0)) {
            for (Map.Entry<String, List<String>> entry : processesStates.entrySet()) {
                List<String> stateIds = entry.getValue();
                String processId = entry.getKey();

                if (!isFilteringNotificationAllowedForAllProcessStates(processStatesWithFilteringNotificationNotAllowed,
                        processId, stateIds))
                    return false;
            }
        }
        return true;
    }

    private boolean isFilteringNotificationAllowedForAllProcessStates(
            Map<String, Integer> processStatesWithFilteringNotificationNotAllowed,
            String processId,
            List<String> stateIds) {
        if (stateIds != null) {
            for (String stateId : stateIds) {
                if (!isFilteringNotificationAllowedForThisProcessState(processStatesWithFilteringNotificationNotAllowed,
                        processId, stateId))
                    return false;
            }
        }
        return true;
    }

    private boolean isFilteringNotificationAllowedForThisProcessState(
            Map<String, Integer> processStatesWithFilteringNotificationNotAllowed,
            String processId, String stateId) {

        if (processStatesWithFilteringNotificationNotAllowed.containsKey(processId + "." + stateId)) {
            log.info("Filtering notification not allowed for process={} state={}", processId, stateId);
            return false;
        }
        return true;
    }

    // Retrieve users from repository for the group and publish a message to
    // USER_EXCHANGE
    public void publishUpdatedGroupMessage(String groupId) {
        List<UserData> foundUsers = userRepository.findByGroupSetContaining(groupId);
        if (foundUsers != null && !foundUsers.isEmpty()) {
            for (UserData userData : foundUsers)
                publishUpdatedUserMessage(userData.getLogin());
        } else
            publishUpdatedConfigMessage();
    }

    @Override
    public void publishUpdatedConfigMessage() {
        publishUpdatedUserMessage("");
    }

    public void publishUpdatedUserMessage(String userLogin) {
        rabbitTemplate.convertAndSend("USER_EXCHANGE", "", userLogin);
    }

    @Override
    public User createUser(User user) {
        userRepository.save(new UserData(user));
        return user;
    }

    public void checkFormatOfIdField(String id) throws ApiErrorException {
        String errorMessage = "";

        if (id.length() == 0)
            errorMessage = ID_IS_REQUIRED_MSG;
        else {
            if (id.length() == 1)
                errorMessage = String.format(ID_FIELD_MIN_LENGTH_MSG, id);

            if (!id.matches(ID_FIELD_PATTERN))
                errorMessage += String.format(ID_FIELD_PATTERN_MSG, id);
        }

        if (errorMessage.length() > 0)
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message(errorMessage)
                            .build());
    }

    public void checkFormatOfLoginField(String login) throws ApiErrorException {
        String errorMessage = "";

        if (login.length() == 0)
            errorMessage = MANDATORY_LOGIN_MISSING;
        else {
            if (login.length() == 1)
                errorMessage = String.format(LOGIN_FIELD_MIN_LENGTH_MSG, login);

            if (!login.matches(LOGIN_FIELD_PATTERN))
                errorMessage += String.format(LOGIN_FIELD_PATTERN_MSG, login);
        }

        if (errorMessage.length() > 0)
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message(errorMessage)
                            .build());
    }
}
