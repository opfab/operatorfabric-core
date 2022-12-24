/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.controllers;

import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.users.model.Entity;
import org.opfab.users.model.EntityCreationReport;
import org.opfab.users.model.OperationResult;
import org.opfab.users.rabbit.RabbitEventBus;
import org.opfab.users.repositories.EntityRepository;
import org.opfab.users.repositories.UserRepository;
import org.opfab.users.services.EntitiesService;
import org.opfab.users.services.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;

@RestController
@RequestMapping("/entities")
public class EntitiesController implements EntitiesApi {

    public static final String ENTITY_NOT_FOUND_MSG = "Entity %s not found";
    public static final String USER_NOT_FOUND_MSG = "User %s not found";
    public static final String BAD_USER_LIST_MSG = "Bad user list : user %s not found";
    public static final String NO_MATCHING_ENTITY_ID_MSG = "Payload Entity id does not match URL Entity id";

    private EntitiesService entitiesService;

    public EntitiesController(EntityRepository entityRepository, UserRepository userRepository,
            RabbitEventBus eventBus) {
        this.entitiesService = new EntitiesService(entityRepository, userRepository, new NotificationService(userRepository, eventBus));
    }

    @Override
    public List<Entity> fetchEntities(HttpServletRequest request, HttpServletResponse response) throws Exception {
        return entitiesService.fetchEntities();
    }

    @Override
    public Entity fetchEntity(HttpServletRequest request, HttpServletResponse response, String id) throws Exception {
        OperationResult<Entity> operationResult = entitiesService.fetchEntity(id);
        if (!operationResult.isSuccess())
            throw createExceptionFromOperationResult(operationResult);
        return operationResult.getResult();
    }

    private <S extends Object> Exception createExceptionFromOperationResult(OperationResult<S> operationResult) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (operationResult.getErrorType().equals(OperationResult.ErrorType.NOT_FOUND))
            status = HttpStatus.NOT_FOUND;
        if (operationResult.getErrorType().equals(OperationResult.ErrorType.BAD_REQUEST))
            status = HttpStatus.BAD_REQUEST;
        return new ApiErrorException(
                ApiError.builder()
                        .status(status)
                        .message(operationResult.getErrorMessage())
                        .build());
    }

    @Override
    public Entity createEntity(HttpServletRequest request, HttpServletResponse response, Entity entity)
            throws Exception {

        OperationResult<EntityCreationReport<Entity>> result = entitiesService.createEntity(entity);
        if (result.isSuccess()) {
            if (!result.getResult().isUpdate()) {
                response.addHeader("Location", request.getContextPath() + "/entities/" + entity.getId());
                response.setStatus(201);
            }
            return result.getResult().getEntity();
        } else
            throw createExceptionFromOperationResult(result);
    }

    @Override
    public Entity updateEntity(HttpServletRequest request, HttpServletResponse response, String id, Entity entity)
            throws Exception {
        // id from entity body parameter should match id path parameter
        if (!entity.getId().equals(id)) {
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message(NO_MATCHING_ENTITY_ID_MSG)
                            .build());
        } else {
            return createEntity(request, response, entity);
        }
    }

    @Override
    public Void deleteEntity(HttpServletRequest request, HttpServletResponse response, String id) throws Exception {
        OperationResult<String> result = entitiesService.deleteEntity(id);
        if (result.isSuccess())
            return null;
        else
            throw createExceptionFromOperationResult(result);
    }

    @Override
    public Void addEntityUsers(HttpServletRequest request, HttpServletResponse response, String id, List<String> users)
            throws Exception {
        OperationResult<String> result = entitiesService.addEntityUsers(id, users);
        if (result.isSuccess())
            return null;
        else
            throw createExceptionFromOperationResult(result);
    }

    @Override
    public Void updateEntityUsers(HttpServletRequest request, HttpServletResponse response, String id,
            List<String> users) throws Exception {
        OperationResult<String> result = entitiesService.updateEntityUsers(id, users);
        if (result.isSuccess())
            return null;
        else
            throw createExceptionFromOperationResult(result);
    }

    @Override
    public Void deleteEntityUsers(HttpServletRequest request, HttpServletResponse response, String entityId)
            throws Exception {

        OperationResult<String> operationResult = entitiesService.deleteEntityUsers(entityId);
        if (!operationResult.isSuccess())
            throw createExceptionFromOperationResult(operationResult);
        return null;
    }

    @Override
    public Void deleteEntityUser(HttpServletRequest request, HttpServletResponse response, String id, String login)
            throws Exception {

        OperationResult<String> operationResult = entitiesService.deleteEntityUser(id, login);
        if (!operationResult.isSuccess())
            throw createExceptionFromOperationResult(operationResult);
        return null;
    }
}