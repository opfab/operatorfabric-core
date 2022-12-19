/* Copyright (c) 2022, RTE (http://www.rte-france.com)
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
import java.util.function.Function;

import org.opfab.users.model.UserData;
import org.opfab.users.repositories.UserRepository;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery;

public class UserRepositoryStub implements UserRepository{

    Map<String,UserData> users = new HashMap<>(); 

    @Override
    public <S extends UserData> List<S> saveAll(Iterable<S> entities) {
        entities.forEach((entity) -> users.put(entity.getLogin(),entity));
        return null;
    }

    @Override
    public List<UserData> findAll() {
        // stub
        return null;
    }

    @Override
    public List<UserData> findAll(Sort sort) {
        // stub
        return null;
    }

    @Override
    public <S extends UserData> S insert(S entity) {
        users.put(entity.getLogin(),entity);
        return null;
    }

    @Override
    public <S extends UserData> List<S> insert(Iterable<S> entities) {
        // stub
        return null;
    }

    @Override
    public <S extends UserData> List<S> findAll(Example<S> example) {
        // stub
        return null;
    }

    @Override
    public <S extends UserData> List<S> findAll(Example<S> example, Sort sort) {
        // stub
        return null;
    }

    @Override
    public <S extends UserData> S save(S entity) {
        users.put(entity.getLogin(),entity);
        return null;
    }

    @Override
    public Optional<UserData> findById(String id) {
        UserData user = users.get(id);
        if (user==null) return Optional.empty();
        return Optional.of(user);
    }

    @Override
    public boolean existsById(String id) {
        // stub
        return false;
    }

    @Override
    public Iterable<UserData> findAllById(Iterable<String> ids) {
        // stub
        return null;
    }

    @Override
    public long count() {
        // stub
        return 0;
    }

    @Override
    public void deleteById(String id) {
        // stub
        
    }

    @Override
    public void delete(UserData entity) {
        // stub
        
    }

    @Override
    public void deleteAllById(Iterable<? extends String> ids) {
        // stub
        
    }

    @Override
    public void deleteAll(Iterable<? extends UserData> entities) {
        // stub
        
    }

    @Override
    public void deleteAll() {
        users.clear();
        
    }

    @Override
    public <S extends UserData> Optional<S> findOne(Example<S> example) {
        // stub
        return Optional.empty();
    }

    @Override
    public <S extends UserData> Page<S> findAll(Example<S> example, Pageable pageable) {
        // stub
        return null;
    }

    @Override
    public <S extends UserData> long count(Example<S> example) {
        // stub
        return 0;
    }

    @Override
    public <S extends UserData> boolean exists(Example<S> example) {
        // stub
        return false;
    }

    @Override
    public <S extends UserData, R> R findBy(Example<S> example, Function<FetchableFluentQuery<S>, R> queryFunction) {
        // stub
        return null;
    }

    @Override
    public Page<UserData> findAll(Pageable pageable) {
        // stub
        return null;
    }

    @Override
    public List<UserData> findByGroupSetContaining(String groupContains) {
        List<UserData> usersInGroups = new ArrayList<>();
        users.values().forEach((user) -> {
            if (user.getGroupSet().contains(groupContains)) {
                usersInGroups.add(user);
            }
        });
        return usersInGroups;
    }

    @Override
    public List<UserData> findByEntitiesContaining(String entityContains) {
        List<UserData> usersInEntities = new ArrayList<>();
        users.values().forEach((user) -> {
            if (user.getEntities().contains(entityContains)) {
                usersInEntities.add(user);
            }
        });
        return usersInEntities;
    }
    
}
