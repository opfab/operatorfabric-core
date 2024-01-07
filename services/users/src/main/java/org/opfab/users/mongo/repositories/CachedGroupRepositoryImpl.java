/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
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
import java.util.concurrent.ConcurrentHashMap;

import org.opfab.users.model.Group;
import org.opfab.users.repositories.GroupRepository;

public class CachedGroupRepositoryImpl implements GroupRepository {

    private MongoGroupRepository mongoGroupRepository;

    private ConcurrentHashMap<String, Group> cache = new ConcurrentHashMap<>();

    public CachedGroupRepositoryImpl(MongoGroupRepository mongoGroupRepository) {
        this.mongoGroupRepository = mongoGroupRepository;
    }

    @Override
    public List<Group> findAll() {
        return mongoGroupRepository.findAll();
    }

    @Override
    public Group insert(Group group) {
        if ( group != null ) {
            Group inserted = mongoGroupRepository.insert(group);
            cache.put(group.getId(), inserted);
            return inserted;
        }
        return null;

    }

    @Override
    public Group save(Group group) {
        Group saved = mongoGroupRepository.save(group);
        cache.put(group.getId(), saved);
        return saved;

    }

    public List<Group> saveAll(List<Group> groups) {

        List<Group> saved = mongoGroupRepository.saveAll(groups);
        saved.forEach(group -> cache.put(group.getId(), group));
        return saved;
    }

    @Override
    public Optional<Group> findById(String id) {
        Group cached = cache.get(id);

        if (cached != null)
            return Optional.of(cached);
        else {
            Optional<Group> found = mongoGroupRepository.findById(id);
            if (found.isPresent())
                cache.put(found.get().getId(), found.get());
            return found;
        }
    }

    @Override
    public void delete(Group group) {
        mongoGroupRepository.delete(group);
        cache.remove(group.getId());

    }

    @Override
    public void deleteAll() {
        mongoGroupRepository.deleteAll();
        cache.clear();

    }

    @Override
    public List<Group> findByPerimetersContaining(String perimeterContains) {
        return mongoGroupRepository.findByPerimetersContaining(perimeterContains);
    }

}
