/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.opfab.users.model.Entity;
import org.opfab.users.model.EntityCreationReport;
import org.opfab.users.model.EntityData;
import org.opfab.users.model.OperationResult;
import org.opfab.users.model.UserData;
import org.opfab.users.repositories.EntityRepository;
import org.opfab.users.repositories.UserRepository;
import org.opfab.users.utils.EntityCycleDetector;
import org.opfab.users.utils.IdFormatChecker;

public class EntitiesService {

    private static final String ENTITY_NOT_FOUND_MSG = "Entity %s not found";
    private static final String BAD_USER_LIST_MSG = "Bad user list : user %s not found";
    private static final String USER_NOT_FOUND_MSG = "User %s not found";

    private UserService userService;
    private EntityRepository entityRepository;
    private UserRepository userRepository;

    public EntitiesService(EntityRepository entityRepository, UserRepository userRepository, UserService userService) {
        this.userService = userService;
        this.entityRepository = entityRepository;
        this.userRepository = userRepository;
    }

    public List<Entity> fetchEntities() {
        return entityRepository.findAll().stream().map(Entity.class::cast).toList();
    }

    public OperationResult<Entity> fetchEntity(String entityId) {
        Optional<EntityData> entity = entityRepository.findById(entityId);
        if (entity.isPresent())
            return new OperationResult<>(entity.get(), true, null, null);
        else
            return new OperationResult<>(null, false, OperationResult.ErrorType.NOT_FOUND,
                    String.format(ENTITY_NOT_FOUND_MSG, entityId));
    }

    public OperationResult<EntityCreationReport<Entity>> createEntity(Entity entity) {
        IdFormatChecker.IdCheckResult formatCheckResult = IdFormatChecker.check(entity.getId());
        if (formatCheckResult.isValid()) {
            synchronized (this) {
                List<Entity> entities = entityRepository.findAll().stream().map(Entity.class::cast).toList();
                EntityCycleDetector cycleChecker = new EntityCycleDetector(entity, entities);
                EntityCycleDetector.CycleCheckResult result = cycleChecker.getCycleDetectorResult();
                if (result.hasCycle()) {
                    return new OperationResult<>(null, false, OperationResult.ErrorType.BAD_REQUEST,
                            result.getMessage());
                }
            }
            boolean isAlreadyExisting = entityRepository.findById(entity.getId()).isPresent();
            EntityData newEntity = entityRepository.save((EntityData) entity);
            userService.publishUpdatedConfigMessage();
            EntityCreationReport<Entity> report = new EntityCreationReport<>(isAlreadyExisting, newEntity);
            return new OperationResult<>(report, true, null, null);
        } else
            return new OperationResult<>(null, false, OperationResult.ErrorType.BAD_REQUEST,
                    formatCheckResult.getErrorMessage());

    }

    public OperationResult<String> deleteEntity(String entityId) {
        Optional<EntityData> entity = entityRepository.findById(entityId);
        if (entity.isEmpty())
            return new OperationResult<>(null, false, OperationResult.ErrorType.NOT_FOUND,
                    String.format(ENTITY_NOT_FOUND_MSG, entityId));

        removeTheReferenceToTheEntityForMemberUsers(entityId);

        removeTheReferenceToTheEntityForChildEntities(entityId);

        entityRepository.delete(entity.get());
        userService.publishUpdatedConfigMessage();
        return new OperationResult<>(null, true, null, null);
    }

    // Remove the link between the entity and all its members (this link is in
    // "user" mongo collection)
    private void removeTheReferenceToTheEntityForMemberUsers(String idEntity) {
        List<UserData> foundUsers = userRepository.findByEntitiesContaining(idEntity);
        if (foundUsers != null && !foundUsers.isEmpty()) {
            for (UserData userData : foundUsers) {
                userData.deleteEntity(idEntity);
                userRepository.save(userData);
                userService.publishUpdatedUserMessage(userData.getLogin());
            }
        }
    }

    // Remove the link between the entity and all its child entities
    private void removeTheReferenceToTheEntityForChildEntities(String idEntity) {
        List<EntityData> foundChilds = entityRepository.findByParentsContaining(idEntity);
        if (foundChilds != null)
            for (EntityData childData : foundChilds) {
                List<String> parents = childData.getParents();
                parents.remove(idEntity);
                childData.setParents(parents);
                entityRepository.save(childData);
            }

    }

    public OperationResult<String> addEntityUsers(String entityId, List<String> users) {
        if (!entityRepository.findById(entityId).isPresent())
            return new OperationResult<>(null, false, OperationResult.ErrorType.NOT_FOUND,
                    String.format(ENTITY_NOT_FOUND_MSG, entityId));

        OperationResult<List<UserData>> foundUsersResult = retrieveUsers(users);
        if (foundUsersResult.isSuccess()) {
            List<UserData> foundUsers = foundUsersResult.getResult();
            for (UserData userData : foundUsers) {
                userData.addEntity(entityId);
                userRepository.save(userData);
                userService.publishUpdatedUserMessage(userData.getLogin());
            }
        } else
            return new OperationResult<>(null, false, foundUsersResult.getErrorType(),
                    foundUsersResult.getErrorMessage());
        return new OperationResult<>(null, true, null, entityId);
    }

    private OperationResult<List<UserData>> retrieveUsers(List<String> logins) {
        List<UserData> foundUsers = new ArrayList<>();
        for (String login : logins) {
            Optional<UserData> foundUser = userRepository.findById(login);
            if (foundUser.isEmpty())
                return new OperationResult<>(null, false, OperationResult.ErrorType.BAD_REQUEST,
                        String.format(BAD_USER_LIST_MSG, login));
            else
                foundUsers.add(foundUser.get());
        }
        return new OperationResult<>(foundUsers, true, null, null);
    }

    public OperationResult<String> updateEntityUsers(String entityId, List<String> users) {
        if (!entityRepository.findById(entityId).isPresent())
            return new OperationResult<>(null, false, OperationResult.ErrorType.NOT_FOUND,
                    String.format(ENTITY_NOT_FOUND_MSG, entityId));
        OperationResult<List<UserData>> foundUsersResult = retrieveUsers(users);
        if (foundUsersResult.isSuccess()) {
            List<UserData> formerlyBelongs = userRepository.findByEntitiesContaining(entityId);
            formerlyBelongs.forEach(user -> {
                if (!users.contains(user.getLogin())) {
                    user.deleteEntity(entityId);
                    userRepository.save(user);
                    userService.publishUpdatedUserMessage(user.getLogin());
                }
            });
            addEntityUsers(entityId, users);
        } else
            return new OperationResult<>(null, false, foundUsersResult.getErrorType(),
                    foundUsersResult.getErrorMessage());

        return new OperationResult<>(null, true, null, null);
    }

    public OperationResult<String> deleteEntityUsers(String entityId) {
        if (!entityRepository.findById(entityId).isPresent())
            return new OperationResult<>(null, false, OperationResult.ErrorType.NOT_FOUND,
                    String.format(ENTITY_NOT_FOUND_MSG, entityId));
        removeTheReferenceToTheEntityForMemberUsers(entityId);
        userService.publishUpdatedGroupMessage(entityId);
        return new OperationResult<>(null, true, null, entityId);
    }

    public OperationResult<String> deleteEntityUser(String entityId, String login) {
        if (!entityRepository.findById(entityId).isPresent())
            return new OperationResult<>(null, false, OperationResult.ErrorType.NOT_FOUND,
                    String.format(ENTITY_NOT_FOUND_MSG, entityId));

        Optional<UserData> foundUser = userRepository.findById(login);
        if (foundUser.isEmpty()) {
            return new OperationResult<>(null, false, OperationResult.ErrorType.NOT_FOUND,
                    String.format(USER_NOT_FOUND_MSG, login));
        }

        foundUser.get().deleteEntity(entityId);
        userRepository.save(foundUser.get());
        userService.publishUpdatedUserMessage(foundUser.get().getLogin());

        return new OperationResult<>(null, true, null, "");
    }
}
