
/* Copyright (c) 2023, RTE (http://www.rte-france.com)
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
import org.opfab.users.model.OperationResult;
import org.opfab.users.model.Perimeter;
import org.opfab.users.model.PerimeterData;
import org.opfab.users.model.RightsEnum;
import org.opfab.users.model.StateRight;
import org.opfab.users.model.StateRightData;
import org.opfab.users.model.UserSettings;
import org.opfab.users.model.UserSettingsData;
import org.opfab.users.spies.EventBusSpy;
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

        @BeforeEach
        void clear() {
                userSettingsRepositoryStub.deleteAll();
                userRepositoryStub.deleteAll();
                UserSettings settings1 = UserSettingsData.builder().login("user1").description("desc").locale("fr")
                                .build();
                UserSettings settings2 = UserSettingsData.builder().login("user2").description("desc").locale("fr")
                                .build();
                userSettingsRepositoryStub.save(settings1);
                userSettingsRepositoryStub.save(settings2);

                usersServiceStub = new UsersServiceStub(null, null, null, null, null);
                eventBusSpy = new EventBusSpy();
                userSettingsService = new UserSettingsService(userSettingsRepositoryStub, usersServiceStub,
                                new NotificationService(userRepositoryStub, eventBusSpy));
                initPerimetersPerUsers();
        }

        private void initPerimetersPerUsers() {
                usersServiceStub.clearPerimetersPerUser();

                StateRight stateRight1 = new StateRightData();
                stateRight1.setState("state1");
                stateRight1.setRight(RightsEnum.RECEIVE);
                StateRight stateRight2 = new StateRightData();
                stateRight2.setState("state2");
                stateRight2.setRight(RightsEnum.WRITE);
                stateRight2.setFilteringNotificationAllowed(true);
                StateRight stateRightNotFilterable = new StateRightData();
                stateRightNotFilterable.setState("stateRightNotFilterable");
                stateRightNotFilterable.setRight(RightsEnum.RECEIVE);
                stateRightNotFilterable.setFilteringNotificationAllowed(false);

                PerimeterData perimeter1 = new PerimeterData();
                perimeter1.setId("perimeter1");
                perimeter1.setProcess("process1");
                List<StateRight> stateRights1 = new ArrayList<>();
                stateRights1.add(stateRight1);
                stateRights1.add(stateRight2);
                perimeter1.setStateRights(stateRights1);

                PerimeterData perimeter2 = new PerimeterData();
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
                void GIVEN_Not_Existing_Settings_In_Repository_WHEN_Fetch_Settings_THEN_Return_NOT_FOUND() {
                        OperationResult<UserSettings> settings = userSettingsService.fetchUserSettings("dummy");
                        assertThat(settings.isSuccess()).isFalse();
                        assertThat(settings.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
                        assertThat(settings.getErrorMessage()).isEqualTo("User setting for user dummy not found");
                }

                @Test
                void GIVEN_Existing_Settings_In_Repository_WHEN_Fetch_Settings_THEN_Success_And_Return_Settings() {
                        OperationResult<UserSettings> settings = userSettingsService.fetchUserSettings("user1");
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getLogin()).isEqualTo("user1");
                        assertThat(settings.getResult().getDescription()).isEqualTo("desc");
                }

        }

        @Nested
        @DisplayName("Patch")
        class Patch {

                @Test
                void GIVEN_Existing_Settings_WHEN_Patch_Settings_THEN_Settings_Are_Updated() {

                        UserSettings newSettings = UserSettingsData.builder().login("user1").description("desc")
                                        .locale("newLocale")
                                        .build();
                        OperationResult<UserSettings> settings = userSettingsService.patchUserSettings("user1",
                                        newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getLocale()).isEqualTo("newLocale");
                        assertThat(userSettingsRepositoryStub.findById("user1").get().getLocale())
                                        .isEqualTo("newLocale");

                }

                @Test
                void GIVEN_None_Existing_Settings_WHEN_Patch_Settings_THEN_Settings_Are_Created() {

                        UserSettings newSettings = UserSettingsData.builder().login("user3").description("desc")
                                        .locale("nl")
                                        .build();
                        OperationResult<UserSettings> settings = userSettingsService.patchUserSettings("user3",
                                        newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getLocale()).isEqualTo("nl");
                        assertThat(userSettingsRepositoryStub.findById("user3").get().getLocale()).isEqualTo("nl");

                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Patch_With_Filtering_Notification_THEN_Settings_Are_Updated() {
                        Map<String, List<String>> processesStatesNotNotified = new HashMap<String, List<String>>();
                        processesStatesNotNotified.put("process1", Arrays.asList("state1", "state2"));
                        UserSettings newSettings = UserSettingsData.builder().login("user1").locale("newLocale")
                                        .processesStatesNotNotified(processesStatesNotNotified).build();
                        OperationResult<UserSettings> settings = userSettingsService.patchUserSettings("user1",
                                        newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getLocale()).isEqualTo("newLocale");
                        assertThat(settings.getResult().getDescription()).isEqualTo("desc");
                        assertThat(userSettingsRepositoryStub.findById("user1").get().getLocale())
                                        .isEqualTo("newLocale");
                        assertThat(userSettingsRepositoryStub.findById("user1").get().getDescription())
                                        .isEqualTo("desc");
                        assertThat(
                                        userSettingsRepositoryStub.findById("user1").get()
                                                        .getProcessesStatesNotNotified().get("process1"))
                                        .containsExactlyInAnyOrder("state1", "state2");

                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Patch_With_Filtering_Notification_THEN_A_Notification_Is_Sent_To_Other_Services() {
                        Map<String, List<String>> processesStatesNotNotified = new HashMap<String, List<String>>();
                        processesStatesNotNotified.put("process1", Arrays.asList("state1", "state2"));
                        UserSettings newSettings = UserSettingsData.builder().login("user1").locale("newLocale")
                                        .processesStatesNotNotified(processesStatesNotNotified).build();
                        OperationResult<UserSettings> settings = userSettingsService.patchUserSettings("user1",
                                        newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        String[] expectedMessageSent1 = { "USER_EXCHANGE", "user1" };
                        assertThat(eventBusSpy.getMessagesSent()).containsExactlyInAnyOrder(expectedMessageSent1);

                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Patch_With_Filtering_Notification_And_One_Not_Filterable_THEN_Settings_Are_Not_Updated() {
                        Map<String, List<String>> processesStatesNotNotified = new HashMap<String, List<String>>();
                        processesStatesNotNotified.put("process1", Arrays.asList("state1", "state2"));
                        processesStatesNotNotified.put("process2", Arrays.asList("stateRightNotFilterable"));
                        UserSettings newSettings = UserSettingsData.builder().login("user1").locale("newLocale")
                                        .processesStatesNotNotified(processesStatesNotNotified).build();
                        OperationResult<UserSettings> settings = userSettingsService.patchUserSettings("user1",
                                        newSettings);
                        assertThat(settings.isSuccess()).isFalse();
                        assertThat(settings.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
                        assertThat(settings.getErrorMessage())
                                        .isEqualTo("Filtering notification not allowed for at least one process/state");
                        assertThat(userSettingsRepositoryStub.findById("user1").get().getLocale()).isEqualTo("fr");
                        assertThat(userSettingsRepositoryStub.findById("user1").get().getDescription())
                                        .isEqualTo("desc");
                        assertThat(
                                        userSettingsRepositoryStub.findById("user1").get()
                                                        .getProcessesStatesNotNotified())
                                        .isEmpty();

                }

        }

        @Nested
        @DisplayName("Update")
        class Update {

                @Test
                void GIVEN_Existing_Settings_WHEN_Update_Settings_THEN_Settings_Are_Updated() {

                        UserSettings newSettings = UserSettingsData.builder().login("user1").locale("newLocale")
                                        .build();
                        OperationResult<UserSettings> settings = userSettingsService.updateUserSettings("user1",
                                        newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getLocale()).isEqualTo("newLocale");
                        assertThat(userSettingsRepositoryStub.findById("user1").get().getLocale())
                                        .isEqualTo("newLocale");
                        assertThat(userSettingsRepositoryStub.findById("user1").get().getDescription()).isNull();

                }

                @Test
                void GIVEN_None_Existing_Settings_WHEN_Update_Settings_THEN_Settings_Are_Created() {

                        UserSettings newSettings = UserSettingsData.builder().login("user3").description("desc")
                                        .locale("nl")
                                        .build();
                        OperationResult<UserSettings> settings = userSettingsService.updateUserSettings("user3",
                                        newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getLocale()).isEqualTo("nl");
                        assertThat(userSettingsRepositoryStub.findById("user3").get().getLocale()).isEqualTo("nl");
                        assertThat(userSettingsRepositoryStub.findById("user3").get().getDescription())
                                        .isEqualTo("desc");

                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Update_With_Filtering_Notification_THEN_Settings_Are_Updated() {
                        Map<String, List<String>> processesStatesNotNotified = new HashMap<String, List<String>>();
                        processesStatesNotNotified.put("process1", Arrays.asList("state1", "state2"));
                        UserSettings newSettings = UserSettingsData.builder().login("user1").locale("newLocale")
                                        .processesStatesNotNotified(processesStatesNotNotified).build();
                        OperationResult<UserSettings> settings = userSettingsService.updateUserSettings("user1",
                                        newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        assertThat(settings.getResult().getLocale()).isEqualTo("newLocale");
                        assertThat(settings.getResult().getDescription()).isNull();
                        assertThat(userSettingsRepositoryStub.findById("user1").get().getLocale())
                                        .isEqualTo("newLocale");
                        assertThat(userSettingsRepositoryStub.findById("user1").get().getDescription()).isNull();
                        assertThat(
                                        userSettingsRepositoryStub.findById("user1").get()
                                                        .getProcessesStatesNotNotified().get("process1"))
                                        .containsExactlyInAnyOrder("state1", "state2");

                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Update_With_Filtering_Notification_THEN_A_Notification_Is_Sent_To_Other_Services() {
                        Map<String, List<String>> processesStatesNotNotified = new HashMap<String, List<String>>();
                        processesStatesNotNotified.put("process1", Arrays.asList("state1", "state2"));
                        UserSettings newSettings = UserSettingsData.builder().login("user1").locale("newLocale")
                                        .processesStatesNotNotified(processesStatesNotNotified).build();
                        OperationResult<UserSettings> settings = userSettingsService.updateUserSettings("user1",
                                        newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        String[] expectedMessageSent1 = { "USER_EXCHANGE", "user1" };
                        assertThat(eventBusSpy.getMessagesSent()).containsExactlyInAnyOrder(expectedMessageSent1);

                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Update_With_No_Filtering_Notification_THEN_A_Notification_Is_Sent_To_Other_Services() {
                        UserSettings newSettings = UserSettingsData.builder().login("user1").locale("newLocale")
                                        .build();
                        OperationResult<UserSettings> settings = userSettingsService.updateUserSettings("user1",newSettings);
                        assertThat(settings.isSuccess()).isTrue();
                        String[] expectedMessageSent1 = { "USER_EXCHANGE", "user1" };
                        assertThat(eventBusSpy.getMessagesSent()).containsExactlyInAnyOrder(expectedMessageSent1);

                }

                @Test
                void GIVEN_Existing_Settings_WHEN_Update_With_Filtering_Notification_And_One_Not_Filterable_THEN_Settings_Are_Not_Updated() {
                        Map<String, List<String>> processesStatesNotNotified = new HashMap<String, List<String>>();
                        processesStatesNotNotified.put("process1", Arrays.asList("state1", "state2"));
                        processesStatesNotNotified.put("process2", Arrays.asList("stateRightNotFilterable"));
                        UserSettings newSettings = UserSettingsData.builder().login("user1").locale("newLocale")
                                        .processesStatesNotNotified(processesStatesNotNotified).build();
                        OperationResult<UserSettings> settings = userSettingsService.updateUserSettings("user1",
                                        newSettings);
                        assertThat(settings.isSuccess()).isFalse();
                        assertThat(settings.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
                        assertThat(settings.getErrorMessage())
                                        .isEqualTo("Filtering notification not allowed for at least one process/state");
                        assertThat(userSettingsRepositoryStub.findById("user1").get().getLocale()).isEqualTo("fr");
                        assertThat(userSettingsRepositoryStub.findById("user1").get().getDescription())
                                        .isEqualTo("desc");
                        assertThat(
                                        userSettingsRepositoryStub.findById("user1").get()
                                                        .getProcessesStatesNotNotified())
                                        .isEmpty();

                }

        }

}
