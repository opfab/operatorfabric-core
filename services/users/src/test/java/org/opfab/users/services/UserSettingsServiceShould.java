
/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.users.services;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.opfab.test.EventBusSpy;
import org.opfab.users.model.OperationResult;
import org.opfab.users.model.Perimeter;
import org.opfab.users.model.RightsEnum;
import org.opfab.users.model.StateRight;
import org.opfab.users.model.User;
import org.opfab.users.model.UserSettings;
import org.opfab.users.stubs.UserRepositoryStub;
import org.opfab.users.stubs.UsersServiceStub;
import org.opfab.users.stubs.UserSettingsRepositoryStub;

@DisplayName("UserSettingsService")
public class UserSettingsServiceShould {

        private UserSettingsRepositoryStub userSettingsRepositoryStub = new UserSettingsRepositoryStub();
        private UserRepositoryStub userRepositoryStub = new UserRepositoryStub();
        private UserSettingsService userSettingsService;
        private UsersServiceStub usersServiceStub;
        private EventBusSpy eventBusSpy;
        private User user1;

        @BeforeEach
        void clear() {
                userSettingsRepositoryStub.deleteAll();
                userRepositoryStub.deleteAll();

                user1 = new User();
                user1.setLogin("user1");
                userRepositoryStub.insert(user1);

                User userWithNoSettings = new User();
                userWithNoSettings.setLogin("userWithNoSettings");
                userRepositoryStub.insert(userWithNoSettings);

                UserSettings settings1 = new UserSettings();
                settings1.setLogin("user1");
                settings1.setLocale("fr");
                settings1.setProcessesStatesNotNotified(new HashMap<>());

                UserSettings settings2 = new UserSettings();
                settings2.setLogin("user2");
                settings2.setLocale("fr");

                userSettingsRepositoryStub.save(settings1);
                userSettingsRepositoryStub.save(settings2);

                usersServiceStub = new UsersServiceStub(userRepositoryStub, null, null, null, null);
                eventBusSpy = new EventBusSpy();
                userSettingsService = new UserSettingsService(userSettingsRepositoryStub, usersServiceStub,
                                new NotificationService(userRepositoryStub, eventBusSpy), null, false);
                initPerimetersPerUsers();
        }

        private void initPerimetersPerUsers() {
                usersServiceStub.clearPerimetersPerUser();

                StateRight stateRight1 = new StateRight();
                stateRight1.setState("state1");
                stateRight1.setRight(RightsEnum.Receive);
                StateRight stateRight2 = new StateRight();
                stateRight2.setState("state2");
                stateRight2.setRight(RightsEnum.ReceiveAndWrite);
                stateRight2.setFilteringNotificationAllowed(true);
                StateRight stateRightNotFilterable = new StateRight();
                stateRightNotFilterable.setState("stateRightNotFilterable");
                stateRightNotFilterable.setRight(RightsEnum.Receive);
                stateRightNotFilterable.setFilteringNotificationAllowed(false);

                Perimeter perimeter1 = new Perimeter();
                perimeter1.setId("perimeter1");
                perimeter1.setProcess("process1");
                List<StateRight> stateRights1 = new ArrayList<>();
                stateRights1.add(stateRight1);
                stateRights1.add(stateRight2);
                perimeter1.setStateRights(stateRights1);

                Perimeter perimeter2 = new Perimeter();
                List<StateRight> stateRights3 = new ArrayList<>();
                stateRights3.add(stateRight1);
                stateRights3.add(stateRight2);
                stateRights3.add(stateRightNotFilterable);
                perimeter2.setId("perimeter2");
                perimeter2.setProcess("process2");
                perimeter2.setStateRights(stateRights3);

                List<Perimeter> perimeterList = new ArrayList<>();
                perimeterList.add(perimeter1);
                perimeterList.add(perimeter2);
                usersServiceStub.setPerimetersForUser(perimeterList, "user1");
        }

        @Nested
        @DisplayName("Fetch")
        class Fetch {

                @Test
                void GIVEN_Not_Existing_Settings_In_Repository_WHEN_Fetch_Settings_THEN_Success_And_Return_New_Empty_Settings() {
                        OperationResult<UserSettings> settings = userSettingsService.fetchUserSettings("userWithNoSettings");
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getLogin()).isEqualTo("userWithNoSettings");
                        assertThat(settings.getResult().getLocale()).isNull();
                }

                @Test
                void GIVEN_Existing_Settings_In_Repository_WHEN_Fetch_Settings_THEN_Success_And_Return_Settings() {
                        OperationResult<UserSettings> settings = userSettingsService.fetchUserSettings("user1");
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getLogin()).isEqualTo("user1");
                        assertThat(settings.getResult().getLocale()).isEqualTo("fr");
                }

                @Test
                void GIVEN_Not_Existing_User_WHEN_Fetch_Settings_THEN_Return_NOT_FOUND() {
                        OperationResult<UserSettings> settings = userSettingsService.fetchUserSettings("dummy");
                        assertThat(settings.isSuccess()).isFalse();
                        assertThat(settings.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
                        assertThat(settings.getErrorMessage()).isEqualTo("User setting for user dummy not found");
                }
        }

        @Nested
        @DisplayName("Patch")
        class Patch {

                @Test
                void GIVEN_Existing_Settings_WHEN_Patch_Settings_THEN_Settings_Are_Updated() {

                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setLocale("newLocale");

                        OperationResult<UserSettings> settings = userSettingsService.patchUserSettings(user1, "user1",
                                        newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getLocale()).isEqualTo("newLocale");
                        assertThat(userSettingsRepositoryStub.findById("user1").get().getLocale())
                                        .isEqualTo("newLocale");

                }

                @Test
                void GIVEN_None_Existing_Settings_WHEN_Patch_Settings_THEN_Settings_Are_Created() {

                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("userWithNoSettings");
                        newSettings.setLocale("nl");

                        OperationResult<UserSettings> settings = userSettingsService.patchUserSettings(user1, "userWithNoSettings",
                                        newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getLocale()).isEqualTo("nl");
                        assertThat(userSettingsRepositoryStub.findById("userWithNoSettings").get().getLocale()).isEqualTo("nl");

                }

                @Test
                void GIVEN_Not_Existing_User_WHEN_Patch_Settings_THEN_Return_NOT_FOUND() {

                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("notExistingUser");
                        newSettings.setLocale("nl");

                        OperationResult<UserSettings> settings = userSettingsService.patchUserSettings(user1, "notExistingUser",
                                        newSettings);
                        assertThat(settings.isSuccess()).isFalse();
                        assertThat(settings.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
                        assertThat(settings.getErrorMessage()).isEqualTo("User not found: notExistingUser");
                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Patch_With_Filtering_Notification_THEN_Settings_Are_Updated() {
                        Map<String, List<String>> processesStatesNotNotified = new HashMap<String, List<String>>();
                        processesStatesNotNotified.put("process1", Arrays.asList("state1", "state2"));
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setLocale("newLocale");
                        newSettings.setProcessesStatesNotNotified(processesStatesNotNotified);
                        OperationResult<UserSettings> settings = userSettingsService.patchUserSettings(user1, "user1",
                                        newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getLocale()).isEqualTo("newLocale");
                        assertThat(userSettingsRepositoryStub.findById("user1").get().getLocale())
                                        .isEqualTo("newLocale");
                        assertThat(userSettingsRepositoryStub.findById("user1").get()
                                        .getProcessesStatesNotNotified().get("process1"))
                                        .containsExactlyInAnyOrder("state1", "state2");

                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Patch_With_Filtering_Notification_THEN_A_Notification_Is_Sent_To_Other_Services() {
                        Map<String, List<String>> processesStatesNotNotified = new HashMap<String, List<String>>();
                        processesStatesNotNotified.put("process1", Arrays.asList("state1", "state2"));
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setLocale("newLocale");
                        newSettings.setProcessesStatesNotNotified(processesStatesNotNotified);
                        OperationResult<UserSettings> settings = userSettingsService.patchUserSettings(user1, "user1",
                                        newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        String[] expectedMessageSent1 = { "user", "user1" };
                        assertThat(eventBusSpy.getMessagesSent()).containsExactlyInAnyOrder(expectedMessageSent1);

                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Patch_With_Filtering_Notification_And_One_Not_Filterable_THEN_Settings_Are_Not_Updated() {
                        Map<String, List<String>> processesStatesNotNotified = new HashMap<String, List<String>>();
                        processesStatesNotNotified.put("process1", Arrays.asList("state1", "state2"));
                        processesStatesNotNotified.put("process2", Arrays.asList("stateRightNotFilterable"));
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setLocale("newLocale");
                        newSettings.setProcessesStatesNotNotified(processesStatesNotNotified);
                        OperationResult<UserSettings> settings = userSettingsService.patchUserSettings(user1, "user1",
                                        newSettings);
                        assertThat(settings.isSuccess()).isFalse();
                        assertThat(settings.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
                        assertThat(settings.getErrorMessage())
                                        .isEqualTo("Filtering notification not allowed for at least one process/state");
                        assertThat(userSettingsRepositoryStub.findById("user1").get().getLocale()).isEqualTo("fr");
                        assertThat(userSettingsRepositoryStub.findById("user1").get()
                                        .getProcessesStatesNotNotified())
                                        .isEmpty();

                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Patch_With_SendCardsByEmail_THEN_Settings_Are_Updated() {
                        boolean sendCardsByEmail = true;
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setSendCardsByEmail(sendCardsByEmail);
                        OperationResult<UserSettings> settings = userSettingsService.patchUserSettings(user1, "user1",
                                newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getSendCardsByEmail()).isTrue();
                        assertThat(userSettingsRepositoryStub.findById("user1").get()
                                .getSendCardsByEmail())
                                .isTrue();
                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Patch_With_SendCardsByEmail_THEN_A_Notification_Is_Sent_To_Other_Services() {
                        boolean sendCardsByEmail = true;
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setSendCardsByEmail(sendCardsByEmail);
                        OperationResult<UserSettings> settings = userSettingsService.patchUserSettings(user1, "user1",
                                newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        String[] expectedMessageSent1 = { "user", "user1" };
                        assertThat(eventBusSpy.getMessagesSent()).containsExactlyInAnyOrder(expectedMessageSent1);
                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Patch_With_Email_THEN_Settings_Are_Updated() {
                        String email = "john.doe@test.com";
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setEmail(email);
                        OperationResult<UserSettings> settings = userSettingsService.patchUserSettings(user1, "user1",
                                newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getEmail()).isEqualTo("john.doe@test.com");
                        assertThat(userSettingsRepositoryStub.findById("user1").get()
                                .getEmail())
                                .isEqualTo("john.doe@test.com");
                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Patch_With_Email_THEN_A_Notification_Is_Sent_To_Other_Services() {
                        String email = "john.doe@test.com";
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setEmail(email);
                        OperationResult<UserSettings> settings = userSettingsService.patchUserSettings(user1, "user1",
                                newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        String[] expectedMessageSent1 = { "user", "user1" };
                        assertThat(eventBusSpy.getMessagesSent()).containsExactlyInAnyOrder(expectedMessageSent1);
                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Patch_With_TimezoneForEmails_THEN_Settings_Are_Updated() {
                        String timezoneForEmails = "Europe/London";
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setTimezoneForEmails(timezoneForEmails);
                        OperationResult<UserSettings> settings = userSettingsService.patchUserSettings(user1, "user1",
                                newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getTimezoneForEmails()).isEqualTo("Europe/London");
                        assertThat(userSettingsRepositoryStub.findById("user1").get()
                                .getTimezoneForEmails())
                                .isEqualTo("Europe/London");
                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Patch_With_TimezoneForEmails_THEN_A_Notification_Is_Sent_To_Other_Services() {
                        String timezoneForEmails = "Europe/Sofia";
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setTimezoneForEmails(timezoneForEmails);
                        OperationResult<UserSettings> settings = userSettingsService.patchUserSettings(user1, "user1",
                                newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        String[] expectedMessageSent1 = { "user", "user1" };
                        assertThat(eventBusSpy.getMessagesSent()).containsExactlyInAnyOrder(expectedMessageSent1);
                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Patch_With_ProcessesStatesNotifiedByEmail_THEN_Settings_Are_Updated() {
                        Map<String, List<String>> processesStatesNotifiedByEmail = new HashMap<String, List<String>>();
                        processesStatesNotifiedByEmail.put("processNotifByEmail", Arrays.asList("stateNotifByEmail1", "stateNotifByEmail2"));
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setProcessesStatesNotifiedByEmail(processesStatesNotifiedByEmail);
                        OperationResult<UserSettings> settings = userSettingsService.patchUserSettings(user1, "user1",
                                newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getProcessesStatesNotifiedByEmail().get("processNotifByEmail"))
                                .containsExactlyInAnyOrder("stateNotifByEmail1", "stateNotifByEmail2");
                        assertThat(userSettingsRepositoryStub.findById("user1").get()
                                .getProcessesStatesNotifiedByEmail().get("processNotifByEmail"))
                                .containsExactlyInAnyOrder("stateNotifByEmail1", "stateNotifByEmail2");

                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Patch_With_ProcessesStatesNotifiedByEmail_THEN_A_Notification_Is_Sent_To_Other_Services() {
                        Map<String, List<String>> processesStatesNotifiedByEmail = new HashMap<String, List<String>>();
                        processesStatesNotifiedByEmail.put("processNotifByEmail", Arrays.asList("stateNotifByEmail1", "stateNotifByEmail2"));
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setProcessesStatesNotifiedByEmail(processesStatesNotifiedByEmail);
                        OperationResult<UserSettings> settings = userSettingsService.patchUserSettings(user1, "user1",
                                newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        String[] expectedMessageSent1 = { "user", "user1" };
                        assertThat(eventBusSpy.getMessagesSent()).containsExactlyInAnyOrder(expectedMessageSent1);
                }
        }

        @Nested
        @DisplayName("Update")
        class Update {

                @Test
                void GIVEN_Existing_Settings_WHEN_Update_Settings_THEN_Settings_Are_Updated() {

                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setLocale("newLocale");
                        OperationResult<UserSettings> settings = userSettingsService.updateUserSettings("user1",
                                        newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getLocale()).isEqualTo("newLocale");
                        assertThat(userSettingsRepositoryStub.findById("user1").get().getLocale())
                                        .isEqualTo("newLocale");

                }

                @Test
                void GIVEN_None_Existing_Settings_WHEN_Update_Settings_THEN_Settings_Are_Created() {

                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user3");
                        newSettings.setLocale("nl");
                        OperationResult<UserSettings> settings = userSettingsService.updateUserSettings("user3",
                                        newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getLocale()).isEqualTo("nl");
                        assertThat(userSettingsRepositoryStub.findById("user3").get().getLocale()).isEqualTo("nl");
                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Update_With_Filtering_Notification_THEN_Settings_Are_Updated() {
                        Map<String, List<String>> processesStatesNotNotified = new HashMap<String, List<String>>();
                        processesStatesNotNotified.put("process1", Arrays.asList("state1", "state2"));
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setLocale("newLocale");
                        newSettings.setProcessesStatesNotNotified(processesStatesNotNotified);
                        OperationResult<UserSettings> settings = userSettingsService.updateUserSettings("user1",
                                        newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getLocale()).isEqualTo("newLocale");
                        assertThat(userSettingsRepositoryStub.findById("user1").get().getLocale())
                                        .isEqualTo("newLocale");
                        assertThat(userSettingsRepositoryStub.findById("user1").get()
                                        .getProcessesStatesNotNotified().get("process1"))
                                        .containsExactlyInAnyOrder("state1", "state2");

                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Update_With_Filtering_Notification_THEN_A_Notification_Is_Sent_To_Other_Services() {
                        Map<String, List<String>> processesStatesNotNotified = new HashMap<String, List<String>>();
                        processesStatesNotNotified.put("process1", Arrays.asList("state1", "state2"));
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setLocale("newLocale");
                        newSettings.setProcessesStatesNotNotified(processesStatesNotNotified);
                        OperationResult<UserSettings> settings = userSettingsService.updateUserSettings("user1",
                                        newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        String[] expectedMessageSent1 = { "user", "user1" };
                        assertThat(eventBusSpy.getMessagesSent()).containsExactlyInAnyOrder(expectedMessageSent1);

                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Update_With_No_Filtering_Notification_THEN_A_Notification_Is_Sent_To_Other_Services() {
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setLocale("newLocale");
                        OperationResult<UserSettings> settings = userSettingsService.updateUserSettings("user1",newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        String[] expectedMessageSent1 = { "user", "user1" };
                        assertThat(eventBusSpy.getMessagesSent()).containsExactlyInAnyOrder(expectedMessageSent1);

                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Update_With_Filtering_Notification_And_One_Not_Filterable_THEN_Settings_Are_Not_Updated() {
                        Map<String, List<String>> processesStatesNotNotified = new HashMap<String, List<String>>();
                        processesStatesNotNotified.put("process1", Arrays.asList("state1", "state2"));
                        processesStatesNotNotified.put("process2", Arrays.asList("stateRightNotFilterable"));
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setLocale("newLocale");
                        newSettings.setProcessesStatesNotNotified(processesStatesNotNotified);
                        OperationResult<UserSettings> settings = userSettingsService.updateUserSettings("user1",
                                        newSettings);
                        assertThat(settings.isSuccess()).isFalse();
                        assertThat(settings.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
                        assertThat(settings.getErrorMessage())
                                        .isEqualTo("Filtering notification not allowed for at least one process/state");
                        assertThat(userSettingsRepositoryStub.findById("user1").get().getLocale()).isEqualTo("fr");
                        assertThat(userSettingsRepositoryStub.findById("user1").get()
                                        .getProcessesStatesNotNotified())
                                        .isEmpty();
                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Update_With_SendCardsByEmail_THEN_Settings_Are_Updated() {
                        boolean sendCardsByEmail = true;
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setSendCardsByEmail(sendCardsByEmail);
                        OperationResult<UserSettings> settings = userSettingsService.updateUserSettings("user1",
                                newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getSendCardsByEmail()).isTrue();
                        assertThat(userSettingsRepositoryStub.findById("user1").get().getSendCardsByEmail())
                                .isTrue();
                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Update_With_SendCardsByEmail_THEN_A_Notification_Is_Sent_To_Other_Services() {
                        boolean sendCardsByEmail = true;
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setSendCardsByEmail(sendCardsByEmail);
                        OperationResult<UserSettings> settings = userSettingsService.updateUserSettings("user1",
                                newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        String[] expectedMessageSent1 = { "user", "user1" };
                        assertThat(eventBusSpy.getMessagesSent()).containsExactlyInAnyOrder(expectedMessageSent1);
                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Update_With_Email_THEN_Settings_Are_Updated() {
                        String email = "john.doe@test.com";
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setEmail(email);
                        OperationResult<UserSettings> settings = userSettingsService.updateUserSettings("user1",
                                newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getEmail()).isEqualTo("john.doe@test.com");
                        assertThat(userSettingsRepositoryStub.findById("user1").get().getEmail())
                                .isEqualTo("john.doe@test.com");
                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Update_With_Email_THEN_A_Notification_Is_Sent_To_Other_Services() {
                        String email = "john.doe@test.com";
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setEmail(email);
                        OperationResult<UserSettings> settings = userSettingsService.updateUserSettings("user1",
                                newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        String[] expectedMessageSent1 = { "user", "user1" };
                        assertThat(eventBusSpy.getMessagesSent()).containsExactlyInAnyOrder(expectedMessageSent1);
                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Update_With_TimezoneForEmails_THEN_Settings_Are_Updated() {
                        String timezoneForEmails = "America/New_York";
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setTimezoneForEmails(timezoneForEmails);
                        OperationResult<UserSettings> settings = userSettingsService.updateUserSettings("user1",
                                newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getTimezoneForEmails()).isEqualTo("America/New_York");
                        assertThat(userSettingsRepositoryStub.findById("user1").get().getTimezoneForEmails())
                                .isEqualTo("America/New_York");
                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Update_With_TimezoneForEmails_THEN_A_Notification_Is_Sent_To_Other_Services() {
                        String timezoneForEmails = "America/Nassau";
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setTimezoneForEmails(timezoneForEmails);
                        OperationResult<UserSettings> settings = userSettingsService.updateUserSettings("user1",
                                newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        String[] expectedMessageSent1 = { "user", "user1" };
                        assertThat(eventBusSpy.getMessagesSent()).containsExactlyInAnyOrder(expectedMessageSent1);
                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Update_With_ProcessesStatesNotifiedByEmail_THEN_Settings_Are_Updated() {
                        Map<String, List<String>> processesStatesNotifiedByEmail = new HashMap<String, List<String>>();
                        processesStatesNotifiedByEmail.put("processNotifByEmail", Arrays.asList("stateNotifByEmail1", "stateNotifByEmail2"));
                        UserSettings newSettings = new UserSettings();newSettings.setLogin("user1");
                        newSettings.setLocale("newLocale");
                        newSettings.setProcessesStatesNotifiedByEmail(processesStatesNotifiedByEmail);
                        OperationResult<UserSettings> settings = userSettingsService.updateUserSettings("user1",
                                newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getProcessesStatesNotifiedByEmail()
                                .get("processNotifByEmail"))
                                .containsExactlyInAnyOrder("stateNotifByEmail1", "stateNotifByEmail2");;
                        assertThat(userSettingsRepositoryStub.findById("user1").get()
                                .getProcessesStatesNotifiedByEmail().get("processNotifByEmail"))
                                .containsExactlyInAnyOrder("stateNotifByEmail1", "stateNotifByEmail2");
                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Update_With_ProcessesStatesNotifiedByEmail_THEN_A_Notification_Is_Sent_To_Other_Services() {
                        Map<String, List<String>> processesStatesNotifiedByEmail = new HashMap<String, List<String>>();
                        processesStatesNotifiedByEmail.put("processNotifByEmail", Arrays.asList("stateNotifByEmail1", "stateNotifByEmail2"));
                        UserSettings newSettings = new UserSettings();
                        newSettings.setLogin("user1");
                        newSettings.setProcessesStatesNotifiedByEmail(processesStatesNotifiedByEmail);
                        OperationResult<UserSettings> settings = userSettingsService.updateUserSettings("user1",
                                newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        String[] expectedMessageSent1 = { "user", "user1" };
                        assertThat(eventBusSpy.getMessagesSent()).containsExactlyInAnyOrder(expectedMessageSent1);
                }
        }
}
