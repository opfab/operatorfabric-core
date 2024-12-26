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
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.opfab.test.EventBusSpy;
import org.opfab.users.model.EntityCreationReport;
import org.opfab.users.model.Entity;
import org.opfab.users.model.Group;
import org.opfab.users.model.OperationResult;
import org.opfab.users.model.Perimeter;
import org.opfab.users.model.RightEnum;
import org.opfab.users.model.StateRight;
import org.opfab.users.model.User;
import org.opfab.users.stubs.EntityRepositoryStub;
import org.opfab.users.stubs.GroupRepositoryStub;
import org.opfab.users.stubs.PerimeterRepositoryStub;
import org.opfab.users.stubs.UserRepositoryStub;

@DisplayName("UsersService")
public class UsersServiceShould {

    private UserRepositoryStub userRepositoryStub = new UserRepositoryStub();
    private PerimeterRepositoryStub perimeterRepositoryStub = new PerimeterRepositoryStub();
    private GroupRepositoryStub groupRepositoryStub = new GroupRepositoryStub();
    private EntityRepositoryStub entityRepositoryStub = new EntityRepositoryStub();
    private UsersService usersService;
    private EventBusSpy eventBusSpy;

    Perimeter perimeter1, perimeter2;

    @BeforeEach
    void clear() {
        eventBusSpy =  new EventBusSpy();
        usersService = new UsersService(userRepositoryStub, groupRepositoryStub, entityRepositoryStub,
                perimeterRepositoryStub, new NotificationService(userRepositoryStub,eventBusSpy ));
        initPerimeterRepository();
        initGroupRepository();
        initEntityRepository();
        initUserRepository();
    }

    private void initPerimeterRepository() {

        perimeter1 = new Perimeter();
        perimeter1.setId("perimeter1");
        perimeter1.setProcess("process1");
        StateRight state1 = new StateRight("state1", RightEnum.Receive, true);
        StateRight state2 = new StateRight("state2", RightEnum.ReceiveAndWrite, true);
        List<StateRight> stateRights = new ArrayList<>();
        stateRights.add(state1);
        stateRights.add(state2);
        perimeter1.setStateRights(stateRights);



        perimeter2 = new Perimeter();
        perimeter2.setId("perimeter2");
        perimeter2.setProcess("process1");
        StateRight state3 = new StateRight("state1", RightEnum.ReceiveAndWrite, true);
        StateRight state4 = new StateRight("state2", RightEnum.ReceiveAndWrite, true);
        List<StateRight> stateRights2 = new ArrayList<>();
        stateRights2.add(state3);
        stateRights2.add(state4);
        perimeter2.setStateRights(stateRights2);

        
        perimeterRepositoryStub.insert(perimeter1);
        perimeterRepositoryStub.insert(perimeter2);

    }

    private void initGroupRepository() {
        Group g1, g2;
        g1 = new Group("group1");
        g1.setName("Group 1");
        g1.setDescription("Group 1 description");
        List<String> p1 = new ArrayList<>(Arrays.asList("perimeter1", "perimeter2"));
        g1.setPerimeters(p1);

        g2 = new Group("group2");
        g2.setName("Group 2");
        g2.setDescription("Group 2 description");
        List<String> p2 = new ArrayList<>(Arrays.asList("perimeter1"));
        g2.setPerimeters(p2);

        groupRepositoryStub.insert(g1);
        groupRepositoryStub.insert(g2);

    }

    private void initEntityRepository() {
        Entity e1, e2;
        e1 = new Entity();
        e1.setId("entity1");
        e1.setName("Entity 1");
        e2 = new Entity();
        e2.setId("entity2");
        e2.setName("Entity 2");
        entityRepositoryStub.insert(e1);
        entityRepositoryStub.insert(e2);

    }

    private void initUserRepository() {
        userRepositoryStub.deleteAll();
        User u1, u2, u3;

        u1 = new User();
        u1.setLogin("user1");
        u1.setFirstName("user1FirstName");
        u1.setLastName("user1LastName");
        u1.setComment("comment");
        u1.addGroup("group1");
        u1.addGroup("group2");
        
        u2 = new User();
        u2.setLogin("user2");
        u2.setFirstName("user2FirstName");
        u2.setLastName("user2LastName");
        u2.addGroup("group2");
        u2.addEntity("entity1");
        u2.addEntity("entity2");
            
        u3 = new User();
        u3.setLogin("user3");
        u3.setFirstName("user3FirstName");
        u3.setLastName("user3LastName");
        u3.addEntity("entity1");

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
            assertThat(group.getErrorMessage()).isEqualTo("User dummy not found");
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
        void GIVEN_A_Valid_User_WHEN_Create_User_THEN_Return_Created_User() {

            User user = new User();
            user.setLogin("newuser");
            user.setFirstName("firstName");
            user.setLastName("user1LastName");
            user.addGroup("group1");
            user.addGroup("group2");

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

            User user = new User();
            user.setLogin("newUser");
            user.setFirstName("firstName");
            user.setLastName("user1LastName");
            user.addGroup("group1");
            user.addGroup("group2");

            OperationResult<EntityCreationReport<User>> result = usersService.createUser(user);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().isUpdate()).isFalse();
            assertThat(result.getResult().getEntity().getLogin()).isEqualTo("newuser");
            assertThat(userRepositoryStub.findById("newuser").get().getLogin()).isEqualTo("newuser");
        }

        @Test
        void GIVEN_A_Valid_User_WHEN_Create_An_Already_Existing_User_THEN_User_Is_Updated() {
            User user = new User();
            user.setLogin("user1");
            user.setFirstName("newFirstName");
            user.setLastName("user1LastName");
            user.addGroup("group1");

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

            User user = new User();
            user.setLogin("admin");
            user.setFirstName("firstName");
            user.setLastName("user1LastName");
            user.addGroup("group1");
            user.addGroup("group2");
            
            OperationResult<EntityCreationReport<User>> result = usersService.createUser(user);
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
            assertThat(result.getErrorMessage()).isEqualTo("Removing group ADMIN from user admin is not allowed");
        }

        @Test
        void GIVEN_The_Admin_User_WHEN_Update_User_With_Admin_Group_THEN_Return_Success() {

            User user = new User();
            user.setLogin("admin");
            user.setFirstName("firstName");
            user.setLastName("user1LastName");
            user.addGroup("group1");
            user.addGroup("ADMIN");

            
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
            assertThat(result.getErrorMessage()).isEqualTo("User dummyUser not found");
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
                assertThat(result.getErrorMessage()).isEqualTo("User dummyUser not found");
            }

            @Test
            void GIVEN_User1_WHEN_Fetch_Perimeter_THEN_Return_Merge_Perimeter1_And_Perimeter2() {
                OperationResult<List<Perimeter>> result = usersService.fetchUserPerimeters("user1");
                assertThat(result.isSuccess()).isTrue();
                assertThat(result.getResult()).containsExactlyInAnyOrder(perimeter1, perimeter2);
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

    @Nested
    @DisplayName("UpdateOrCreate")
    class Update {
        @Test
        void GIVEN_The_Admin_User_WHEN_UpdateOrCreate_User_Without_Admin_Group_THEN_Return_Bad_Request() {

            User user = new User();
            user.setLogin("admin");
            user.setFirstName("firstName");
            user.setLastName("user1LastName");
            user.addGroup("group1");
            user.addGroup("group2");
            
            OperationResult<EntityCreationReport<User>> result = usersService.createUser(user);
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
            assertThat(result.getErrorMessage()).isEqualTo("Removing group ADMIN from user admin is not allowed");
        }

        @Test
        void GIVEN_A_None_Existing_User_WHEN_UpdateOrCreate_With_UpdateGroup_And_Entities_true_THEN_User_Is_Created() {

            User user = new User();
            user.setLogin("newuser");
            user.setFirstName("firstName");
            user.setLastName("user1LastName");
            user.addGroup("group1");
            user.addGroup("group2");
            user.addEntity("entity1");
            user.addEntity("entity2");

            
            OperationResult<User> result = usersService.updateOrCreateUser(user, true, true);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().getLogin()).isEqualTo("newuser");
            assertThat(result.getResult().getFirstName()).isEqualTo("firstName");
            assertThat(userRepositoryStub.findById("newuser").get().getLogin()).isEqualTo("newuser");
            assertThat(userRepositoryStub.findById("newuser").get().getFirstName()).isEqualTo("firstName");
            assertThat(userRepositoryStub.findById("newuser").get().getGroups()).containsExactlyInAnyOrder("group1",
                    "group2");
            assertThat(userRepositoryStub.findById("newuser").get().getEntities()).containsExactlyInAnyOrder("entity1",
                    "entity2");
        }

        @Test
        void GIVEN_A_None_Existing_User_WHEN_UpdateOrCreate_With_UpdateGroup_True_And_UpdateEntities_False_THEN_User_Is_Created_With_No_Entities() {

            User user = new User();
            user.setLogin("newuser");
            user.setFirstName("firstName");
            user.setLastName("user1LastName");
            user.addGroup("group1");
            user.addGroup("group2");
            user.addEntity("entity1");
            user.addEntity("entity2");


            OperationResult<User> result = usersService.updateOrCreateUser(user, false, true);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().getLogin()).isEqualTo("newuser");
            assertThat(result.getResult().getFirstName()).isEqualTo("firstName");
            assertThat(userRepositoryStub.findById("newuser").get().getLogin()).isEqualTo("newuser");
            assertThat(userRepositoryStub.findById("newuser").get().getFirstName()).isEqualTo("firstName");
            assertThat(userRepositoryStub.findById("newuser").get().getGroups()).containsExactlyInAnyOrder("group1",
                    "group2");
            assertThat(userRepositoryStub.findById("newuser").get().getEntities()).isEmpty();
        }

        @Test
        void GIVEN_A_None_Existing_User_WHEN_UpdateOrCreate_With_UpdateGroup_False_And_UpdateEntities_True_THEN_User_Is_Created_With_No_Groups() {

            User user = new User();
            user.setLogin("newuser");
            user.setFirstName("firstName");
            user.setLastName("user1LastName");
            user.addGroup("group1");
            user.addGroup("group2");
            user.addEntity("entity1");
            user.addEntity("entity2");
            
            OperationResult<User> result = usersService.updateOrCreateUser(user, true, false);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().getLogin()).isEqualTo("newuser");
            assertThat(result.getResult().getFirstName()).isEqualTo("firstName");
            assertThat(userRepositoryStub.findById("newuser").get().getLogin()).isEqualTo("newuser");
            assertThat(userRepositoryStub.findById("newuser").get().getFirstName()).isEqualTo("firstName");
            assertThat(userRepositoryStub.findById("newuser").get().getGroups()).isEmpty();
            assertThat(userRepositoryStub.findById("newuser").get().getEntities()).containsExactlyInAnyOrder("entity1",
                    "entity2");
        }

        @Test
        void GIVEN_A_None_Existing_User_WHEN_UpdateOrCreate_With_Invalid_Groups_THEN_User_Is_Created_Without_The_Invalid_Groups() {

            User user = new User();
            user.setLogin("newuser");
            user.setFirstName("firstName");
            user.setLastName("user1LastName");
            user.addGroup("group1");
            user.addGroup("group2");
            user.addGroup("invalid1");
            user.addGroup("invalid2");
            user.addEntity("entity1");
            user.addEntity("entity2");

            
            OperationResult<User> result = usersService.updateOrCreateUser(user, true, true);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().getLogin()).isEqualTo("newuser");
            assertThat(result.getResult().getFirstName()).isEqualTo("firstName");
            assertThat(userRepositoryStub.findById("newuser").get().getLogin()).isEqualTo("newuser");
            assertThat(userRepositoryStub.findById("newuser").get().getFirstName()).isEqualTo("firstName");
            assertThat(userRepositoryStub.findById("newuser").get().getGroups()).containsExactlyInAnyOrder("group1",
                    "group2");
            assertThat(userRepositoryStub.findById("newuser").get().getEntities()).containsExactlyInAnyOrder("entity1",
                    "entity2");
        }

        @Test
        void GIVEN_A_None_Existing_User_WHEN_UpdateOrCreate_With_Invalid_Entities_THEN_User_Is_Created_Without_The_Invalid_Entities() {

            User user = new User();
            user.setLogin("newuser");
            user.setFirstName("firstName");
            user.setLastName("user1LastName");
            user.addGroup("group1");
            user.addGroup("group2");
            user.addEntity("entity1");
            user.addEntity("entity2");
            user.addEntity("dummy1");
            user.addEntity("dummy2");

            OperationResult<User> result = usersService.updateOrCreateUser(user, true, true);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().getLogin()).isEqualTo("newuser");
            assertThat(result.getResult().getFirstName()).isEqualTo("firstName");
            assertThat(userRepositoryStub.findById("newuser").get().getLogin()).isEqualTo("newuser");
            assertThat(userRepositoryStub.findById("newuser").get().getFirstName()).isEqualTo("firstName");
            assertThat(userRepositoryStub.findById("newuser").get().getGroups()).containsExactlyInAnyOrder("group1",
                    "group2");
            assertThat(userRepositoryStub.findById("newuser").get().getEntities()).containsExactlyInAnyOrder("entity1",
                    "entity2");
        }

        @Test
        void GIVEN_An_Existing_User_WHEN_UpdateOrCreate_With_UpdateGroup_And_Entities_true_THEN_User_Is_Updated() {

            User user = new User();
            user.setLogin("user3");
            user.setFirstName("newFirstName");
            user.setLastName("newLastName");
            user.addGroup("group1");
            user.addGroup("group2");
            user.addEntity("entity1");
            user.addEntity("entity2");
            
            OperationResult<User> result = usersService.updateOrCreateUser(user, true, true);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().getLogin()).isEqualTo("user3");
            assertThat(result.getResult().getFirstName()).isEqualTo("newFirstName");
            assertThat(userRepositoryStub.findById("user3").get().getLogin()).isEqualTo("user3");
            assertThat(userRepositoryStub.findById("user3").get().getFirstName()).isEqualTo("newFirstName");
            assertThat(userRepositoryStub.findById("user3").get().getGroups()).containsExactlyInAnyOrder("group1",
                    "group2");
            assertThat(userRepositoryStub.findById("user3").get().getEntities()).containsExactlyInAnyOrder("entity1",
                    "entity2");
        }


        @Test
        void GIVEN_An_Existing_User_WHEN_UpdateOrCreate_THEN_User_Is_Updated_And_Notification_Is_Sent_To_Other_Services() {

            User user = new User();
            user.setLogin("user3");
            user.setFirstName("newFirstName");
            user.setLastName("newLastName");
            user.addGroup("group1");
            user.addGroup("group2");
            user.addEntity("entity1");
            user.addEntity("entity2");
            
            OperationResult<User> result = usersService.updateOrCreateUser(user, true, true);
            assertThat(result.isSuccess()).isTrue();
            assertThat(userRepositoryStub.findById("user3").get().getFirstName()).isEqualTo("newFirstName");
            
            String[] expectedMessageSent = {"user","user3"};
            assertThat(eventBusSpy.getMessagesSent()).containsOnly(expectedMessageSent);
        }


        @Test
        void GIVEN_An_Existing_User_WHEN_UpdateOrCreate_With_Same_Value_THEN_Notification_Is_Not_Sent_To_Other_Services() {

            User user2Clone = new User();
            user2Clone.setLogin("user2");
            user2Clone.setFirstName("user2FirstName");
            user2Clone.setLastName("user2LastName");
            user2Clone.addGroup("group2");
            user2Clone.addEntity("entity1");
            user2Clone.addEntity("entity2");

            OperationResult<User> result = usersService.updateOrCreateUser(user2Clone, true, true);
            assertThat(result.isSuccess()).isTrue();
            assertThat(eventBusSpy.getMessagesSent()).isEmpty();
        }

        @Test
        void GIVEN_An_Existing_User_WHEN_UpdateOrCreate_With_UpdateGroup_True_And_UpdateEntities_False_THEN_User_Is_Update_Without_Entities_Update() {

            User user = new User();
            user.setLogin("user3");
            user.setFirstName("newFirstName");
            user.setLastName("user1LastName");
            user.addGroup("group1");
            user.addGroup("group2");
            user.addEntity("entity1");
            user.addEntity("entity2");

            OperationResult<User> result = usersService.updateOrCreateUser(user, false, true);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().getLogin()).isEqualTo("user3");
            assertThat(result.getResult().getFirstName()).isEqualTo("newFirstName");
            assertThat(userRepositoryStub.findById("user3").get().getLogin()).isEqualTo("user3");
            assertThat(userRepositoryStub.findById("user3").get().getFirstName()).isEqualTo("newFirstName");
            assertThat(userRepositoryStub.findById("user3").get().getGroups()).containsExactlyInAnyOrder("group1",
                    "group2");
            assertThat(userRepositoryStub.findById("user3").get().getEntities()).containsExactlyInAnyOrder("entity1");
        }

        @Test
        void GIVEN_An_Existing_User_WHEN_UpdateOrCreate_With_UpdateGroup_False_And_UpdateEntities_True_THEN_User_Is_Update_Without_Groups_Update() {

            User user = new User();
            user.setLogin("user2");
            user.setFirstName("newFirstName");
            user.setLastName("user1LastName");
            user.addGroup("group1");
            user.addGroup("group2");
            user.addEntity("entity1");
            
            OperationResult<User> result = usersService.updateOrCreateUser(user, true, false);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().getLogin()).isEqualTo("user2");
            assertThat(result.getResult().getFirstName()).isEqualTo("newFirstName");
            assertThat(userRepositoryStub.findById("user2").get().getLogin()).isEqualTo("user2");
            assertThat(userRepositoryStub.findById("user2").get().getFirstName()).isEqualTo("newFirstName");
            assertThat(userRepositoryStub.findById("user2").get().getGroups()).containsExactlyInAnyOrder(
                    "group2");
            assertThat(userRepositoryStub.findById("user2").get().getEntities()).containsExactlyInAnyOrder("entity1");
        }

    }

}
