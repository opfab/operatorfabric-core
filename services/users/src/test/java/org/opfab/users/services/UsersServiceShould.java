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
import java.util.HashSet;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.opfab.users.model.EntityCreationReport;
import org.opfab.users.model.GroupData;
import org.opfab.users.model.OperationResult;
import org.opfab.users.model.Perimeter;
import org.opfab.users.model.PerimeterData;
import org.opfab.users.model.RightsEnum;
import org.opfab.users.model.StateRightData;
import org.opfab.users.model.User;
import org.opfab.users.model.UserData;
import org.opfab.users.stubs.EventBusStub;
import org.opfab.users.stubs.GroupRepositoryStub;
import org.opfab.users.stubs.PerimeterRepositoryStub;
import org.opfab.users.stubs.UserRepositoryStub;

@DisplayName("UsersService")
public class UsersServiceShould {

    private UserRepositoryStub userRepositoryStub = new UserRepositoryStub();
    private PerimeterRepositoryStub perimeterRepositoryStub = new PerimeterRepositoryStub();
    private GroupRepositoryStub groupRepositoryStub = new GroupRepositoryStub();
    private UsersService usersService;

    PerimeterData perimeter1, perimeter2;

    @BeforeEach
    void clear() {
        usersService = new UsersService(userRepositoryStub,groupRepositoryStub,perimeterRepositoryStub,
                new NotificationService(userRepositoryStub, new EventBusStub()));
        initPerimeterRepository();
        initGroupRepository();
        initUserRepository();
    }


    private void initPerimeterRepository() {
        
      
        perimeter1 = PerimeterData.builder()
                .id("perimeter1")
                .process("process1")
                .stateRights(new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.RECEIVE, true),
                                                         new StateRightData("state2", RightsEnum.RECEIVEANDWRITE, true))))
                .build();

        perimeter2 = PerimeterData.builder()
                .id("perimeter2")
                .process("process1")
                .stateRights(new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.RECEIVEANDWRITE, true),
                                                         new StateRightData("state2", RightsEnum.WRITE, true))))
                .build();


        perimeterRepositoryStub.insert(perimeter1);
        perimeterRepositoryStub.insert(perimeter2);

    }

    private void initGroupRepository() {
        GroupData g1, g2, g3;
        g1 = GroupData.builder()
                .id("group1")
                .name("Group 1")
                .description("Group 1 description")
                .build();
        List<String> p1 = new ArrayList<>(Arrays.asList("perimeter1", "perimeter2"));
        g1.setPerimeters(p1);
        g2 = GroupData.builder()
                .id("group2")
                .name("Group 2")
                .description("Group 2 description")
                .build();
        List<String> p2 = new ArrayList<>(Arrays.asList("perimeter1"));
        g2.setPerimeters(p2);
        groupRepositoryStub.insert(g1);
        groupRepositoryStub.insert(g2);

    }


    private void initUserRepository() {
        userRepositoryStub.deleteAll();
        UserData u1, u2, u3;

        u1 = UserData.builder()
                .login("user1")
                .firstName("user1FirstName")
                .lastName("user1LastName")
                .group("group1").group("group2")
                .build();
        u2 = UserData.builder()
                .login("user2")
                .firstName("user2FirstName")
                .lastName("user2LastName")
                .group("group2")
                .entity("entity1").entity("entity2")
                .build();
        u3 = UserData.builder()
                .login("user3")
                .firstName("user3FirstName")
                .lastName("user3LastName")
                .entity("entity1")
                .build();
        userRepositoryStub.insert(u1);
        userRepositoryStub.insert(u2);
        userRepositoryStub.insert(u3);
    }
    @Nested
    @DisplayName("Fetch")
    class Fetch {
        @Test
        void GIVEN_Users_In_Repository_WHEN_Fetch_Users_THEN_Return_All_Users() {
            List<User> users = usersService.fetchUsers();
            assertThat(users).hasSize(3);
        }

        @Test
        void GIVEN_Not_Existing_User_In_Repository_WHEN_Fetch_User_THEN_Return_NOT_FOUND() {
            OperationResult<User> group = usersService.fetchUser("dummy");
            assertThat(group.isSuccess()).isFalse();
            assertThat(group.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
        }

        @Test
        void GIVEN_Existing_User_In_Repository_WHEN_Fetch_User_THEN_Success_And_Return_User() {
            OperationResult<User> user = usersService.fetchUser("user1");
            assertThat(user.isSuccess()).isTrue();
            assertThat(user.getResult().getLogin()).isEqualTo("user1");
            assertThat(user.getResult().getFirstName()).isEqualTo("user1FirstName");
            assertThat(user.getResult().getLastName()).isEqualTo("user1LastName");

        }

    }

    @Nested
    @DisplayName("Create")
    class Create {
        @Test
        void GIVEN_An_Invalid_Login__WHEN_Creating_User_THEN_Return_Bad_Request() {
            UserData user = new UserData("invalid?login", "invalid", null, null, null, null, null);
            OperationResult<EntityCreationReport<User>> result = usersService.createUser(user);
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
        }

        @Test
        void GIVEN_A_Valid_User_WHEN_Create_User_THEN_Return_Created_User() {

            UserData user = UserData.builder()
                    .login("newuser")
                    .firstName("firstName")
                    .lastName("user1LastName")
                    .group("group1").group("group2")
                    .build();
            OperationResult<EntityCreationReport<User>> result = usersService.createUser(user);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().isUpdate()).isFalse();
            assertThat(result.getResult().getEntity().getLogin()).isEqualTo("newuser");
            assertThat(result.getResult().getEntity().getFirstName()).isEqualTo("firstName");
            assertThat(userRepositoryStub.findById("newuser").get().getLogin()).isEqualTo("newuser");
            assertThat(userRepositoryStub.findById("newuser").get().getFirstName()).isEqualTo("firstName");
        }

        @Test
        void GIVEN_A_Valid_User_With_Login_In_UpperCase_WHEN_Create_User_THEN_Login_Is_Saved_In_LowerCase() {

            UserData user = UserData.builder()
                    .login("newUser")
                    .firstName("firstName")
                    .lastName("user1LastName")
                    .group("group1").group("group2")
                    .build();
            OperationResult<EntityCreationReport<User>> result = usersService.createUser(user);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().isUpdate()).isFalse();
            assertThat(result.getResult().getEntity().getLogin()).isEqualTo("newuser");
            assertThat(userRepositoryStub.findById("newuser").get().getLogin()).isEqualTo("newuser");
        }

        @Test
        void GIVEN_A_Valid_User_WHEN_Create_An_Already_Existing_User_THEN_User_Is_Updated() {
            UserData user = UserData.builder()
                    .login("user1")
                    .firstName("newFirstName")
                    .lastName("user1LastName")
                    .group("group1")
                    .build();
            OperationResult<EntityCreationReport<User>> result = usersService.createUser(user);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().isUpdate()).isTrue();
            assertThat(result.getResult().getEntity().getLogin()).isEqualTo("user1");
            assertThat(result.getResult().getEntity().getFirstName()).isEqualTo("newFirstName");
            assertThat(result.getResult().getEntity().getGroups()).containsExactly("group1");
            assertThat(userRepositoryStub.findById("user1").get().getFirstName()).isEqualTo("newFirstName");
            assertThat(userRepositoryStub.findById("user1").get().getGroups()).containsExactly("group1");
        }

        @Test
        void GIVEN_The_Admin_User_WHEN_Update_User_Without_Admin_Group_THEN_Return_Bad_Request() {

            UserData user = UserData.builder()
                    .login("admin")
                    .firstName("firstName")
                    .lastName("user1LastName")
                    .group("group1").group("group2")
                    .build();
            OperationResult<EntityCreationReport<User>> result = usersService.createUser(user);
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
        }

        @Test
        void GIVEN_The_Admin_User_WHEN_Update_User_With_Admin_Group_THEN_Return_Success() {

            UserData user = UserData.builder()
                    .login("admin")
                    .firstName("firstName")
                    .lastName("user1LastName")
                    .group("group1").group("ADMIN")
                    .build();
            OperationResult<EntityCreationReport<User>> result = usersService.createUser(user);
            assertThat(result.isSuccess()).isTrue();
            assertThat(userRepositoryStub.findById("admin").get().getFirstName()).isEqualTo("firstName");
        }

    }

    @Nested
    @DisplayName("Delete")
    class Delete {
        @Test
        void GIVEN_User_Does_Not_Exist_WHEN_Deleting_User_THEN_Return_NotFound() {
            OperationResult<String> result = usersService.deleteUser("dummyUser");

            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
        }

        @Test
        void GIVEN_Admin_User_WHEN_Deleting_Admin_User_THEN_Return_BAD_REQUEST() {
            OperationResult<String> result = usersService.deleteUser("admin");
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
        }

        @Test
        void GIVEN_An_Existing_User_WHEN_Deleting_User_THEN_Sucess_And_User_Is_Deleted() {
            OperationResult<String> result = usersService.deleteUser("user1");
            assertThat(result.isSuccess()).isTrue();
            assertThat(userRepositoryStub.findById("user1")).isEmpty();
        }
    }

    @Nested
    @DisplayName("Perimeters")
    class Perimeters {
        @Nested
        @DisplayName("Fetch")
        class Fetch {
            @Test
            void GIVEN_A_Not_Existing_User_WHEN_Fetch_Perimeters_THEN_Return_NOT_FOUND() {
                OperationResult<List<Perimeter>> result = usersService.fetchUserPerimeters("dummyUser");
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
            }

            @Test
            void GIVEN_User1_WHEN_Fetch_Perimeter_THEN_Return_Merge_Perimeter1_And_Perimeter2() {
                OperationResult<List<Perimeter>> result = usersService.fetchUserPerimeters("user1");
                assertThat(result.isSuccess()).isTrue();
                assertThat(result.getResult()).containsExactlyInAnyOrder(perimeter1,perimeter2);
            }

            @Test
            void GIVEN_User2_WHEN_Fetch_Perimeter_THEN_Return_Perimeter1() {
                OperationResult<List<Perimeter>> result = usersService.fetchUserPerimeters("user2");
                assertThat(result.isSuccess()).isTrue();
                assertThat(result.getResult()).containsExactlyInAnyOrder(perimeter1);
            }

            @Test
            void GIVEN_User_With_No_Groups_WHEN_Fetch_Perimeter_THEN_Return_Empty_List() {
                OperationResult<List<Perimeter>> result = usersService.fetchUserPerimeters("user3");
                assertThat(result.isSuccess()).isTrue();
                assertThat(result.getResult()).isEmpty();
            }
        }
    }
}
