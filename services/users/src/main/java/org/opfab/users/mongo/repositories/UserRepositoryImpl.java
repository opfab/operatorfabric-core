/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.mongo.repositories;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.opfab.users.model.User;
import org.opfab.users.repositories.UserRepository;

public class UserRepositoryImpl implements UserRepository {

    private MongoUserRepository mongoUserRepository;

    public UserRepositoryImpl(MongoUserRepository mongoUserRepository) {
        this.mongoUserRepository = mongoUserRepository;
    }

    @Override
    public List<User> findAll() {
        return mongoUserRepository.findAll();
    }

    @Override
    public User insert(User user) {
        if (user != null) {
            return mongoUserRepository.insert(user);
        }
        return null;
    }

    @Override
    public User save(User user) {
        if (user != null) {
            return mongoUserRepository.save(user);
        }
        return null;
    }

    public List<User> saveAll(List<User> users) {
        if (users != null) {
            return mongoUserRepository.saveAll(users);
        }
        return new ArrayList<>();
    }

    @Override
    public Optional<User> findById(String id) {
        if (id == null) {
            return Optional.empty();
        }
        return mongoUserRepository.findById(id);
    }

    @Override
    public Optional<User> findByLogin(String login) {
        return mongoUserRepository.findByLogin(login);
    }

    @Override
    public void delete(User user) {
        if (user == null) return;
        mongoUserRepository.delete(user);

    }

    @Override
    public void deleteAll() {
        mongoUserRepository.deleteAll();

    }

    @Override
    public List<User> findByGroupSetContaining(String groupContains) {
        return mongoUserRepository.findByGroupSetContaining(groupContains);
    }

    @Override
    public List<User> findByEntitiesContaining(String entityContains) {
        return mongoUserRepository.findByEntitiesContaining(entityContains);
    }

}
