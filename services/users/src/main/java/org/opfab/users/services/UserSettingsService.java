/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.users.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.opfab.users.model.ComputedPerimeter;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.OperationResult;
import org.opfab.users.model.Perimeter;
import org.opfab.users.model.User;
import org.opfab.users.model.UserSettings;
import org.opfab.users.repositories.UserSettingsRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class UserSettingsService {

    private static final String USER_SETTINGS_NOT_FOUND_MSG = "User setting for user %s not found";
    private static final String FILTERING_NOTIFICATION_NOT_ALLOWED = "Filtering notification not allowed for at least one process/state";

    private UserSettingsRepository userSettingsRepository;

    private UsersService userService;

    private NotificationService notificationService;

    public UserSettingsService(UserSettingsRepository userSettingsRepository, UsersService usersService,
            NotificationService notificationService) {
        this.userSettingsRepository = userSettingsRepository;
        this.userService = usersService;
        this.notificationService = notificationService;
    }

    public OperationResult<UserSettings> fetchUserSettings(String login) {
        Optional<UserSettings> user = userSettingsRepository.findById(login);
        if (user.isPresent())
            return new OperationResult<>(user.get(), true, null, null);
        else
            return new OperationResult<>(null, false, OperationResult.ErrorType.NOT_FOUND,
                    String.format(USER_SETTINGS_NOT_FOUND_MSG, login));
    }

    @SuppressWarnings("java:S2583") // false positive , it does not return always the same value as Sonar says 
    public OperationResult<UserSettings> patchUserSettings(String login, UserSettings userSettingsPatch) {

        UserSettings oldSettings = userSettingsRepository.findById(login)
                .orElse(this.getNewUserSettings(login));
        if (!checkFilteringNotificationIsAllowedForAllProcessesStates(login, userSettingsPatch))
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
                || (userSettingsPatch.getEmail() != null))
            notificationService.publishUpdatedUserMessage(login);

        return new OperationResult<>(newSettings, true, null, null);
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

}
