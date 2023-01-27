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

import org.opfab.users.model.Entity;
import org.opfab.users.model.EntityData;
import org.opfab.users.repositories.EntityRepository;
import org.springframework.stereotype.Service;

@Service
public class EntityRepositoryImpl implements EntityRepository {

    MongoEntityRepository mongoEntityRepository;

    public EntityRepositoryImpl(MongoEntityRepository mongoEntityRepository) {
        this.mongoEntityRepository = mongoEntityRepository;
    }

    public List<Entity> findAll() {
        return mongoEntityRepository.findAll().stream().map(Entity.class::cast).toList();
    }

    public Entity insert(Entity entity) {
        return mongoEntityRepository.insert((EntityData) entity);
    }

    public Entity save(Entity entity) {
        return mongoEntityRepository.save((EntityData) entity);
    }

    public Optional<Entity> findById(String id) {
        return mongoEntityRepository.findById(id).map(Entity.class::cast);
    }

    public void delete(Entity entity) {
        mongoEntityRepository.delete((EntityData) entity);
    }

    public void deleteAll() {
        mongoEntityRepository.deleteAll();
    }

    public List<Entity> findByParentsContaining(String entityId) {
        return mongoEntityRepository.findByParentsContaining(entityId).stream().map(Entity.class::cast).toList();
    }

}
