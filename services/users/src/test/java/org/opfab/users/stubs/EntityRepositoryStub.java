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
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

import org.opfab.users.model.EntityData;
import org.opfab.users.repositories.EntityRepository;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery;

public class EntityRepositoryStub implements EntityRepository{

    public List<EntityData> entities = new ArrayList<>();

    @Override
    public <S extends EntityData> List<S> saveAll(Iterable<S> entities) {
        return null;
    }

    @Override
    public List<EntityData> findAll() {
        return entities;
    }

    @Override
    public List<EntityData> findAll(Sort sort) {
        return entities;
    }

    @Override
    public <S extends EntityData> S insert(S entity) {
        entities.add(entity);
        return null;
    }

    @Override
    public <S extends EntityData> List<S> insert(Iterable<S> entities) {
        return null;
    }

    @Override
    public <S extends EntityData> List<S> findAll(Example<S> example) {
        return null;
    }

    @Override
    public <S extends EntityData> List<S> findAll(Example<S> example, Sort sort) {
        return null;
    }

    @Override
    public <S extends EntityData> S save(S entity) {
        return null;
    }

    @Override
    public Optional<EntityData> findById(String id) {
        return Optional.empty();
    }

    @Override
    public boolean existsById(String id) {
        return false;
    }

    @Override
    public Iterable<EntityData> findAllById(Iterable<String> ids) {
        return null;
    }

    @Override
    public long count() {
        return 0;
    }

    @Override
    public void deleteById(String id) {
        // stub
    }

    @Override
    public void delete(EntityData entity) {
        // stub
    }

    @Override
    public void deleteAllById(Iterable<? extends String> ids) {
        // stub
    }

    @Override
    public void deleteAll(Iterable<? extends EntityData> entities) {
        // stub
    }

    @Override
    public void deleteAll() {
        entities.clear();
        
    }

    @Override
    public <S extends EntityData> Optional<S> findOne(Example<S> example) {
        return Optional.empty();
    }

    @Override
    public <S extends EntityData> Page<S> findAll(Example<S> example, Pageable pageable) {
        return null;
    }

    @Override
    public <S extends EntityData> long count(Example<S> example) {
        return 0;
    }

    @Override
    public <S extends EntityData> boolean exists(Example<S> example) {
        
        return false;
    }

    @Override
    public <S extends EntityData, R> R findBy(Example<S> example, Function<FetchableFluentQuery<S>, R> queryFunction) {
       
        return null;
    }

    @Override
    public Page<EntityData> findAll(Pageable pageable) {
        
        return null;
    }

    @Override
    public List<EntityData> findByParentsContaining(String entityId) {
        
        return null;
    }
    
    
}
