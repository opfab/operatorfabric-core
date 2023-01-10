/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
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
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.opfab.users.model.EntityCreationReport;
import org.opfab.users.model.Group;
import org.opfab.users.model.GroupData;
import org.opfab.users.model.OperationResult;
import org.opfab.users.model.Perimeter;
import org.opfab.users.model.PerimeterData;
import org.opfab.users.model.RightsEnum;
import org.opfab.users.model.StateRight;
import org.opfab.users.model.StateRightData;
import org.opfab.users.model.User;
import org.opfab.users.model.UserData;
import org.opfab.users.spies.EventBusSpy;
import org.opfab.users.stubs.GroupRepositoryStub;
import org.opfab.users.stubs.PerimeterRepositoryStub;
import org.opfab.users.stubs.UserRepositoryStub;

@DisplayName("GroupsService")
class GroupsServiceShould {

    private GroupRepositoryStub groupRepositoryStub = new GroupRepositoryStub();
    private UserRepositoryStub userRepositoryStub = new UserRepositoryStub();
    private PerimeterRepositoryStub perimeterRepositoryStub = new PerimeterRepositoryStub();
    private NotificationService notificationService = new NotificationService(userRepositoryStub,new EventBusSpy());
    private GroupsService groupsService;

    @BeforeEach
    void clear() {
        groupRepositoryStub.deleteAll();
        userRepositoryStub.deleteAll();
        perimeterRepositoryStub.deleteAll();

        List<StateRight> states = new ArrayList<>();
        states.add(new StateRightData("perimeter1", RightsEnum.RECEIVE, true));
        perimeterRepositoryStub.insert(new PerimeterData("perimeter1", "processId", states));
        perimeterRepositoryStub.insert(new PerimeterData("perimeter2", "processId", states));
        perimeterRepositoryStub.insert(new PerimeterData("perimeter3", "processId", states));
        Set<String> perimeter = new HashSet<>();
        perimeter.add("perimeter1");

        GroupData group1 = new GroupData("group1", "groupName", null, null, perimeter, null);
        GroupData groupAdmin = new GroupData("ADMIN", "admin", null, null, null, null);
        groupRepositoryStub.save(group1);
        groupRepositoryStub.save(groupAdmin);
        Set<String> groupForUser1 = new HashSet<>();
        groupForUser1.add("group1");
        userRepositoryStub.insert(new UserData("user1", "test", null, null, groupForUser1, null, null));
        Set<String> groupForUser2 = new HashSet<>();
        groupForUser2.add("group1");
        userRepositoryStub.insert(new UserData("user2", "test", null, null, groupForUser2, null, null));
        Set<String> groupForAdmin = new HashSet<>();
        groupForAdmin.add("ADMIN");
        userRepositoryStub.insert(new UserData("admin", "admin", null, null, groupForAdmin, null, null));

        groupsService = new GroupsService(groupRepositoryStub, userRepositoryStub,
                perimeterRepositoryStub, notificationService);

    }

    @Nested
    @DisplayName("Fetch")
    class Fetch {
        @Test
        void GIVEN_Groups_In_Repository_WHEN_Fetch_Groups_THEN_Return_All_Groups() {
            List<Group> groups = groupsService.fetchGroups();
            assertThat(groups).hasSize(2);
        }

        @Test
        void GIVEN_Not_Existing_Group_In_Repository_WHEN_Fetch_Group_THEN_Return_NOT_FOUND() {
            OperationResult<Group> group = groupsService.fetchGroup("dummy");
            assertThat(group.isSuccess()).isFalse();
            assertThat(group.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
            assertThat(group.getErrorMessage()).isEqualTo("Group dummy not found");
        }

        @Test
        void GIVEN_Existing_Group_In_Repository_WHEN_Fetch_Group_THEN_Success_And_Return_Group() {
            OperationResult<Group> group = groupsService.fetchGroup("group1");
            assertThat(group.isSuccess()).isTrue();
            assertThat(group.getResult().getId()).isEqualTo("group1");
            assertThat(group.getResult().getName()).isEqualTo("groupName");
        }

    }

    @Nested
    @DisplayName("Create")
    class Create {
        @Test
        void GIVEN_An_Invalid_GroupId__WHEN_Creating_Group_THEN_Return_Bad_Request() {
            GroupData group = new GroupData("invalid?id", "invalid id", null, null, null, null);
            OperationResult<EntityCreationReport<Group>> result = groupsService.createGroup(group);
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
            assertThat(result.getErrorMessage()).isEqualTo("Id should only contain the following characters: letters, _, - or digits (id=invalid?id).");
        }

        @Test
        void GIVEN_A_Valid_Group_WHEN_Create_Group_THEN_Return_Created_Group() {
            Set<String> perimeters = new HashSet<>();
            perimeters.add("perimeter1");
            GroupData group = new GroupData("newGroup", "groupName", null, null, perimeters, null);
            OperationResult<EntityCreationReport<Group>> result = groupsService.createGroup(group);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().isUpdate()).isFalse();
            assertThat(result.getResult().getEntity().getId()).isEqualTo("newGroup");
            assertThat(result.getResult().getEntity().getName()).isEqualTo("groupName");
            assertThat(result.getResult().getEntity().getPerimeters().get(0)).isEqualTo("perimeter1");
            assertThat(groupRepositoryStub.findById("newGroup").get().getName()).isEqualTo("groupName");
            assertThat(groupRepositoryStub.findById("newGroup").get().getPerimeters().get(0)).isEqualTo("perimeter1");
        }

        @Test
        void GIVEN_A_Valid_Group_WHEN_Create_An_Already_Existing_Group_THEN_Group_Is_Updated() {
            Set<String> perimeters = new HashSet<>();
            perimeters.add("perimeter1");
            GroupData group = new GroupData("group1", "newGroupName", null, null, perimeters, null);
            OperationResult<EntityCreationReport<Group>> result = groupsService.createGroup(group);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().isUpdate()).isTrue();
            assertThat(result.getResult().getEntity().getId()).isEqualTo("group1");
            assertThat(result.getResult().getEntity().getName()).isEqualTo("newGroupName");
            assertThat(result.getResult().getEntity().getPerimeters().get(0)).isEqualTo("perimeter1");
            assertThat(groupRepositoryStub.findById("group1").get().getName()).isEqualTo("newGroupName");
            assertThat(groupRepositoryStub.findById("group1").get().getPerimeters().get(0)).isEqualTo("perimeter1");
        }

        @Test
        void GIVEN_A_Group_With_An_Invalid_Perimeter_WHEN_Create_Group_THEN_Return_BAD_REQUEST() {
            Set<String> perimeters = new HashSet<>();
            perimeters.add("perimeter1");
            perimeters.add("dummyPerimeter");
            GroupData group = new GroupData("groupId", "groupName", null, null, perimeters, null);
            OperationResult<EntityCreationReport<Group>> result = groupsService.createGroup(group);
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
            assertThat(result.getErrorMessage()).isEqualTo("Bad perimeter list : perimeter dummyPerimeter not found");
            assertThat(groupRepositoryStub.findById("groupId")).isEmpty();

        }

    }

    @Nested
    @DisplayName("Delete")
    class Delete {
        @Test
        void GIVEN_Group_Does_Not_Exist_WHEN_Deleting_Group_THEN_Return_NotFound() {
            OperationResult<String> result = groupsService.deleteGroup("dummyGroup");

            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
            assertThat(result.getErrorMessage()).isEqualTo("Group dummyGroup not found");
        }

        @Test
        void GIVEN_Admin_Group_WHEN_Deleting_Admin_Group_THEN_Return_BAD_REQUEST() {
            OperationResult<String> result = groupsService.deleteGroup("ADMIN");
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
            assertThat(result.getErrorMessage()).isEqualTo("Deleting group ADMIN is not allowed");
        }

        @Test
        void GIVEN_An_Existing_Group_WHEN_Deleting_Group_THEN_Sucess_And_Group_Is_Deleted() {
            OperationResult<String> result = groupsService.deleteGroup("group1");
            assertThat(result.isSuccess()).isTrue();
            assertThat(groupRepositoryStub.findById("group1")).isEmpty();
        }

        @Test
        void GIVEN_An_Existing_Group_WHEN_Deleting_Group_THEN_Success_And_Users_Are_Not_Members_Of_The_Group_Anymore(){
            OperationResult<String> result = groupsService.deleteGroup("group1");
            assertThat(result.isSuccess()).isTrue();
            assertThat(userRepositoryStub.findById("user1").get().getGroups()).doesNotContain("group1");
            assertThat(userRepositoryStub.findById("user2").get().getGroups()).doesNotContain("group1");
        }

    }

    @Nested
    @DisplayName("Users")
    class Users {

        @Nested
        @DisplayName("Add")
        class Add {
            @Test
            void GIVEN_Group_Does_Not_Exist_WHEN_Adding_User_THEN_Return_NotFound() {
                OperationResult<String> result = groupsService.addGroupUsers("dummyid", null);
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
                assertThat(result.getErrorMessage()).isEqualTo("Group dummyid not found");
            }

            @Test
            void GIVEN_Users_With_A_Not_Existing_One_WHEN_Adding_Them_To_Groups_THEN_Return_Bad_Request() {
                ArrayList<String> users = new ArrayList<>();
                users.add("user1");
                users.add("dummyUser");
                OperationResult<String> result = groupsService.addGroupUsers("group1", users);
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
                assertThat(result.getErrorMessage()).isEqualTo("Bad user list : user dummyUser not found");
            }

            @Test
            void GIVEN_Existing_Users_WHEN_Adding_Them_To_Group_THEN_Succeed_And_Users_Are_Updated() {

                groupRepositoryStub.insert(new GroupData(
                        "testGroup", "myname", null, null, null, null));

                ArrayList<String> users = new ArrayList<>();
                users.add("user1");
                users.add("user2");
                OperationResult<String> result = groupsService.addGroupUsers("testGroup", users);
                Optional<User> user1Updated = userRepositoryStub.findById("user1");
                Optional<User> user2Updated = userRepositoryStub.findById("user2");
                Optional<User> adminNotUpdated = userRepositoryStub.findById("admin");
                assertThat(result.isSuccess()).isTrue();
                assertThat(user1Updated.get().getGroups()).contains("testGroup");
                assertThat(user2Updated.get().getGroups()).contains("testGroup");
                assertThat(adminNotUpdated.get().getGroups()).isNotEmpty();
                assertThat(adminNotUpdated.get().getGroups()).doesNotContain("testGroup");

            }
        }

        @Nested
        @DisplayName("Update")
        class Update {
            @Test
            void GIVEN_Group_Does_Not_Exist_WHEN_Updating_User_List_THEN_Return_NotFound() {
                OperationResult<String> result = groupsService.updateGroupUsers("dummyid", null);
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
                assertThat(result.getErrorMessage()).isEqualTo("Group dummyid not found");
            }

            @Test
            void GIVEN_Existing_Group_WHEN_Updating_Users_With_A_Not_Existing_One_THEN_Return_Bad_Request() {
                ArrayList<String> users = new ArrayList<>();
                users.add("user1");
                users.add("dummyUser");
                OperationResult<String> result = groupsService.updateGroupUsers("group1", users);
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
                assertThat(result.getErrorMessage()).isEqualTo("Bad user list : user dummyUser not found");
            }

            @Test
            void GIVEN_Existing_Group_WHEN_Update_User_List_THEN_Succeed_And_Users_Are_Updated() {

                ArrayList<String> users = new ArrayList<>();
                users.add("user1");
                users.add("admin");
                OperationResult<String> result = groupsService.updateGroupUsers("group1", users);
                Optional<User> user1Updated = userRepositoryStub.findById("user1");
                Optional<User> user2Updated = userRepositoryStub.findById("user2");
                Optional<User> adminUpdated = userRepositoryStub.findById("admin");
                assertThat(result.isSuccess()).isTrue();
                assertThat(user1Updated.get().getGroups()).contains("group1");
                assertThat(user2Updated.get().getGroups()).isEmpty();
                assertThat(adminUpdated.get().getGroups()).contains("group1");
                assertThat(adminUpdated.get().getGroups()).contains("ADMIN");

            }

            @Test
            void GIVEN_Existing_Group_WHEN_Update_Empty_User_List_THEN_Succeed_And_Users_Are_Updated() {

                ArrayList<String> users = new ArrayList<>();
                OperationResult<String> result = groupsService.updateGroupUsers("group1", users);
                Optional<User> user1Updated = userRepositoryStub.findById("user1");
                Optional<User> user2Updated = userRepositoryStub.findById("user2");
                Optional<User> adminUpdated = userRepositoryStub.findById("admin");
                assertThat(result.isSuccess()).isTrue();
                assertThat(user1Updated.get().getGroups()).isEmpty();
                assertThat(user2Updated.get().getGroups()).isEmpty();
                assertThat(adminUpdated.get().getGroups()).doesNotContain("group1");
                assertThat(adminUpdated.get().getGroups()).contains("ADMIN");

            }
        }

        @Nested
        @DisplayName("Remove")
        class Remove {

            @Test
            void GIVEN_A_Not_Existing_Group_WHEN_Try_To_Remove_Users_THEN_Return_NOT_FOUND() {
                OperationResult<String> result = groupsService.deleteGroupUsers("dummyGroup");
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
                assertThat(result.getErrorMessage()).isEqualTo("Group dummyGroup not found");
            }

            @Test
            void GIVEN_A_Group_With_User_WHEN_Try_To_Remove_Users_THEN_Success_And_Users_Removed() {
                OperationResult<String> result = groupsService.deleteGroupUsers("group1");
                assertThat(result.isSuccess()).isTrue();
                assertThat(userRepositoryStub.findById("user1").get().getGroups()).isEmpty();
                assertThat(userRepositoryStub.findById("user2").get().getGroups()).isEmpty();
            }

            @Test
            void GIVEN_Admin_User_WHEN_Try_Removing_From_Admin_Group_THEN_Failed_And_Return_BAD_REQUEST() {
                OperationResult<String> result = groupsService.deleteGroupUser("admin", "admin");
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
                assertThat(result.getErrorMessage()).isEqualTo("Removing group ADMIN from user admin is not allowed");
                assertThat(userRepositoryStub.findById("admin").get().getGroups()).contains("ADMIN");
            }

            @Test
            void GIVEN_A_None_Existing_User_WHEN_Try_Removing_From_Group_THEN_Failed_And_Return_NOT_FOUND() {
                OperationResult<String> result = groupsService.deleteGroupUser("group1", "dummyUser");
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
                assertThat(result.getErrorMessage()).isEqualTo("User dummyUser not found");
            }

            @Test
            void GIVEN_A_User_WHEN_Try_Removing_From_Not_Existing_Group_THEN_Failed_And_Return_NOT_FOUND() {
                OperationResult<String> result = groupsService.deleteGroupUser("dummyGroup", "user1");
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
                assertThat(result.getErrorMessage()).isEqualTo("Group dummyGroup not found");
            }

            @Test
            void GIVEN_A_User_WHEN_Try_Removing_From_Group_THEN_Success_And_User_Removed_From_Group() {
                OperationResult<String> result = groupsService.deleteGroupUser("group1", "user1");
                assertThat(result.isSuccess()).isTrue();
                assertThat(userRepositoryStub.findById("user1").get().getGroups()).doesNotContain("group1");
            }
        }

    }

    @Nested
    @DisplayName("Perimeters")
    class Perimeters {
        @Nested
        @DisplayName("Fetch")
        class Fetch {
            @Test
            void GIVEN_A_Not_Existing_Group_WHEN_Fetch_Perimeter_THEN_Return_NOT_FOUND() {
                OperationResult<List<Perimeter>> result = groupsService.fetchGroupPerimeters("dummyGroup");
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
                assertThat(result.getErrorMessage()).isEqualTo("Group dummyGroup not found");
            }

            @Test
            void GIVEN_An_Existing_Group_With_No_Perimeter_WHEN_Fetch_Group_Perimeter_THEN_Return_Sucess_And_Empty_List() {
                OperationResult<List<Perimeter>> result = groupsService.fetchGroupPerimeters("ADMIN");
                assertThat(result.isSuccess()).isTrue();
                assertThat(result.getResult()).isEmpty();
            }

            @Test
            void GIVEN_A_Group_With_One_Perimeter_WHEN_Fetch_Group_Perimeters_THEN_Return_Success_And_Perimeter() {
                Set<String> perimeters = new HashSet<>();
                perimeters.add("perimeter1");
                GroupData group1 = new GroupData("group1", "groupName", null, null, perimeters, null);
                groupRepositoryStub.insert(group1);
                OperationResult<List<Perimeter>> result = groupsService.fetchGroupPerimeters("group1");
                assertThat(result.isSuccess()).isTrue();
                assertThat(result.getResult()).hasSize(1);
                assertThat(result.getResult().get(0).getId()).contains("perimeter1");
                assertThat(result.getResult().get(0).getProcess()).contains("processId");
            }

            @Test
            void GIVEN_A_Group_With_Two_Perimeter_WHEN_Fetch_Group_Perimeters_THEN_Return_Success_And_Perimeters() {
                Set<String> perimeters = new HashSet<>();
                perimeters.add("perimeter1");
                perimeters.add("perimeter2");
                GroupData group1 = new GroupData("group1", "groupName", null, null, perimeters, null);
                groupRepositoryStub.insert(group1);
                List<StateRight> states = new ArrayList<>();
                states.add(new StateRightData("perimeter", RightsEnum.RECEIVE, true));
                perimeterRepositoryStub.insert(new PerimeterData("perimeter2", "processId", states));
                OperationResult<List<Perimeter>> result = groupsService.fetchGroupPerimeters("group1");
                assertThat(result.isSuccess()).isTrue();
                assertThat(result.getResult()).hasSize(2);
            }
        }

        @Nested
        @DisplayName("Update")
        class Update {

            @Test
            void GIVEN_Perimeter_Does_Not_Exist_WHEN_Updating_Perimeters_THEN_Return_BAD_REQUEST() {
                ArrayList<String> perimeters = new ArrayList<>();
                perimeters.add("perimeter1");
                perimeters.add("dummyParimeter");
                OperationResult<String> result = groupsService.updateGroupPerimeters("group1", perimeters);
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
                assertThat(result.getErrorMessage()).isEqualTo("Bad perimeter list : perimeter dummyParimeter not found");
                
            }

            @Test
            void GIVEN_None_Existing_Group_WHEN_Updating_Perimeters_THEN_Return_NOT_FOUND() {
                OperationResult<String> result = groupsService.updateGroupPerimeters("dummyid", null);
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
                assertThat(result.getErrorMessage()).isEqualTo("Group dummyid not found");
            }

            @Test
            void GIVEN_Existing_Group_WHEN_Updating_Perimeter_List_THEN_Succeed_And_Perimeters_Are_Updated() {
                ArrayList<String> perimeters = new ArrayList<>();
                perimeters.add("perimeter1");
                perimeters.add("perimeter2");
                OperationResult<String> result = groupsService.updateGroupPerimeters("group1", perimeters);
                Optional<Group> groupUpdated = groupRepositoryStub.findById("group1");
                assertThat(result.isSuccess()).isTrue();
                assertThat(groupUpdated.get().getPerimeters()).contains("perimeter1");
                assertThat(groupUpdated.get().getPerimeters()).contains("perimeter2");
            }

            @Test
            void GIVEN_Existing_Group_WHEN_Updating_Perimeter_List_With_Empty_List_THEN_Succeed_And_Perimeter_List_Is_Empty() {
                ArrayList<String> perimeters = new ArrayList<>();
                OperationResult<String> result = groupsService.updateGroupPerimeters("group1", perimeters);
                Optional<Group> groupUpdated = groupRepositoryStub.findById("group1");
                assertThat(result.isSuccess()).isTrue();
                assertThat(groupUpdated.get().getPerimeters()).isEmpty();
            }
        }

        @Nested
        @DisplayName("Add")
        class Add {

            @Test
            void GIVEN_Perimeter_Does_Not_Exist_WHEN_Adding_Perimeters_THEN_Return_BAD_REQUEST() {
                ArrayList<String> perimeters = new ArrayList<>();
                perimeters.add("perimeter1");
                perimeters.add("dummyPerimeter");
                OperationResult<String> result = groupsService.addGroupPerimeters("group1", perimeters);
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
                assertThat(result.getErrorMessage()).isEqualTo("Bad perimeter list : perimeter dummyPerimeter not found");
            }

            @Test
            void GIVEN_Group_Does_Not_Exist_WHEN_Adding_Perimeters_THEN_Return_NOT_FOUND() {
                OperationResult<String> result = groupsService.addGroupPerimeters("dummyid", null);
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
                assertThat(result.getErrorMessage()).isEqualTo("Group dummyid not found");
            }

            @Test
            void GIVEN_Existing_Group_WHEN_Adding_One_Perimeter_THEN_Succeed_And_Perimeter_Is_Added() {
                ArrayList<String> perimetersToAdd = new ArrayList<>();
                perimetersToAdd.add("perimeter2");
                OperationResult<String> result = groupsService.addGroupPerimeters("group1", perimetersToAdd);
                Optional<Group> groupUpdated = groupRepositoryStub.findById("group1");
                assertThat(result.isSuccess()).isTrue();
                assertThat(groupUpdated.get().getPerimeters()).contains("perimeter1");
                assertThat(groupUpdated.get().getPerimeters()).contains("perimeter2");
            }

            @Test
            void GIVEN_Existing_Group_WHEN_Adding_Two_Perimeter_THEN_Succeed_And_Two_Perimeter_Are_Added() {
                ArrayList<String> perimetersToAdd = new ArrayList<>();
                perimetersToAdd.add("perimeter2");
                perimetersToAdd.add("perimeter3");
                OperationResult<String> result = groupsService.addGroupPerimeters("group1", perimetersToAdd);
                Optional<Group> groupUpdated = groupRepositoryStub.findById("group1");
                assertThat(result.isSuccess()).isTrue();
                assertThat(groupUpdated.get().getPerimeters()).contains("perimeter1");
                assertThat(groupUpdated.get().getPerimeters()).contains("perimeter2");
                assertThat(groupUpdated.get().getPerimeters()).contains("perimeter3");

            }

            @Test
            void GIVEN_Existing_Group_WHEN_Adding_Perimeter_List_With_Empty_List_THEN_Succeed_And_Perimeter_List_Is_Not_Modified() {
                ArrayList<String> perimetersToAdd = new ArrayList<>();
                OperationResult<String> result = groupsService.addGroupPerimeters("group1", perimetersToAdd);
                Optional<Group> groupUpdated = groupRepositoryStub.findById("group1");
                assertThat(result.isSuccess()).isTrue();
                assertThat(groupUpdated.get().getPerimeters()).hasSize(1);
                assertThat(groupUpdated.get().getPerimeters().get(0)).isEqualTo("perimeter1");
            }
        }
    }

}
