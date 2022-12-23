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

import org.opfab.users.model.Group;
import org.opfab.users.model.GroupData;
import org.opfab.users.repositories.GroupRepository;

public class GroupRepositoryImpl implements GroupRepository {

    private MongoGroupRepository mongoGroupRepository;

    public GroupRepositoryImpl(MongoGroupRepository mongoGroupRepository) {
        this.mongoGroupRepository = mongoGroupRepository;
    }

    @Override
    public List<Group> findAll() {
        return mongoGroupRepository.findAll().stream().map(Group.class::cast).toList();
    }

    @Override
    public Group insert(Group group) {
        return mongoGroupRepository.insert((GroupData) group);
    }

    @Override
    public Group save(Group group) {
        return mongoGroupRepository.save((GroupData) group);
    }

    public List<Group> saveAll(List<Group> groups) {
        return mongoGroupRepository.saveAll(groups.stream().map(GroupData.class::cast).toList()).stream()
                .map(Group.class::cast).toList();
    }

    @Override
    public Optional<Group> findById(String id) {
        return mongoGroupRepository.findById(id).map(Group.class::cast);
    }

    @Override
    public void delete(Group group) {
        mongoGroupRepository.delete((GroupData) group);

    }

    @Override
    public void deleteAll() {
        mongoGroupRepository.deleteAll();

    }

    @Override
    public List<Group> findByPerimetersContaining(String perimeterContains) {
        return mongoGroupRepository.findByPerimetersContaining(perimeterContains).stream().map(Group.class::cast)
                .toList();
    }

}
