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
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.opfab.users.model.Entity;
import org.opfab.users.model.EntityCreationReport;
import org.opfab.users.model.EntityData;
import org.opfab.users.model.OperationResult;
import org.opfab.users.model.User;
import org.opfab.users.model.UserData;
import org.opfab.users.stubs.EntityRepositoryStub;
import org.opfab.users.stubs.EventBusStub;
import org.opfab.users.stubs.UserRepositoryStub;

@DisplayName("EntitiesService")
class EntitiesServiceShould {

    private EntityRepositoryStub entityRepositoryStub = new EntityRepositoryStub();
    private UserRepositoryStub userRepositoryStub = new UserRepositoryStub();
    private NotificationService notificationService = new NotificationService(userRepositoryStub,new EventBusStub());
    private EntitiesService entitiesService;

    @BeforeEach
    void clear() {
        entityRepositoryStub.deleteAll();
        entitiesService = new EntitiesService(entityRepositoryStub,userRepositoryStub, notificationService);
        EntityData entity1 = new EntityData("entity1", "Entity 1", "Entity 1 Desc", null, null, null);
        entityRepositoryStub.save(entity1);
        EntityData entity2 = new EntityData("entity2", "Entity 2", null, null, null, null);
        entityRepositoryStub.save(entity2);

        Set<String> parent = new HashSet<>(Arrays.asList("entity1","entity2"));
        EntityData child1 = new EntityData("child1", "Entity child", null, null, null, parent);
        entityRepositoryStub.save(child1);
        Set<String> parent2 = new HashSet<>(Arrays.asList("entity1"));
        EntityData child2 = new EntityData("child2", "Entity child 2", null, null, null, parent2);
        entityRepositoryStub.save(child2);

        Set<String> entitiesForUser1 = new HashSet<>(Arrays.asList("entity1","entity2"));
        Set<String> entitiesForUser2 = new HashSet<>(Arrays.asList("entity2"));
        userRepositoryStub.insert(new UserData("user1", "test", null, entitiesForUser1,null, null, null));
        userRepositoryStub.insert(new UserData("user2", "test", null, entitiesForUser2,null, null, null));
        userRepositoryStub.insert(new UserData("user3", "test", null, null,null, null, null));

    }

    @Nested
    @DisplayName("Fetch")
    class Fetch {
        @Test
        void GIVEN_Entities_In_Repository_WHEN_Fetch_Entities_THEN_Return_All_Entities() {
            List<Entity> groups = entitiesService.fetchEntities();
            assertThat(groups).hasSize(4);
        }
 
        @Test
        void GIVEN_Not_Existing_Entity_In_Repository_WHEN_Fetch_Entity_THEN_Return_NOT_FOUND() {
            OperationResult<Entity> entity = entitiesService.fetchEntity("dummyEntity");
            assertThat(entity.isSuccess()).isFalse();
            assertThat(entity.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
        }

        @Test
        void GIVEN_Existing_Entity_In_Repository_WHEN_Fetch_Entity_THEN_Success_And_Return_Entity() {
            OperationResult<Entity> entity = entitiesService.fetchEntity("entity1");
            assertThat(entity.isSuccess()).isTrue();
            assertThat(entity.getResult().getId()).isEqualTo("entity1");
            assertThat(entity.getResult().getName()).isEqualTo("Entity 1");
            assertThat(entity.getResult().getDescription()).isEqualTo("Entity 1 Desc");
        }
    }

    @Nested
    @DisplayName("Create")
    class Create {
        @Test
        void GIVEN_An_Invalid_EntityId__WHEN_Creating_Entity_THEN_Return_Bad_Request() {
            EntityData entity = new EntityData("invalid id", "invalid id", null, null, null, null);
            OperationResult<EntityCreationReport<Entity>> result = entitiesService.createEntity(entity);
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
        }

        @Test
        void GIVEN_A_Valid_Entity_WHEN_Create_Entity_THEN_Return_Created_Entity() {
            EntityData entity = new EntityData("newEntity", "name", "myDescription", null, true, null);
            OperationResult<EntityCreationReport<Entity>> result = entitiesService.createEntity(entity);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().isUpdate()).isFalse();
            assertThat(result.getResult().getEntity().getId()).isEqualTo("newEntity");
            assertThat(result.getResult().getEntity().getName()).isEqualTo("name");
            assertThat(entityRepositoryStub.findById("newEntity").get().getName()).isEqualTo("name");
        }

        @Test
        void GIVEN_A_Valid_Entity_WHEN_Create_An_Already_Existing_Entity_THEN_Entity_Is_Updated() {
            EntityData entity = new EntityData("entity1", "newEntityName", null, null, true, null);
            OperationResult<EntityCreationReport<Entity>> result = entitiesService.createEntity(entity);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().isUpdate()).isTrue();
            assertThat(result.getResult().getEntity().getId()).isEqualTo("entity1");
            assertThat(result.getResult().getEntity().getName()).isEqualTo("newEntityName");
            assertThat(entityRepositoryStub.findById("entity1").get().getName()).isEqualTo("newEntityName");
        }

        @Test
        void GIVEN_A_Entity_With_Entity_Cycle_WHEN_Create_Entity_THEN_Return_BAD_REQUEST() {

           
            Set<String> childAsParent = new HashSet<>(Arrays.asList("child1"));
            EntityData group = new EntityData("entity1", "groupName", null, null, null, childAsParent);
            OperationResult<EntityCreationReport<Entity>> result = entitiesService.createEntity(group);
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
            assertThat(entityRepositoryStub.findById("entity1").get().getParents()).isEmpty();

        }

    }
 
    @Nested
    @DisplayName("Delete")
    class Delete {
        @Test
        void GIVEN_Entity_Does_Not_Exist_WHEN_Deleting_Entity_THEN_Return_NotFound() {
            OperationResult<String> result = entitiesService.deleteEntity("dummyEntity");

            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
        }

        @Test
        void GIVEN_An_Existing_Entity_WHEN_Deleting_Entity_THEN_Sucess_And_Entity_Is_Deleted() {
            OperationResult<String> result = entitiesService.deleteEntity("entity1");
            assertThat(result.isSuccess()).isTrue();
            assertThat(entityRepositoryStub.findById("entity1")).isEmpty();
        }

        @Test
        void GIVEN_An_Existing_Entity_WHEN_Deleting_Entity_THEN_Success_And_Users_Are_Not_Members_Of_The_Entity_Anymore(){
            OperationResult<String> result = entitiesService.deleteEntity("entity1");
            assertThat(result.isSuccess()).isTrue();
            assertThat(userRepositoryStub.findById("user1").get().getEntities()).doesNotContain("entity1");
            assertThat(userRepositoryStub.findById("user1").get().getEntities()).contains("entity2");
            assertThat(userRepositoryStub.findById("user2").get().getEntities()).doesNotContain("entity1");
        }


        @Test
        void GIVEN_An_Existing_Entity_WHEN_Deleting_Entity_THEN_Success_And_Child_Entities_Are_Not_Linked_The_Entity_Anymore(){
            OperationResult<String> result = entitiesService.deleteEntity("entity1");
            assertThat(result.isSuccess()).isTrue();
            assertThat(entityRepositoryStub.findById("child1").get().getParents()).doesNotContain("entity1");
            assertThat(entityRepositoryStub.findById("child1").get().getParents()).contains("entity2");
            assertThat(entityRepositoryStub.findById("child2").get().getParents()).doesNotContain("entity1");
        }

    }

    @Nested
    @DisplayName("Users")
    class Users {

        @Nested
        @DisplayName("Add")
        class Add {
            @Test
            void GIVEN_Entity_Does_Not_Exist_WHEN_Adding_User_THEN_Return_NotFound() {
                OperationResult<String> result = entitiesService.addEntityUsers("dummyid", null);
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
            }

            @Test
            void GIVEN_Users_With_A_Not_Existing_One_WHEN_Adding_Them_To_Entity_THEN_Return_Bad_Request() {
                ArrayList<String> users = new ArrayList<>();
                users.add("user1");
                users.add("dummyUser");
                OperationResult<String> result = entitiesService.addEntityUsers("entity1", users);
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
            }

            @Test
            void GIVEN_Existing_Users_WHEN_Adding_Them_To_Entity_THEN_Succeed_And_Users_Are_Updated() {
                ArrayList<String> users = new ArrayList<>();
                users.add("user2");
                users.add("user3");
                OperationResult<String> result = entitiesService.addEntityUsers("entity1", users);
                Optional<User> user1Updated = userRepositoryStub.findById("user2");
                Optional<User> user2Updated = userRepositoryStub.findById("user3");
                assertThat(result.isSuccess()).isTrue();
                assertThat(user1Updated.get().getEntities()).contains("entity1");
                assertThat(user2Updated.get().getEntities()).contains("entity1");
            }
        }

        @Nested
        @DisplayName("Update")
        class Update {
            @Test
            void GIVEN_Entity_Does_Not_Exist_WHEN_Updating_User_List_THEN_Return_NotFound() {
                OperationResult<String> result = entitiesService.updateEntityUsers("dummyid", null);
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
            }

            @Test
            void GIVEN_Existing_Entity_WHEN_Updating_Users_With_A_Not_Existing_One_THEN_Return_Bad_Request() {
                ArrayList<String> users = new ArrayList<>();
                users.add("user1");
                users.add("dummyUser");
                OperationResult<String> result = entitiesService.updateEntityUsers("entity1", users);
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
            }

            @Test
            void GIVEN_Existing_Entity_WHEN_Update_User_List_THEN_Succeed_And_Users_Are_Updated() {

                ArrayList<String> users = new ArrayList<>();
                users.add("user1");
                users.add("user2");
                users.add("user3");
                OperationResult<String> result = entitiesService.updateEntityUsers("entity1", users);
                Optional<User> user1Updated = userRepositoryStub.findById("user1");
                Optional<User> user2Updated = userRepositoryStub.findById("user2");
                Optional<User> user3Updated = userRepositoryStub.findById("user3");
                assertThat(result.isSuccess()).isTrue();
                assertThat(user1Updated.get().getEntities()).hasSize(2);
                assertThat(user2Updated.get().getEntities()).hasSize(2);
                assertThat(user3Updated.get().getEntities()).hasSize(1);
                assertThat(user1Updated.get().getEntities()).contains("entity1");
                assertThat(user2Updated.get().getEntities()).contains("entity1");
                assertThat(user3Updated.get().getEntities()).contains("entity1");

            }

            @Test
            void GIVEN_Existing_Group_WHEN_Update_Empty_User_List_THEN_Succeed_And_Users_Are_Updated() {

                ArrayList<String> users = new ArrayList<>();
                OperationResult<String> result = entitiesService.updateEntityUsers("entity2", users);
                Optional<User> user1Updated = userRepositoryStub.findById("user1");
                Optional<User> user2Updated = userRepositoryStub.findById("user2");
                Optional<User> user3Updated = userRepositoryStub.findById("user3");
                assertThat(result.isSuccess()).isTrue();
                assertThat(user1Updated.get().getEntities()).hasSize(1);
                assertThat(user2Updated.get().getEntities()).isEmpty();
                assertThat(user3Updated.get().getEntities()).isEmpty();
                assertThat(user1Updated.get().getEntities()).doesNotContain("entity2");
                assertThat(user2Updated.get().getEntities()).doesNotContain("entity2");
                assertThat(user3Updated.get().getEntities()).doesNotContain("entity2");

            }
        }
 
        @Nested
        @DisplayName("Remove")
        class Remove {

            @Test
            void GIVEN_A_Not_Existing_Entity_WHEN_Try_To_Remove_Users_THEN_Return_NOT_FOUND() {
                OperationResult<String> result = entitiesService.deleteEntityUsers("dummyEntity");
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
            }

            @Test
            void GIVEN_A_Entity_With_User_WHEN_Try_To_Remove_Users_THEN_Success_And_Users_Removed() {
                OperationResult<String> result = entitiesService.deleteEntityUsers("entity2");
                assertThat(result.isSuccess()).isTrue();
                assertThat(userRepositoryStub.findById("user1").get().getEntities()).hasSize(1);
                assertThat(userRepositoryStub.findById("user1").get().getEntities()).contains("entity1");
                assertThat(userRepositoryStub.findById("user2").get().getEntities()).isEmpty();
            }
 
            @Test
            void GIVEN_A_None_Existing_User_WHEN_Try_Removing_From_Entity_THEN_Failed_And_Return_NOT_FOUND() {
                OperationResult<String> result = entitiesService.deleteEntityUser("entity1", "dummyUser");
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
            }

            @Test
            void GIVEN_A_User_WHEN_Try_Removing_From_Not_Existing_Entity_THEN_Failed_And_Return_NOT_FOUND() {
                OperationResult<String> result = entitiesService.deleteEntityUser("dummyGroup", "user1");
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
            }

            @Test
            void GIVEN_A_User_WHEN_Try_Removing_From_Entity_THEN_Success_And_User_Removed_From_Entity() {
                OperationResult<String> result = entitiesService.deleteEntityUser("entity1", "user1");
                assertThat(result.isSuccess()).isTrue();
                assertThat(userRepositoryStub.findById("user1").get().getEntities()).doesNotContain("entity1");
                assertThat(userRepositoryStub.findById("user1").get().getEntities()).contains("entity2");
            } 
        }
    }
}
