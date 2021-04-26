package org.opfab.users.utils;

import lombok.extern.slf4j.Slf4j;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.users.model.Entity;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/*
This helper class presumes that stored Entities don't cycle (beware manual database updates)
 */
@Slf4j
public class EntityCycleDetector {

    static final String CYCLE_DETECTION = "A cycle has been detected: ";
    private final List<String> visitedId;
    private final Map<String, List<String>> graph;
    private final String currentEntityId;
    

    public EntityCycleDetector(Entity currentEntity, List<? extends Entity> allEntities) {
        this.currentEntityId = currentEntity.getId();
        Set<Entity> allEntitiesPlusNewOne = allEntities.stream()
                // allow update of an entity by removing its former version from inspected entities
                .filter(entity -> {
                    if (entity == null) return false;
                    return !entity.getId().equals(currentEntity.getId());
                })
                .collect(Collectors.toSet());
        allEntitiesPlusNewOne.add(currentEntity);
            this.graph = allEntitiesPlusNewOne.stream()
                    .collect(Collectors.toMap(Entity::getId
                                            , Entity::getParents));
        this.visitedId = new ArrayList<>(graph.size());
    }

    public void throwApiExceptionOnCycle() {
        if (hasCycle()) {
            String cycle = String.join("->", visitedId);
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message(CYCLE_DETECTION + cycle)
                            .build());
        }
    }
    // inspects only cycle introduce by new entity and stops on the first one detected
    public boolean hasCycle() {
        return hasCycle(this.currentEntityId, visitedId);
    }

    private boolean hasCycle(String entityId, List<String> visited) {
        if (visited.contains(entityId)){
            visited.add(entityId); // for error message clarity
            return true;
        }
        visited.add(entityId);
        if (graph.containsKey(entityId)) {
            for (String parentEntityId : graph.get(entityId)) {
                if (hasCycle(parentEntityId, visited)) return true;
            }
        }
        visited.remove(entityId);
        return false;
    }

}
