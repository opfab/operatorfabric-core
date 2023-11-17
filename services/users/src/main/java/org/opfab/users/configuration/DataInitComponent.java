/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.configuration;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.opfab.users.configuration.users.UsersProperties;
import org.opfab.users.model.*;
import org.opfab.users.mongo.repositories.MongoEntityRepository;
import org.opfab.users.mongo.repositories.MongoGroupRepository;
import org.opfab.users.mongo.repositories.MongoUserSettingsRepository;
import org.opfab.users.mongo.repositories.MongoUserRepository;
import org.opfab.users.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

import java.util.List;
/**
 * This component solely serves as data initializer for users, groups and
 * entities, it loads users, groups and entities from properties
 * configuration and insert or update them as needed
 *
 *
 */
@Component
@Slf4j
public class DataInitComponent {

    private static final String FAILED_INIT_MSG = "Unable to init ";
    private final UsersProperties usersProperties;
    private final MongoUserRepository userRepository;
    private final MongoGroupRepository groupRepository;
    private final MongoEntityRepository entityRepository;
    private final PerimeterRepository perimeterRepository;
    private final MongoUserSettingsRepository userSettingsRepository;

    @Getter
    private boolean initiated;

    @Autowired
    public DataInitComponent(UsersProperties usersProperties, MongoUserRepository userRepository,
            MongoGroupRepository groupRepository, MongoEntityRepository entityRepository,
            PerimeterRepository perimeterRepository, MongoUserSettingsRepository userSettingsRepository) {
        this.usersProperties = usersProperties;
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.entityRepository = entityRepository;
        this.perimeterRepository = perimeterRepository;
        this.userSettingsRepository = userSettingsRepository;
    }

    @PostConstruct
    public void init() {
        try {
            for (GroupData g : usersProperties.getGroups()) {
                safeInsertGroup(g);
            }
            for (EntityData e : usersProperties.getEntities()) {
                safeInsertEntity(e);
            }
            for (PerimeterData p : usersProperties.getPerimeters()) {
                safeInsertPerimeter(p);
            }
            for (UserData u : usersProperties.getUsers()) {
                safeInsertUsers(u);
            }
            for (UserSettingsData us : usersProperties.getUserSettings()) {
                safeInsertUserSettings(us);
            }
            initiated = true;
        } catch (Exception e) {
            log.error(FAILED_INIT_MSG, e);
            initiated = false;
        }
    }

    /**
     * Insert user settings, if failure (settings already exist), logs and carries
     * on to next user settings
     *
     * If users exist adds missing groups (no delete)
     *
     * @param u
     */
    private void safeInsertUserSettings(UserSettingsData u) {
        try {
            u.setLogin(u.getLogin().toLowerCase());
            userSettingsRepository.insert(u);
        } catch (DuplicateKeyException ex) {
            log.warn("{} {} user settings: duplicate", FAILED_INIT_MSG, u.getLogin());
        }
    }

    /**
     * Insert users, if failure (users already exist), logs and carries on to next
     * users
     *
     * If users exist adds missing groups and entities (no delete)
     *
     * @param u
     */
    private void safeInsertUsers(UserData u) {
        try {
            u.setLogin(u.getLogin().toLowerCase());
            userRepository.insert(u);
        } catch (DuplicateKeyException ex) {
            log.warn("{} {} user: duplicate", FAILED_INIT_MSG, u.getLogin());
            userRepository.findById(u.getLogin()).ifPresent(loadedUser -> {
                boolean updated = updateGroups(u, loadedUser) || updateEntities(u, loadedUser);
                if (updated) {
                    userRepository.save(loadedUser);
                }
            });
        }
    }

    private boolean updateGroups(UserData u, UserData loadedUser) {
        List<String> newGroups = u.getGroupSet().stream()
                .filter(groupId -> !loadedUser.getGroupSet().contains(groupId))
                .toList();

        newGroups.forEach(groupId -> {
            loadedUser.addGroup(groupId);
            log.info("Added group '{}' to existing user '{}'", groupId, loadedUser.getLogin());
        });

        return !newGroups.isEmpty();
    }

    private boolean updateEntities(UserData u, UserData loadedUser) {
        List<String> newEntities = u.getEntities().stream()
                .filter(entityId -> !loadedUser.getEntities().contains(entityId))
                .toList();

        newEntities.forEach(entityId -> {
            loadedUser.addEntity(entityId);
            log.info("Added entityId '{}' to existing user '{}'", entityId, loadedUser.getLogin());
        });

        return !newEntities.isEmpty();
    }

    /**
     * Insert groups, if failure (groups already exist), logs and carries on to next
     * group
     *
     * @param g
     */
    private void safeInsertGroup(GroupData g) {
        try {
            groupRepository.insert(g);
        } catch (DuplicateKeyException ex) {
            log.warn("{} {} group: duplicate", FAILED_INIT_MSG, g.getId());
        }
    }

    /**
     * Insert entities, if failure (entities already exist), logs and carries on to
     * next entity
     *
     * @param e
     */
    private void safeInsertEntity(EntityData e) {
        try {
            entityRepository.insert(e);
        } catch (DuplicateKeyException ex) {
            log.warn("{} {} entity: duplicate", FAILED_INIT_MSG, e.getId());
        }
    }

    /**
     * Insert perimeters, if failure (perimeters already exist), logs and carries on
     * to next perimeter
     *
     * @param p
     */
    private void safeInsertPerimeter(PerimeterData p) {
        try {
            perimeterRepository.insert(p);
        } catch (DuplicateKeyException ex) {
            log.warn("{} {} perimeter: duplicate", FAILED_INIT_MSG, p.getId());
        }
    }
}
