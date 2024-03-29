
/* Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.users.utils;

import org.opfab.users.model.Entity;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/*
This helper class presumes that stored Entities don't cycle (beware manual database updates)
 */
public class EntityCycleDetector {

    static final String CYCLE_DETECTION = "A cycle has been detected: ";
    private final List<String> visitedId;
    private final Map<String, List<String>> graph;
    private final String currentEntityId;

    public EntityCycleDetector(Entity currentEntity, List<Entity> allEntities) {
        this.currentEntityId = currentEntity.getId();
        Set<Entity> allEntitiesPlusNewOne = allEntities.stream()
                // allow update of an entity by removing its former version from inspected
                // entities
                .filter(entity -> {
                    if (entity == null)
                        return false;
                    return !entity.getId().equals(currentEntity.getId());
                })
                .collect(Collectors.toSet());
        allEntitiesPlusNewOne.add(currentEntity);
        this.graph = allEntitiesPlusNewOne.stream()
                .collect(Collectors.toMap(Entity::getId, Entity::getParents));
        this.visitedId = new ArrayList<>(graph.size());
    }


    // inspects only cycle introduce by new entity and stops on the first one
    // detected
    public boolean hasCycle() {
        return hasCycle(this.currentEntityId, visitedId);
    }

    private boolean hasCycle(String entityId, List<String> visited) {
        if (visited.contains(entityId)) {
            visited.add(entityId); // for error message clarity
            return true;
        }
        visited.add(entityId);
        if (graph.containsKey(entityId)) {
            for (String parentEntityId : graph.get(entityId)) {
                if (hasCycle(parentEntityId, visited))
                    return true;
            }
        }
        visited.remove(entityId);
        return false;
    }

    public CycleCheckResult getCycleDetectorResult() {
        boolean cycle = hasCycle(this.currentEntityId, visitedId);
        if (cycle)
            return new CycleCheckResult(cycle, CYCLE_DETECTION + String.join("->", visitedId));
        return new CycleCheckResult(false, null);
    }

    public static class CycleCheckResult {
        private boolean cycle;
        private String message;

        public CycleCheckResult(boolean cycle, String message) {
            this.cycle = cycle;
            this.message = message;
        }

        public boolean hasCycle() {
            return cycle;
        }

        public String getMessage() {
            return message;
        }
    }

}
