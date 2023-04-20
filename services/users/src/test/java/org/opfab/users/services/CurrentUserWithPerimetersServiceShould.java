/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.services;

import org.assertj.core.util.Lists;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.opfab.users.model.*;
import org.opfab.users.stubs.EntityRepositoryStub;
import org.opfab.users.stubs.GroupRepositoryStub;
import org.opfab.users.stubs.UserSettingsRepositoryStub;
import org.opfab.users.stubs.UsersServiceStub;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

class CurrentUserWithPerimetersServiceShould {

        private static final String ROOT_ENTITY = "root-entity";
        public static final String CHILD_ENTITY = "child-entity";

        public static final String GRAND_CHILD_ENTITY = "grand-child-entity";

        public static final String ENTITY_1 = "ENTITY1";
        public static final String ENTITY_2 = "ENTITY2";
        public static final String ENTITY_NOT_CONNECTED = "ENTITY_NOT_CONNECTED";

        public static final String GROUP_1 = "GROUP1";
        public static final String GROUP_2 = "GROUP2";

        public static final String GROUP_3 = "GROUP3";
        public static final String GROUP_ADMIN = "ADMIN";


        private static EntityRepositoryStub entityRepositoryStub = new EntityRepositoryStub();
        private static UsersServiceStub usersServiceStub;
        private static UserSettingsRepositoryStub userSettingsRepositoryStub = new UserSettingsRepositoryStub();
        private static UserSettingsService userSettingsService;

        private static GroupRepositoryStub groupRepositoryStub = new GroupRepositoryStub();

        @BeforeAll
        static void initData() {
                groupRepositoryStub = new GroupRepositoryStub();
                usersServiceStub = new UsersServiceStub(null, groupRepositoryStub, null, null, null);
                userSettingsService = new UserSettingsService(userSettingsRepositoryStub, usersServiceStub, null);

                initEntities();
                initUserSettings();
                initGroups();
        }

        private static void initEntities() {
                EntityData entity1 = new EntityData();
                entity1.setId(ENTITY_1);
                entityRepositoryStub.insert(entity1);

                EntityData entity2 = new EntityData();
                entity2.setId(ENTITY_2);
                entityRepositoryStub.insert(entity2);

                EntityData entityNotConnected = new EntityData();
                entityNotConnected.setId(ENTITY_NOT_CONNECTED);
                entityRepositoryStub.insert(entityNotConnected);

                EntityData rootEntity = new EntityData();
                rootEntity.setId(ROOT_ENTITY);
                entityRepositoryStub.insert(rootEntity);

                EntityData childEntity = new EntityData();
                childEntity.setId(CHILD_ENTITY);
                List<String> parents = new ArrayList<>();
                parents.add(ROOT_ENTITY);
                childEntity.setParents(parents);
                entityRepositoryStub.insert(childEntity);

                EntityData grandChildEntity = new EntityData();
                grandChildEntity.setId(GRAND_CHILD_ENTITY);
                List<String> parents2 = new ArrayList<>();
                parents2.add(CHILD_ENTITY);
                grandChildEntity.setParents(parents2);
                entityRepositoryStub.insert(grandChildEntity);
        }

        private static void initGroups() {
                GroupData group1 = new GroupData();
                group1.setId(GROUP_1);
                group1.setPermissions(Lists.list(PermissionEnum.READONLY));
                groupRepositoryStub.save(group1);

                GroupData group2 = new GroupData();
                group2.setId(GROUP_2);
                group2.setPermissions(Lists.list(PermissionEnum.READONLY, PermissionEnum.VIEW_ALL_ARCHIVED_CARDS));
                groupRepositoryStub.save(group2);

                GroupData group3 = new GroupData();
                group3.setId(GROUP_3);
                groupRepositoryStub.save(group3);


                GroupData groupAdmin = new GroupData();
                groupAdmin.setId(GROUP_ADMIN);
                groupRepositoryStub.save(groupAdmin);
        }

        private static void initUserSettings() {
                Map<String, List<String>> processesStatesNotNotified = new HashMap<>();
                List<String> states = new ArrayList<>();
                states.add("mystate");
                processesStatesNotNotified.put("myprocess", states);

                List<String> entitiesDisconnected = new ArrayList<>();
                entitiesDisconnected.add(ENTITY_NOT_CONNECTED);
                UserSettingsData userSettings = new UserSettingsData("test", "test", "fr",
                                true, true, true, true, true, true, true, true,
                                null,
                                true, 10,
                                false, false, null, processesStatesNotNotified, entitiesDisconnected);

                userSettingsRepositoryStub.save(userSettings);

        }

        @Test
        void shouldContainsProcessNotNotified() throws Exception {

                UserData user = UserData.builder()
                                .login("test")
                                .entity(ENTITY_1)
                                .build();

                CurrentUserWithPerimetersService currentUserWithPerimetersService = new CurrentUserWithPerimetersService(
                                usersServiceStub, userSettingsService, entityRepositoryStub);
                CurrentUserWithPerimeters currentUser = currentUserWithPerimetersService
                                .fetchCurrentUserWithPerimeters(user);
                assertThat(currentUser.getProcessesStatesNotNotified().get("myprocess")).contains("mystate");
        }

        @Test
        void shouldContainsUserEntities() throws Exception {

                UserData user = UserData.builder()
                                .login("test")
                                .entity(ENTITY_1).entity(ENTITY_2)
                                .build();

                CurrentUserWithPerimetersService currentUserWithPerimetersService = new CurrentUserWithPerimetersService(
                                usersServiceStub, userSettingsService, entityRepositoryStub);
                CurrentUserWithPerimeters currentUser = currentUserWithPerimetersService
                                .fetchCurrentUserWithPerimeters(user);
                assertThat(currentUser.getUserData().getEntities()).contains(ENTITY_1, ENTITY_2);
        }

        @Test
        void shouldNotContainsUserEntitiesNotConnected() throws Exception {

                UserData user = UserData.builder()
                                .login("test")
                                .entity("ENTITY1").entity("ENTITY2").entity("ENTITY_NOT_CONNECTED")
                                .build();

                CurrentUserWithPerimetersService currentUserWithPerimetersService = new CurrentUserWithPerimetersService(
                                usersServiceStub, userSettingsService, entityRepositoryStub);
                CurrentUserWithPerimeters currentUser = currentUserWithPerimetersService
                                .fetchCurrentUserWithPerimeters(user);
                assertThat(currentUser.getUserData().getEntities()).contains(ENTITY_1, ENTITY_2);
        }

        @Test
        void shouldContainsUserEntitiesParents() throws Exception {
                UserData user = UserData.builder()
                                .login("test")
                                .entity(GRAND_CHILD_ENTITY).entity(ENTITY_1)
                                .build();
                CurrentUserWithPerimetersService currentUserWithPerimetersService = new CurrentUserWithPerimetersService(
                                usersServiceStub, userSettingsService, entityRepositoryStub);
                CurrentUserWithPerimeters currentUser = currentUserWithPerimetersService
                                .fetchCurrentUserWithPerimeters(user);
                assertThat(currentUser.getUserData().getEntities()).contains(GRAND_CHILD_ENTITY, CHILD_ENTITY,
                                ROOT_ENTITY,
                                ENTITY_1);
                assertThat(currentUser.getUserData().getEntities()).doesNotContain(ENTITY_2);
        }

        @Test
        void shouldNotContainsUserEntitiesChilds() throws Exception {
                UserData user = UserData.builder()
                                .login("test")
                                .entity(ROOT_ENTITY).entity(ENTITY_1)
                                .build();
                CurrentUserWithPerimetersService currentUserWithPerimetersService = new CurrentUserWithPerimetersService(
                                usersServiceStub, userSettingsService, entityRepositoryStub);
                CurrentUserWithPerimeters currentUser = currentUserWithPerimetersService
                                .fetchCurrentUserWithPerimeters(user);
                assertThat(currentUser.getUserData().getEntities()).contains(ROOT_ENTITY, ENTITY_1);
                assertThat(currentUser.getUserData().getEntities()).doesNotContain(ENTITY_2, GRAND_CHILD_ENTITY,
                                CHILD_ENTITY);
        }

        @Test
        void GIVEN_User_With_One_Group_Without_Permissions_WHEN_Fetching_CurrentUserWithPerimeters_THEN_Return_Empty_Permissions_List() {
                UserData user = UserData.builder()
                        .login("test")
                        .group(GROUP_3)
                        .build();
                CurrentUserWithPerimetersService currentUserWithPerimetersService = new CurrentUserWithPerimetersService(
                        usersServiceStub, userSettingsService, entityRepositoryStub);
                CurrentUserWithPerimeters currentUser = currentUserWithPerimetersService
                        .fetchCurrentUserWithPerimeters(user);
                assertThat(currentUser.getPermissions()).isEmpty();
        }

        @Test
        void GIVEN_User_With_Many_Groups_WHEN_Fetching_CurrentUserWithPerimeters_THEN_Return_Permissions_From_All_Groups() {
                UserData user = UserData.builder()
                        .login("test")
                        .group(GROUP_1).group(GROUP_2).group(GROUP_3)
                        .build();
                CurrentUserWithPerimetersService currentUserWithPerimetersService = new CurrentUserWithPerimetersService(
                        usersServiceStub, userSettingsService, entityRepositoryStub);
                CurrentUserWithPerimeters currentUser = currentUserWithPerimetersService
                        .fetchCurrentUserWithPerimeters(user);
                assertThat(currentUser.getPermissions()).containsExactlyInAnyOrder(PermissionEnum.READONLY, PermissionEnum.VIEW_ALL_ARCHIVED_CARDS);
        }

        // For compatibility with old version , being in admin group gives the admin permission
        // to be removed in a future release
        @Test
        void GIVEN_User_With_Group_Admin_WHEN_Fetching_CurrentUserWithPerimeters_THEN_Permission_Admin_Is_Set() {

                                       
                UserData user = UserData.builder()
                        .login("test")
                        .group(GROUP_ADMIN)
                        .build();
                CurrentUserWithPerimetersService currentUserWithPerimetersService = new CurrentUserWithPerimetersService(
                        usersServiceStub, userSettingsService, entityRepositoryStub);
                CurrentUserWithPerimeters currentUser = currentUserWithPerimetersService
                        .fetchCurrentUserWithPerimeters(user);
                assertThat(currentUser.getPermissions()).containsExactlyInAnyOrder(PermissionEnum.ADMIN);
        }
}
