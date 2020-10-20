package org.lfenergy.operatorfabric.users.controllers;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.lfenergy.operatorfabric.users.model.Entity;
import org.springframework.http.HttpStatus;

import java.util.*;
import java.util.stream.Collectors;

/*
This helper class presumes that stored Entities don't cycle (beware manual database updates)
 */
@Slf4j
public class EntityCycleDetector {
    final private List<String> visitedId;
    final private Map<String, List<String>> graph;
    final private String currentEntityId;

    EntityCycleDetector(Entity currentEntity, List<? extends Entity> allEntities) {
        this.currentEntityId = currentEntity.getId();
        Set<Entity> allEntitiesPlusNewOne = allEntities.stream()
                // allow update of an entity by removing its former version from inspected entities
                .filter(entity -> {
                    if (entity == null) return false;
                    boolean idDifference = entity.getId().equals(currentEntity.getId());
                    boolean isNewEntity = entity.equals(currentEntity);
                    boolean isNotPreviousVersionOfTheUpdateEntity = !idDifference || isNewEntity;
                    return isNotPreviousVersionOfTheUpdateEntity;
                })
                .collect(Collectors.toSet());
        boolean genuineAddition = allEntitiesPlusNewOne.add(currentEntity);
        if (genuineAddition) {
            this.graph = allEntitiesPlusNewOne.stream()
                    .collect(Collectors.toMap(Entity::getId, entity -> entity.getParents()));
        } else {
            // no detection needed has entity identical to stored one
            this.graph = Collections.emptyMap();
        }
        this.visitedId = new ArrayList<>(graph.size());
    }

    void throwApiExceptionOnCycle() {
        if (hasCycle()) {
            String cycle = String.join("->", visitedId);
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message(EntitiesController.CYCLE_DETECTION + ": " + cycle)
                            .build());
        }
    }
    // inspects only cycle introduce by new entity and stops on the first one detected
    boolean hasCycle() {
        if(graph.isEmpty()) return false;// false entity update, i.e. stored and new one are identical
        return hasCycle(this.currentEntityId, visitedId);
    }

    private boolean hasCycle(String entityId, List<String> visited) {
        if (visited.contains(entityId)){
            visited.add(entityId); // for error message clarity
            return true;
        }
        visited.add(entityId);
        if (graph.containsKey(entityId)) {
            for (String childEntityId : graph.get(entityId)) {
                if (hasCycle(childEntityId, visited)) return true;
            }
        }
        visited.remove(entityId);
        return false;
    }

}
