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

import org.opfab.users.model.Entity;
import org.opfab.users.model.EntityData;
import org.opfab.users.repositories.EntityRepository;

public class EntityRepositoryStub implements EntityRepository {

    Map<String, Entity> entities = new HashMap<>();

    @Override
    public List<Entity> findAll() {
        return entities.values().stream().map(entity -> cloneEntity(entity)).toList();
    }

    @Override
    public EntityData insert(Entity entity) {
        entities.put(entity.getId(), cloneEntity(entity));
        return null;
    }

    @Override
    public Entity save(Entity entity) {
        entities.put(entity.getId(), cloneEntity(entity));
        return entity;
    }

    @Override
    public Optional<Entity> findById(String id) {
        Entity entity = entities.get(id);
        if (entity == null)
            return Optional.empty();
        return Optional.of(cloneEntity(entity));
    }

    @Override
    public void delete(Entity entity) {
        entities.remove(entity.getId());
    }

    @Override
    public void deleteAll() {
        entities.clear();

    }

    @Override
    public List<Entity> findByParentsContaining(String entityId) {
        List<Entity> childEntities = new ArrayList<>();
        entities.values().forEach((entity) -> {
            if (entity.getParents().contains(entityId)) {
                childEntities.add(cloneEntity(entity));
            }
        });
        return childEntities;

    }

    // Use this method to create copy of an entity to avoid
    // test code modifying repository data directly (without calling repository
    // methods)
    private Entity cloneEntity(Entity entity) {
        return (new EntityData((EntityData) entity));
    }

}
