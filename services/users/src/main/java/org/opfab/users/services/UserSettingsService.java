/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.users.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.opfab.useractiontracing.model.UserActionEnum;
import org.opfab.useractiontracing.services.UserActionLogService;
import org.opfab.users.model.ComputedPerimeter;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.OperationResult;
import org.opfab.users.model.Perimeter;
import org.opfab.users.model.User;
import org.opfab.users.model.UserSettings;
import org.opfab.users.model.OperationResult.ErrorType;
import org.opfab.users.repositories.UserSettingsRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class UserSettingsService {

    private static final String FILTERING_NOTIFICATION_NOT_ALLOWED = "Filtering notification not allowed for at least one process/state";

    private static final String USER_SETTINGS_NOT_FOUND_MSG = "User setting for user %s not found";

    private UserSettingsRepository userSettingsRepository;

    private UsersService userService;

    private NotificationService notificationService;

    private UserActionLogService userActionLogService;

    private boolean userActionLogActivated;

    public UserSettingsService(UserSettingsRepository userSettingsRepository, UsersService usersService,
            NotificationService notificationService, UserActionLogService userActionLogService, boolean userActionLogActivated) {
        this.userSettingsRepository = userSettingsRepository;
        this.userService = usersService;
        this.notificationService = notificationService;
        this.userActionLogService = userActionLogService;
        this.userActionLogActivated = userActionLogActivated;
    }

    public OperationResult<UserSettings> fetchUserSettings(String login) {
        Optional<UserSettings> foundUserSettings = userSettingsRepository.findById(login);
        UserSettings userSettings;
        if (foundUserSettings.isPresent()) userSettings = foundUserSettings.get();
        else {
            Optional<User> user = userService.fetchUserByLogin(login);
            if (user.isPresent())
                userSettings = userSettingsRepository.save(this.getNewUserSettings(login));
            else return new OperationResult<>(null, false, OperationResult.ErrorType.NOT_FOUND,
                    String.format(USER_SETTINGS_NOT_FOUND_MSG, login));
        }
        
        return new OperationResult<>(userSettings, true, null, null);
    }

    @SuppressWarnings("java:S2583") // false positive , it does not return always the same value as Sonar says 
    public OperationResult<UserSettings> patchUserSettings(User userRequestingPatch, String userLoginToPatch, UserSettings userSettingsPatch) {

        Optional<User> patchedUser = userService.fetchUserByLogin(userLoginToPatch);
        if (patchedUser.isEmpty())
            return new OperationResult<>(null, false, ErrorType.NOT_FOUND, "User not found: " + userLoginToPatch);

        UserSettings oldSettings = userSettingsRepository.findById(userLoginToPatch)
                .orElse(this.getNewUserSettings(userLoginToPatch));
        if (!checkFilteringNotificationIsAllowedForAllProcessesStates(userLoginToPatch, userSettingsPatch))
            return new OperationResult<>(null, false, OperationResult.ErrorType.BAD_REQUEST,
                    FILTERING_NOTIFICATION_NOT_ALLOWED);

        UserSettings newSettings = oldSettings.patch(userSettingsPatch);
        userSettingsRepository.save(newSettings);

        if ((userSettingsPatch.getProcessesStatesNotNotified() != null)
                || (userSettingsPatch.getProcessesStatesNotifiedByEmail() != null)
                || (userSettingsPatch.getEntitiesDisconnected() != null)
                || (userSettingsPatch.getSendCardsByEmail() != null)
                || (userSettingsPatch.getEmailToPlainText() != null)
                || (userSettingsPatch.getSendDailyEmail() != null)
                || (userSettingsPatch.getEmail() != null)
                || (userSettingsPatch.getTimezoneForEmails() != null))
            notificationService.publishUpdatedUserMessage(userLoginToPatch);

        if (userActionLogActivated && userSettingsPatch.getProcessesStatesNotNotified() != null) {
            userActionLogService.insertUserActionLog(userRequestingPatch.getLogin(), UserActionEnum.NOTIFICATION_CONFIG, userRequestingPatch.getEntities(), null,
                    getProcessesStatesNotNotifiedText(userLoginToPatch, newSettings.getProcessesStatesNotNotified()));
        }
        return new OperationResult<>(newSettings, true, null, null);
    }

    private String getProcessesStatesNotNotifiedText(String login, Map<String, List<String>> processesStatesNotNotified) {
        StringBuilder sb = new StringBuilder();
        sb.append("Patch " + login + ":\n");
        processesStatesNotNotified.forEach((process, states) ->
            sb.append(process).append(": [").append(String.join(",", states)).append("]\n")
        );
        return sb.toString();
    }

    private UserSettings getNewUserSettings(String login) {
        UserSettings settings = new UserSettings();
        settings.setLogin(login);
        return settings;

    }

    @SuppressWarnings({"java:S2583","java:S3516"}) // false positive , it does not return always the same value as Sonar says
    private boolean checkFilteringNotificationIsAllowedForAllProcessesStates(String login, UserSettings userSettings) {
        if ((userSettings.getProcessesStatesNotNotified() != null)
                && (!userSettings.getProcessesStatesNotNotified().isEmpty())) {

            List<Perimeter> perimeters = userService.fetchUserPerimeters(login).getResult();
            if (perimeters == null)
                return true;

            Set<Perimeter> perimeterAsSet = Set.copyOf(perimeters);
            User userData = new User();
            userData.setLogin(login);
            CurrentUserWithPerimeters userWithPerimetersData = new CurrentUserWithPerimeters();
            userWithPerimetersData.setUserData(userData);
            userWithPerimetersData.computePerimeters(perimeterAsSet);
            Map<String, Integer> processStatesWithFilteringNotificationNotAllowed = computeProcessStatesWithFilteringNotificationNotAllowed(
                    userWithPerimetersData);
            if (!isFilteringNotificationAllowedForAllProcessesStates(processStatesWithFilteringNotificationNotAllowed,
                    userSettings.getProcessesStatesNotNotified()))
                return false;

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

    @SuppressWarnings("java:S2583") // false positive , it does not return always the same value as Sonar says 
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

    @SuppressWarnings("java:S2583") // false positive , it does not return always the same value as Sonar says 
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

    @SuppressWarnings("java:S2583") // false positive , it does not return always the same value as Sonar says 
    public OperationResult<UserSettings> updateUserSettings(String login, UserSettings newSettings) {
        if (!checkFilteringNotificationIsAllowedForAllProcessesStates(login, newSettings))
            return new OperationResult<>(null, false, OperationResult.ErrorType.BAD_REQUEST,
                    FILTERING_NOTIFICATION_NOT_ALLOWED);
        userSettingsRepository.save(newSettings);
        notificationService.publishUpdatedUserMessage(login);
        return new OperationResult<>(newSettings, true, null, null);

    }

    public void setProcessStateNotified(String process, String state) {
        log.info("setProcessStateNotified for {} {}", process, state);
        List<UserSettings> settings = userSettingsRepository.findAll();

        settings.forEach(userSettings -> {
            if (userSettings.getProcessesStatesNotNotified() != null && userSettings.getProcessesStatesNotNotified().get(process) != null) {
                List<String> statesNotNotified = userSettings.getProcessesStatesNotNotified().get(process);
                int stateIndex = statesNotNotified.indexOf(state);
                if (stateIndex >= 0) {
                    statesNotNotified.remove(stateIndex);
                    userSettingsRepository.save(userSettings);
                    notificationService.publishUpdatedUserMessage(userSettings.getLogin());
                }
            }
        });
    }

    public void unsetProcessStateNotified(String process, String state) {
        log.info("unsetProcessStateNotified for {} {}", process, state);
        List<UserSettings> settings = userSettingsRepository.findAll();

        settings.forEach(userSettings -> {
            if (userSettings.getProcessesStatesNotNotified() == null) userSettings.setProcessesStatesNotNotified(new HashMap<>());
            List<String> statesNotNotified = userSettings.getProcessesStatesNotNotified().computeIfAbsent(process, p -> new ArrayList<String>());
            int stateIndex = statesNotNotified.indexOf(state);
            if (stateIndex < 0) {
                statesNotNotified.add(state);
                userSettingsRepository.save(userSettings);
                notificationService.publishUpdatedUserMessage(userSettings.getLogin());
            }
        });
    }

    public void setProcessStateNotifiedByEmail(String process, String state) {
        log.info("setProcessStateNotifiedByEmail for {} {}", process, state);
        List<UserSettings> settings = userSettingsRepository.findAll();

        settings.forEach(userSettings -> {
            if (userSettings.getProcessesStatesNotifiedByEmail() == null) userSettings.setProcessesStatesNotifiedByEmail(new HashMap<>());
            List<String> statesNotified = userSettings.getProcessesStatesNotifiedByEmail().computeIfAbsent(process, p -> new ArrayList<String>());
            int stateIndex = statesNotified.indexOf(state);
            if (stateIndex < 0) {
                statesNotified.add(state);
                userSettingsRepository.save(userSettings);
                notificationService.publishUpdatedUserMessage(userSettings.getLogin());
            }
        });
    }

    public void unsetProcessStateNotifiedByEmail(String process, String state) {
        log.info("unsetProcessStateNotifiedByEmail for {} {}", process, state);
        List<UserSettings> settings = userSettingsRepository.findAll();

        settings.forEach(userSettings -> {
            if (userSettings.getProcessesStatesNotifiedByEmail() != null && userSettings.getProcessesStatesNotifiedByEmail().get(process) != null) {
                List<String> statesNotified = userSettings.getProcessesStatesNotifiedByEmail().get(process);
                int stateIndex = statesNotified.indexOf(state);
                if (stateIndex >= 0) {
                    statesNotified.remove(stateIndex);
                    userSettingsRepository.save(userSettings);
                    notificationService.publishUpdatedUserMessage(userSettings.getLogin());
                }
            }
        });
    }
}
