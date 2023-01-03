/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.services;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.EntityData;
import org.opfab.users.model.UserData;
import org.opfab.users.model.UserSettingsData;
import org.opfab.users.stubs.EntityRepositoryStub;
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

    private static EntityRepositoryStub entityRepositoryStub = new EntityRepositoryStub();
    private static UsersServiceStub usersServiceStub;
    private static UserSettingsRepositoryStub userSettingsRepositoryStub = new UserSettingsRepositoryStub();
    private static UserSettingsService userSettingsService;

    @BeforeAll
    static void initData() {
        usersServiceStub = new UsersServiceStub(null, null, null, null);
        userSettingsService = new UserSettingsService(userSettingsRepositoryStub, usersServiceStub, null);

        initEntities();
        initUserSettings();
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

    private static void initUserSettings() {
        Map<String, List<String>> processesStatesNotNotified = new HashMap<>();
        List<String> states = new ArrayList<>();
        states.add("mystate");
        processesStatesNotNotified.put("myprocess", states);

        List<String> entitiesDisconnected = new ArrayList<>();
        entitiesDisconnected.add(ENTITY_NOT_CONNECTED);
        UserSettingsData userSettings = new UserSettingsData("test", "test", "fr",
                true, true, true, true,
                null,
                true, 10,
                false, processesStatesNotNotified, entitiesDisconnected);

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
        CurrentUserWithPerimeters currentUser = currentUserWithPerimetersService.fetchCurrentUserWithPerimeters(user);
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
        CurrentUserWithPerimeters currentUser = currentUserWithPerimetersService.fetchCurrentUserWithPerimeters(user);
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
        CurrentUserWithPerimeters currentUser = currentUserWithPerimetersService.fetchCurrentUserWithPerimeters(user);
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
        CurrentUserWithPerimeters currentUser = currentUserWithPerimetersService.fetchCurrentUserWithPerimeters(user);
        assertThat(currentUser.getUserData().getEntities()).contains(GRAND_CHILD_ENTITY, CHILD_ENTITY, ROOT_ENTITY,
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
        CurrentUserWithPerimeters currentUser = currentUserWithPerimetersService.fetchCurrentUserWithPerimeters(user);
        assertThat(currentUser.getUserData().getEntities()).contains(ROOT_ENTITY, ENTITY_1);
        assertThat(currentUser.getUserData().getEntities()).doesNotContain(ENTITY_2, GRAND_CHILD_ENTITY, CHILD_ENTITY);
    }

}
