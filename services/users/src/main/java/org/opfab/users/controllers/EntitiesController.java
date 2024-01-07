/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
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
import org.opfab.users.model.EntityCreationReport;
import org.opfab.users.model.Entity;
import org.opfab.users.model.OperationResult;
import org.opfab.utilities.eventbus.EventBus;
import org.opfab.users.repositories.EntityRepository;
import org.opfab.users.repositories.UserRepository;
import org.opfab.users.services.EntitiesService;
import org.opfab.users.services.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/entities")
public class EntitiesController {

    private static final String NO_MATCHING_ENTITY_ID_MSG = "Payload Entity id does not match URL Entity id";

    private EntitiesService entitiesService;

    public EntitiesController(EntityRepository entityRepository, UserRepository userRepository,
            EventBus eventBus) {
        this.entitiesService = new EntitiesService(entityRepository, userRepository,
                new NotificationService(userRepository, eventBus));
    }

    @GetMapping(produces = { "application/json" })
    public List<Entity> fetchEntities(HttpServletRequest request, HttpServletResponse response) {
        return entitiesService.fetchEntities();
    }

    @GetMapping(value = "/{id}", produces = { "application/json" })
    public Entity fetchEntity(HttpServletRequest request, HttpServletResponse response, @PathVariable("id") String id) {
        OperationResult<Entity> operationResult = entitiesService.fetchEntity(id);
        if (!operationResult.isSuccess())
            throw createExceptionFromOperationResult(operationResult);
        return operationResult.getResult();
    }

    private <S extends Object> ApiErrorException createExceptionFromOperationResult(
            OperationResult<S> operationResult) {
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

    @SuppressWarnings("java:S4684") // No security issue as each field of the object can be set via the API
    @PostMapping(produces = { "application/json" }, consumes = { "application/json" })
    public Entity createEntity(HttpServletRequest request, HttpServletResponse response,
            @Valid @RequestBody Entity entity)
            throws ApiErrorException {

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


    @SuppressWarnings("java:S4684") // No security issue as each field of the object can be set via the API
    @PutMapping(value = "/{id}", produces = { "application/json" }, consumes = {
            "application/json" })
    public Entity updateEntity(HttpServletRequest request, HttpServletResponse response, @PathVariable("id") String id,
            @Valid @RequestBody Entity entity)
            throws ApiErrorException {
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

    @DeleteMapping(value = "/{id}", produces = { "application/json" })
    public Void deleteEntity(HttpServletRequest request, HttpServletResponse response, @PathVariable("id") String id) {
        OperationResult<String> result = entitiesService.deleteEntity(id);
        if (result.isSuccess())
            return null;
        else
            throw createExceptionFromOperationResult(result);
    }

    @PatchMapping(value = "/{id}/users", produces = { "application/json" }, consumes = {
            "application/json" })
    public Void addEntityUsers(HttpServletRequest request, HttpServletResponse response, @PathVariable("id") String id,
            @Valid @RequestBody List<String> users) {
        OperationResult<String> result = entitiesService.addEntityUsers(id, users);
        if (result.isSuccess())
            return null;
        else
            throw createExceptionFromOperationResult(result);
    }

    @PutMapping(value = "/{id}/users", produces = { "application/json" }, consumes = {
            "application/json" })
    public Void updateEntityUsers(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("id") String id, @Valid @RequestBody List<String> users) {
        OperationResult<String> result = entitiesService.updateEntityUsers(id, users);
        if (result.isSuccess())
            return null;
        else
            throw createExceptionFromOperationResult(result);
    }

    @DeleteMapping(value = "/{id}/users", produces = { "application/json" })
    public Void deleteEntityUsers(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("id") String entityId) {

        OperationResult<String> operationResult = entitiesService.deleteEntityUsers(entityId);
        if (!operationResult.isSuccess())
            throw createExceptionFromOperationResult(operationResult);
        return null;
    }

    @DeleteMapping(value = "/{id}/users/{login}", produces = { "application/json" })
    public Void deleteEntityUser(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("id") String id, @PathVariable("login") String login) {

        OperationResult<String> operationResult = entitiesService.deleteEntityUser(id, login);
        if (!operationResult.isSuccess())
            throw createExceptionFromOperationResult(operationResult);
        return null;
    }
}