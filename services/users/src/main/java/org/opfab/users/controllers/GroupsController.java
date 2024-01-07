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
import org.opfab.users.model.*;
import org.opfab.utilities.eventbus.EventBus;
import org.opfab.users.repositories.GroupRepository;
import org.opfab.users.repositories.PerimeterRepository;
import org.opfab.users.repositories.UserRepository;
import org.opfab.users.services.GroupsService;
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
@RequestMapping("/groups")
public class GroupsController {

    private static final String NO_MATCHING_GROUP_ID_MSG = "Payload Group id does not match URL Group id";

    private GroupsService groupsService;

    public GroupsController(GroupRepository groupRepository, UserRepository userRepository,
            PerimeterRepository perimeterRepository, EventBus eventBus) {
        NotificationService notificationService = new NotificationService(userRepository, eventBus);
        this.groupsService = new GroupsService(groupRepository, userRepository, perimeterRepository,
                notificationService);
    }

    @GetMapping(produces = { "application/json" })
    public List<Group> fetchGroups(HttpServletRequest request, HttpServletResponse response) {
        return groupsService.fetchGroups();
    }

    @GetMapping(value = "/{id}", produces = { "application/json" })
    public Group fetchGroup(HttpServletRequest request, HttpServletResponse response, @PathVariable("id") String id) throws ApiErrorException {
        OperationResult<Group> operationResult = groupsService.fetchGroup(id);
        if (!operationResult.isSuccess())
            throw createExceptionFromOperationResult(operationResult);
        return operationResult.getResult();
    }

    private <S extends Object> ApiErrorException createExceptionFromOperationResult(OperationResult<S> operationResult) {
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
    public Group createGroup(HttpServletRequest request, HttpServletResponse response, @Valid @RequestBody Group group)
            throws ApiErrorException {
        OperationResult<EntityCreationReport<Group>> result = groupsService.createGroup(group);
        if (result.isSuccess()) {
            if (!result.getResult().isUpdate()) {
                response.addHeader("Location", request.getContextPath() + "/groups/" + group.getId());
                response.setStatus(201);
            }
            return result.getResult().getEntity();
        } else
            throw createExceptionFromOperationResult(result);
    }

    @SuppressWarnings("java:S4684") // No security issue as each field of the object can be set via the API
    @PutMapping(value = "/{id}", produces = { "application/json" }, consumes = { "application/json" })
    public Group updateGroup(HttpServletRequest request, HttpServletResponse response, @PathVariable("id") String id,
            @Valid @RequestBody Group group) {
        // id from group body parameter should match id path parameter
        if (!group.getId().equals(id)) {
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message(NO_MATCHING_GROUP_ID_MSG)
                            .build());
        } else {
            return createGroup(request, response, group);
        }
    }

    @DeleteMapping(value = "/{id}", produces = { "application/json" })
    public Void deleteGroup(HttpServletRequest request, HttpServletResponse response, @PathVariable("id") String id)
            throws ApiErrorException{
        OperationResult<String> result = groupsService.deleteGroup(id);
        if (result.isSuccess())
            return null;
        else
            throw createExceptionFromOperationResult(result);
    }

    @PatchMapping(value = "/{id}/users", produces = { "application/json" }, consumes = { "application/json" })
    public Void addGroupUsers(HttpServletRequest request, HttpServletResponse response, @PathVariable("id") String id,
            @Valid @RequestBody List<String> users) throws ApiErrorException {
        OperationResult<String> result = groupsService.addGroupUsers(id, users);
        if (result.isSuccess())
            return null;
        else
            throw createExceptionFromOperationResult(result);
    }

    @DeleteMapping(value = "/{id}/users", produces = { "application/json" })
    public Void deleteGroupUsers(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("id") String groupId) throws ApiErrorException {
        OperationResult<String> operationResult = groupsService.deleteGroupUsers(groupId);
        if (!operationResult.isSuccess())
            throw createExceptionFromOperationResult(operationResult);
        return null;
    }

    @DeleteMapping(value = "/{id}/users/{login}", produces = { "application/json" })
    public Void deleteGroupUser(HttpServletRequest request, HttpServletResponse response, @PathVariable("id") String id,
            @PathVariable("login") String login) throws ApiErrorException {
        OperationResult<String> operationResult = groupsService.deleteGroupUser(id, login);
        if (!operationResult.isSuccess())
            throw createExceptionFromOperationResult(operationResult);
        return null;
    }

    @PutMapping(value = "/{id}/users", produces = { "application/json" }, consumes = { "application/json" })
    public Void updateGroupUsers(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("id") String id, @Valid @RequestBody List<String> users) throws ApiErrorException {
        OperationResult<String> result = groupsService.updateGroupUsers(id, users);
        if (result.isSuccess())
            return null;
        else
            throw createExceptionFromOperationResult(result);
    }

    @GetMapping(value = "/{id}/perimeters", produces = { "application/json" })
    public List<Perimeter> fetchGroupPerimeters(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("id") String id) throws ApiErrorException {
        OperationResult<List<Perimeter>> result = groupsService.fetchGroupPerimeters(id);
        if (result.isSuccess())
            return result.getResult();
        else
            throw createExceptionFromOperationResult(result);
    }

    @PutMapping(value = "/{id}/perimeters", produces = { "application/json" }, consumes = { "application/json" })
    public Void updateGroupPerimeters(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("id") String id, @Valid @RequestBody List<String> perimeters) throws ApiErrorException {
        OperationResult<String> result = groupsService.updateGroupPerimeters(id, perimeters);
        if (result.isSuccess())
            return null;
        else
            throw createExceptionFromOperationResult(result);
    }

    @PatchMapping(value = "/{id}/perimeters", produces = { "application/json" }, consumes = { "application/json" })
    public Void addGroupPerimeters(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("id") String id, @Valid @RequestBody List<String> perimeters) throws ApiErrorException {
        OperationResult<String> result = groupsService.addGroupPerimeters(id, perimeters);
        if (result.isSuccess())
            return null;
        else
            throw createExceptionFromOperationResult(result);
    }
}
