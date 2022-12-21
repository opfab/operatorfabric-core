/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.stubs;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

import org.opfab.users.model.PerimeterData;
import org.opfab.users.repositories.PerimeterRepository;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery;

public class PerimeterRepositoryStub implements PerimeterRepository{

    Map<String,PerimeterData> perimeters = new HashMap<>(); 

    @Override
    public <S extends PerimeterData> List<S> saveAll(Iterable<S> entities) {
        entities.forEach((entity) -> perimeters.put(entity.getId(),entity) );
        return null;
    }

    @Override
    public List<PerimeterData> findAll() {
        return perimeters.values().stream().toList();
    }

    @Override
    public List<PerimeterData> findAll(Sort sort) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public <S extends PerimeterData> S insert(S entity) {
        perimeters.put(entity.getId(),entity);
        return null;
    }

    @Override
    public <S extends PerimeterData> List<S> insert(Iterable<S> entities) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public <S extends PerimeterData> List<S> findAll(Example<S> example) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public <S extends PerimeterData> List<S> findAll(Example<S> example, Sort sort) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public <S extends PerimeterData> S save(S entity) {
        perimeters.put(entity.getId(),entity);
        return entity;
    }

    @Override
    public Optional<PerimeterData> findById(String id) {
        PerimeterData user = perimeters.get(id);
        if (user==null) return Optional.empty();
        return Optional.of(user);
    }

    @Override
    public boolean existsById(String id) {
        // TODO Auto-generated method stub
        return false;
    }

    @Override
    public Iterable<PerimeterData> findAllById(Iterable<String> ids) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public long count() {
        // TODO Auto-generated method stub
        return 0;
    }

    @Override
    public void deleteById(String id) {
        // TODO Auto-generated method stub
        
    }

    @Override
    public void delete(PerimeterData entity) {
        // TODO Auto-generated method stub
        
    }

    @Override
    public void deleteAllById(Iterable<? extends String> ids) {
        // TODO Auto-generated method stub
        
    }

    @Override
    public void deleteAll(Iterable<? extends PerimeterData> entities) {
        // TODO Auto-generated method stub
        
    }

    @Override
    public void deleteAll() {
        perimeters.clear();
        
    }

    @Override
    public <S extends PerimeterData> Optional<S> findOne(Example<S> example) {
        // TODO Auto-generated method stub
        return Optional.empty();
    }

    @Override
    public <S extends PerimeterData> Page<S> findAll(Example<S> example, Pageable pageable) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public <S extends PerimeterData> long count(Example<S> example) {
        // TODO Auto-generated method stub
        return 0;
    }

    @Override
    public <S extends PerimeterData> boolean exists(Example<S> example) {
        // TODO Auto-generated method stub
        return false;
    }

    @Override
    public <S extends PerimeterData, R> R findBy(Example<S> example, Function<FetchableFluentQuery<S>, R> queryFunction) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Page<PerimeterData> findAll(Pageable pageable) {
        // TODO Auto-generated method stub
        return null;
    }
    
}
