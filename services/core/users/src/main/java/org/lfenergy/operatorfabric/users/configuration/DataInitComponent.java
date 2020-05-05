/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.users.configuration;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.users.configuration.users.UsersProperties;
import org.lfenergy.operatorfabric.users.model.*;
import org.lfenergy.operatorfabric.users.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.Optional;

/**
 * This component solely serves as data initializer for users, groups and entities, it loads users, groups and entities from properties
 * configuration and insert or update them as needed
 *
 *
 */
@Component
@Slf4j
public class DataInitComponent {

    private static final String FAILED_INIT_MSG = "Unable to init ";
    @Autowired
    private UsersProperties usersProperties;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private EntityRepository entityRepository;

    @Autowired
    private PerimeterRepository perimeterRepository;

    @Autowired
    private UserSettingsRepository userSettingsRepository;

    @Getter
    private boolean initiated;

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

            for (UserSettingsData us : usersProperties.getUserSettings())
                safeInsertUserSettings(us);
        }finally {
            initiated=true;
        }
    }

    /**
     * Insert user settings, if failure (settings already exist), logs and carries on to next user settings
     *
     * If users exist adds missing groups (no delete)
     *
     * @param u
     */
    private void safeInsertUserSettings(UserSettingsData u) {
        try {
            userSettingsRepository.insert(u);
        } catch (DuplicateKeyException ex) {
            log.warn("{} {} user settings: duplicate",FAILED_INIT_MSG, u.getLogin() );
        }
    }

    /**
     * Insert users, if failure (users already exist), logs and carries on to next users
     *
     * If users exist adds missing groups (no delete)
     *
     * @param u
     */
    private void safeInsertUsers(UserData u) {
        try {
            userRepository.insert(u);
        } catch (DuplicateKeyException ex) {
            log.warn("{} {} user: duplicate", FAILED_INIT_MSG, u.getLogin());
            Optional<UserData> resultUser = userRepository.findById(u.getLogin());
            if (resultUser.isPresent()) {
                UserData loadedUser = resultUser.get();
                boolean updated = false;
                for (String groupId : u.getGroupSet()) {
                    if (!loadedUser.getGroupSet().contains(groupId)) {
                        loadedUser.addGroup(groupId);
                        log.info("Added group '{}' to existing user '{}'", groupId, loadedUser.getLogin());

                        updated = true;
                    }
                }
                for (String entityId : u.getEntities()) {
                    if (!loadedUser.getEntities().contains(entityId)) {
                        loadedUser.addEntity(entityId);
                        log.info("Added entityId '{}' to existing user '{}'", entityId, loadedUser.getLogin());

                        updated = true;
                    }
                }

                if (updated)
                    userRepository.save(loadedUser);
            }
        }
    }

    /**
     * Insert groups, if failure (groups already exist), logs and carries on to next group
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
     * Insert entities, if failure (entities already exist), logs and carries on to next entity
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
     * Insert perimeters, if failure (perimeters already exist), logs and carries on to next perimeter
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
