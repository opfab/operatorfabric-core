/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.stubs;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.opfab.users.model.User;
import org.opfab.users.repositories.UserRepository;

public class UserRepositoryStub implements UserRepository {

    Map<String, User> users = new HashMap<>();

    @Override
    public List<User> saveAll(List<User> usersToSave) {
        usersToSave.forEach((user) -> users.put(user.getLogin(), user));
        return usersToSave;
    }

    @Override
    public List<User> findAll() {
        return users.values().stream().toList();
    }

    @Override
    public User insert(User user) {
        users.put(user.getLogin(), user);
        return user;
    }

    @Override
    public User save(User user) {
        users.put(user.getLogin(), user);
        return user;
    }

    @Override
    public Optional<User> findById(String id) {
        User user = users.get(id);
        if (user == null)
            return Optional.empty();
        return Optional.of(user);
    }

    @Override
    public void delete(User user) {
        users.remove(user.getLogin());

    }

    @Override
    public void deleteAll() {
        users.clear();

    }

    @Override
    public List<User> findByGroupSetContaining(String groupContains) {
        List<User> usersInGroups = new ArrayList<>();
        users.values().forEach((user) -> {
            if (user.getGroups().contains(groupContains)) {
                usersInGroups.add(user);
            }
        });
        return usersInGroups;
    }

    @Override
    public List<User> findByEntitiesContaining(String entityContains) {
        List<User> usersInEntities = new ArrayList<>();
        users.values().forEach((user) -> {
            if (user.getEntities().contains(entityContains)) {
                usersInEntities.add(user);
            }
        });
        return usersInEntities;
    }

    @Override
    public Optional<User> findByLogin(String login) {
        return users.values().stream().filter(user -> user.getLogin().equals(login)).findFirst();
    }

}
