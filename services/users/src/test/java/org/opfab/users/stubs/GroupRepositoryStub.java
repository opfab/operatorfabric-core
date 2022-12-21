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

import org.opfab.users.model.GroupData;
import org.opfab.users.repositories.GroupRepository;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery;

public class GroupRepositoryStub implements GroupRepository {

    Map<String,GroupData> groups = new HashMap<>(); 

    @Override
    public <S extends GroupData> List<S> saveAll(Iterable<S> entities) {
        return null;
    }

    @Override
    public List<GroupData> findAll() {
        return groups.values().stream().toList();
    }

    @Override
    public List<GroupData> findAll(Sort sort) {
        return null;
    }

    @Override
    public <S extends GroupData> S insert(S entity) {
        groups.put(entity.getId(),entity);
        return null;
    }

    @Override
    public <S extends GroupData> List<S> insert(Iterable<S> entities) {
        return null;
    }

    @Override
    public <S extends GroupData> List<S> findAll(Example<S> example) {
        return null;
    }

    @Override
    public <S extends GroupData> List<S> findAll(Example<S> example, Sort sort) {
        return null;
    }

    @Override
    public <S extends GroupData> S save(S entity) {
        groups.put(entity.getId(),entity);
        return entity;
    }

    @Override
    public Optional<GroupData> findById(String id) {
        GroupData group = groups.get(id);
        if (group==null) return Optional.empty();
        return Optional.of(group);
    }

    @Override
    public boolean existsById(String id) {
        return false;
    }

    @Override
    public Iterable<GroupData> findAllById(Iterable<String> ids) {
        return null;
    }

    @Override
    public long count() {
        return 0;
    }

    @Override
    public void deleteById(String id) {
        // Stub
        
    }

    @Override
    public void delete(GroupData entity) {
        groups.remove(entity.getId());
        
    }

    @Override
    public void deleteAllById(Iterable<? extends String> ids) {
        // Stub
    }

    @Override
    public void deleteAll(Iterable<? extends GroupData> entities) {
        // Stub
        
    }

    @Override
    public void deleteAll() {
        groups.clear();
        
    }

    @Override
    public <S extends GroupData> Optional<S> findOne(Example<S> example) {
        return Optional.empty();
    }

    @Override
    public <S extends GroupData> Page<S> findAll(Example<S> example, Pageable pageable) {
    
        return null;
    }

    @Override
    public <S extends GroupData> long count(Example<S> example) {
        return 0;
    }

    @Override
    public <S extends GroupData> boolean exists(Example<S> example) {
        return false;
    }

    @Override
    public <S extends GroupData, R> R findBy(Example<S> example, Function<FetchableFluentQuery<S>, R> queryFunction) {
        return null;
    }

    @Override
    public Page<GroupData> findAll(Pageable pageable) {
        return null;
    }

    @Override
    public List<GroupData> findByPerimetersContaining(String perimeterContains) {
        List<GroupData> groupsHavingPerimeter = new ArrayList<>();
        groups.values().forEach((group) -> {
            if (group.getPerimeters().contains(perimeterContains)) {
                groupsHavingPerimeter.add(group);
            }
        });
        return groupsHavingPerimeter;
    }
    
}
