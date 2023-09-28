/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.mongo.repositories;

import java.util.List;
import java.util.Optional;

import org.opfab.users.model.User;
import org.opfab.users.model.UserData;
import org.opfab.users.repositories.UserRepository;

public class UserRepositoryImpl implements UserRepository {

    private MongoUserRepository mongoUserRepository;

    public UserRepositoryImpl(MongoUserRepository mongoUserRepository) {
        this.mongoUserRepository = mongoUserRepository;
    }

    @Override
    public List<User> findAll() {
        return mongoUserRepository.findAll().stream().map(User.class::cast).toList();
    }

    @Override
    public User insert(User user) {
        return mongoUserRepository.insert((UserData) user);
    }

    @Override
    public User save(User user) {
        return mongoUserRepository.save((UserData) user);
    }

    public List<User> saveAll(List<User> users) {
        return mongoUserRepository.saveAll(users.stream().map(UserData.class::cast).toList()).stream()
                .map(User.class::cast).toList();
    }

    @Override
    public Optional<User> findById(String id) {
        return mongoUserRepository.findById(id).map(User.class::cast);
    }
    @Override
    public Optional<User> findByLogin(String login) {
        return mongoUserRepository.findByLogin(login).map(User.class::cast);
    }

    @Override
    public void delete(User user) {
        mongoUserRepository.delete((UserData) user);

    }

    @Override
    public void deleteAll() {
        mongoUserRepository.deleteAll();

    }

    @Override
    public List<User> findByGroupSetContaining(String groupContains) {
        return mongoUserRepository.findByGroupSetContaining(groupContains).stream().map(User.class::cast).toList();
    }

    @Override
    public List<User> findByEntitiesContaining(String entityContains) {
        return mongoUserRepository.findByEntitiesContaining(entityContains).stream().map(User.class::cast).toList();
    }

}
