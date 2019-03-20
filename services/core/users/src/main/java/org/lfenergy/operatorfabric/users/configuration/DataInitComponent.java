/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.users.configuration;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.users.configuration.users.UsersProperties;
import org.lfenergy.operatorfabric.users.model.GroupData;
import org.lfenergy.operatorfabric.users.model.UserData;
import org.lfenergy.operatorfabric.users.repositories.GroupRepository;
import org.lfenergy.operatorfabric.users.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.Optional;

/**
 * This component solely serve as data intializer for users and groups, it loads users and group from properties
 * configuration and insert or update them as needed
 *
 * @author David Binder
 */
@Component
@Slf4j
public class DataInitComponent {

    @Autowired
    private UsersProperties usersProperties;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Getter
    private boolean initiated;

    @PostConstruct
    public void init() {
        try {
            for (GroupData g : usersProperties.getGroups()) {
                safeInsertGroup(g);
            }
            for (UserData u : usersProperties.getUsers()) {
                safeInsertUsers(u);
            }
        }finally {
            initiated=true;
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
            log.warn("unnable to init " + u.getLogin() + " user: duplicate");
            Optional<UserData> resultUser = userRepository.findById(u.getLogin());
            if (resultUser.isPresent()) {
                UserData loadedUser = resultUser.get();
                boolean updated = false;
                for (String groupName : u.getGroupSet()) {
                    if (!loadedUser.getGroupSet().contains(groupName)) {
                        loadedUser.addGroup(groupName);
                        log.info("Added \"" + groupName + "\" to existing user \"" + loadedUser.getLogin() + "\"");

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
            log.warn("unnable to init " + g.getName() + " group: duplicate");
        }
    }
}
