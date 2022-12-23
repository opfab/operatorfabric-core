/* Copyright (c) 2022, RTE (http://www.rte-france.com)
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

import org.opfab.users.model.Perimeter;
import org.opfab.users.model.PerimeterData;
import org.opfab.users.repositories.PerimeterRepository;

public class PerimeterRepositoryImpl implements PerimeterRepository {

    private MongoPerimeterRepository mongoPerimeterRepository;
    
    public PerimeterRepositoryImpl(MongoPerimeterRepository mongoPerimeterRepository) {
        this.mongoPerimeterRepository = mongoPerimeterRepository;
    }    

    @Override
    public List<Perimeter> saveAll(List<Perimeter> perimeters) {
        return mongoPerimeterRepository.saveAll(perimeters.stream().map(PerimeterData.class::cast).toList()).stream()
        .map(Perimeter.class::cast).toList();

    }

    @Override
    public List<Perimeter> findAll(){
        return mongoPerimeterRepository.findAll().stream().map(Perimeter.class::cast).toList();
    }

    @Override
    public Perimeter insert(Perimeter perimeter){
        return mongoPerimeterRepository.insert((PerimeterData) perimeter);
    }

    @Override
    public Perimeter save(Perimeter perimeter){
        return mongoPerimeterRepository.save((PerimeterData) perimeter);
    }

    @Override
    public Optional<Perimeter> findById(String id){
        return mongoPerimeterRepository.findById(id).map(Perimeter.class::cast);
    }

    @Override
    public void delete(Perimeter perimeter){
        mongoPerimeterRepository.delete((PerimeterData) perimeter);
    }

    @Override
    public void deleteAll(){
        mongoPerimeterRepository.deleteAll();
    }
}
