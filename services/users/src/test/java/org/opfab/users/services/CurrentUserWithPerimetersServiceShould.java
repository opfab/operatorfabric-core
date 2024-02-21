/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
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
import org.opfab.users.stubs.UserRepositoryStub;
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
        public static final String GROUP_4 = "GROUP4";
        public static final String GROUP_ADMIN = "ADMIN";

        private static EntityRepositoryStub entityRepositoryStub = new EntityRepositoryStub();
        private static UsersServiceStub usersServiceStub;
        private static UserSettingsRepositoryStub userSettingsRepositoryStub = new UserSettingsRepositoryStub();
        private static UserSettingsService userSettingsService;

        private static GroupRepositoryStub groupRepositoryStub = new GroupRepositoryStub();
        private static UserRepositoryStub userRepositoryStub = new UserRepositoryStub();

        @BeforeAll
        static void initData() {
                groupRepositoryStub = new GroupRepositoryStub();
                userRepositoryStub = new UserRepositoryStub();
                usersServiceStub = new UsersServiceStub(userRepositoryStub, groupRepositoryStub, null, null, null);
                userSettingsService = new UserSettingsService(userSettingsRepositoryStub, usersServiceStub, null);

                initEntities();
                initUserSettings();
                initGroups();
                initUsers();
        }

        private static void initEntities() {
                Entity entity1 = new Entity();
                entity1.setId(ENTITY_1);
                entityRepositoryStub.insert(entity1);

                Entity entity2 = new Entity();
                entity2.setId(ENTITY_2);
                entityRepositoryStub.insert(entity2);

                Entity entityNotConnected = new Entity();
                entityNotConnected.setId(ENTITY_NOT_CONNECTED);
                entityRepositoryStub.insert(entityNotConnected);

                Entity rootEntity = new Entity();
                rootEntity.setId(ROOT_ENTITY);
                entityRepositoryStub.insert(rootEntity);

                Entity childEntity = new Entity();
                childEntity.setId(CHILD_ENTITY);
                List<String> parents = new ArrayList<>();
                parents.add(ROOT_ENTITY);
                childEntity.setParents(parents);
                entityRepositoryStub.insert(childEntity);

                Entity grandChildEntity = new Entity();
                grandChildEntity.setId(GRAND_CHILD_ENTITY);
                List<String> parents2 = new ArrayList<>();
                parents2.add(CHILD_ENTITY);
                grandChildEntity.setParents(parents2);
                entityRepositoryStub.insert(grandChildEntity);
        }

        private static void initGroups() {
                Group group1 = new Group(GROUP_1);
                group1.setPermissions(Lists.list(PermissionEnum.READONLY));
                groupRepositoryStub.save(group1);

                Group group2 = new Group(GROUP_2);
                group2.setPermissions(Lists.list(PermissionEnum.READONLY, PermissionEnum.VIEW_ALL_ARCHIVED_CARDS));
                groupRepositoryStub.save(group2);

                Group group3 = new Group(GROUP_3);
                groupRepositoryStub.save(group3);

                Group group4 = new Group(GROUP_4);
                group4.setPermissions(Lists.list(PermissionEnum.READONLY,
                                PermissionEnum.VIEW_ALL_ARCHIVED_CARDS_FOR_USER_PERIMETERS));
                groupRepositoryStub.save(group4);

                Group groupAdmin = new Group(GROUP_ADMIN);
                groupRepositoryStub.save(groupAdmin);
        }

        private static void initUsers() {
                User user = new User();
                user.setLogin("testLogin");
                user.addEntity(GRAND_CHILD_ENTITY);
                user.addEntity(ENTITY_1);
                user.addEntity("ENTITY_NOT_CONNECTED");
                user.addGroup(GROUP_3);
                
                userRepositoryStub.save(user);
        }

        private static void initUserSettings() {
                Map<String, List<String>> processesStatesNotNotified = new HashMap<>();
                List<String> states = new ArrayList<>();
                states.add("mystate");
                processesStatesNotNotified.put("myprocess", states);

                List<String> entitiesDisconnected = new ArrayList<>();
                entitiesDisconnected.add(ENTITY_NOT_CONNECTED);
                UserSettings userSettings = new UserSettings();

                userSettings.setLogin("test");
                userSettings.setLocale("fr");
                userSettings.setPlaySoundForAlarm(true);
                userSettings.setPlaySoundForAction(true);
                userSettings.setPlaySoundForCompliant(true);
                userSettings.setPlaySoundForInformation(true);
                userSettings.setSystemNotificationAction(true);
                userSettings.setSystemNotificationAlarm(true);
                userSettings.setSystemNotificationCompliant(true);
                userSettings.setSystemNotificationInformation(null);
                userSettings.setReplayEnabled(true);
                userSettings.setReplayInterval(10);
                userSettings.setRemoteLoggingEnabled(false);
                userSettings.setSendCardsByEmail(false);
                userSettings.setEmailToPlainText(false);
                userSettings.setSendDailyEmail(false);
                userSettings.setProcessesStatesNotNotified(processesStatesNotNotified);
                userSettings.setEntitiesDisconnected(entitiesDisconnected);

                userSettingsRepositoryStub.save(userSettings);

        }

        @Test
        void shouldContainsProcessNotNotified() throws Exception {

                User user = new User();
                user.setLogin("test");
                user.addEntity("ENTITY_1");

                CurrentUserWithPerimetersService currentUserWithPerimetersService = new CurrentUserWithPerimetersService(
                                usersServiceStub, userSettingsService, entityRepositoryStub);
                CurrentUserWithPerimeters currentUser = currentUserWithPerimetersService
                                .fetchCurrentUserWithPerimeters(user);
                assertThat(currentUser.getProcessesStatesNotNotified().get("myprocess")).contains("mystate");
        }

        @Test
        void shouldContainsUserEntities() throws Exception {

                User user = new User();
                user.setLogin("test");
                user.addEntity(ENTITY_1);
                user.addEntity(ENTITY_2);

                CurrentUserWithPerimetersService currentUserWithPerimetersService = new CurrentUserWithPerimetersService(
                                usersServiceStub, userSettingsService, entityRepositoryStub);
                CurrentUserWithPerimeters currentUser = currentUserWithPerimetersService
                                .fetchCurrentUserWithPerimeters(user);
                assertThat(currentUser.getUserData().getEntities()).contains(ENTITY_1, ENTITY_2);
        }

        @Test
        void shouldNotContainsUserEntitiesNotConnected() throws Exception {

                User user = new User();
                user.setLogin("test");
                user.addEntity(ENTITY_1);
                user.addEntity(ENTITY_2);
                user.addEntity(ENTITY_NOT_CONNECTED);

                CurrentUserWithPerimetersService currentUserWithPerimetersService = new CurrentUserWithPerimetersService(
                                usersServiceStub, userSettingsService, entityRepositoryStub);
                CurrentUserWithPerimeters currentUser = currentUserWithPerimetersService
                                .fetchCurrentUserWithPerimeters(user);
                assertThat(currentUser.getUserData().getEntities()).contains(ENTITY_1, ENTITY_2);
        }

        @Test
        void shouldContainsUserEntitiesParents() throws Exception {
                User user = new User();
                user.setLogin("test");
                user.addEntity(GRAND_CHILD_ENTITY);
                user.addEntity(ENTITY_1);

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
                User user = new User();
                user.setLogin("test");
                user.addEntity(ROOT_ENTITY);
                user.addEntity(ENTITY_1);

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
                User user = new User();
                user.setLogin("test");
                user.addGroup(GROUP_3);

                CurrentUserWithPerimetersService currentUserWithPerimetersService = new CurrentUserWithPerimetersService(
                                usersServiceStub, userSettingsService, entityRepositoryStub);
                CurrentUserWithPerimeters currentUser = currentUserWithPerimetersService
                                .fetchCurrentUserWithPerimeters(user);
                assertThat(currentUser.getPermissions()).isEmpty();
        }

        @Test
        void GIVEN_User_With_Many_Groups_WHEN_Fetching_CurrentUserWithPerimeters_THEN_Return_Permissions_From_All_Groups() {
                User user = new User();
                user.setLogin("test");
                user.addGroup(GROUP_1);
                user.addGroup(GROUP_2);
                user.addGroup(GROUP_3);
                user.addGroup(GROUP_4);
                
                CurrentUserWithPerimetersService currentUserWithPerimetersService = new CurrentUserWithPerimetersService(
                                usersServiceStub, userSettingsService, entityRepositoryStub);
                CurrentUserWithPerimeters currentUser = currentUserWithPerimetersService
                                .fetchCurrentUserWithPerimeters(user);
                assertThat(currentUser.getPermissions()).containsExactlyInAnyOrder(PermissionEnum.READONLY,
                                PermissionEnum.VIEW_ALL_ARCHIVED_CARDS,
                                PermissionEnum.VIEW_ALL_ARCHIVED_CARDS_FOR_USER_PERIMETERS);
        }

        @Test
        void GIVEN_User_Login_WHEN_FetchingUserWithPerimeters_CurrentUserWithPerimetersShouldContainsUserEntitiesParents()
                        throws Exception {
                String login = "testLogin";
                CurrentUserWithPerimetersService currentUserWithPerimetersService = new CurrentUserWithPerimetersService(
                                usersServiceStub, userSettingsService, entityRepositoryStub);
                CurrentUserWithPerimeters currentUser = currentUserWithPerimetersService
                                .fetchUserWithPerimeters(login);
                assertThat(currentUser.getUserData().getEntities()).contains(GRAND_CHILD_ENTITY, CHILD_ENTITY,
                                ROOT_ENTITY,
                                ENTITY_1);
        }
}
