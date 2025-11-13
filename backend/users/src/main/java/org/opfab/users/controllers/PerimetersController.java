/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.controllers;

import org.opfab.error.model.ApiError;
import org.opfab.error.model.ApiErrorException;
import org.opfab.useractiontracing.model.UserActionEnum;
import org.opfab.useractiontracing.repositories.LastUserActionRepository;
import org.opfab.useractiontracing.repositories.UserActionLogRepository;
import org.opfab.useractiontracing.services.UserActionLogService;
import org.opfab.users.configuration.authorization.UserExtractor;
import org.opfab.users.model.*;
import org.opfab.utilities.eventbus.EventBus;
import org.opfab.users.repositories.PerimeterRepository;
import org.opfab.users.repositories.UserRepository;
import org.opfab.users.repositories.GroupRepository;
import org.opfab.users.services.NotificationService;
import org.opfab.users.services.PerimetersService;
import org.springframework.beans.factory.annotation.Value;
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
@RequestMapping("/perimeters")
public class PerimetersController implements UserExtractor {

    private static final String NO_MATCHING_PERIMETER_ID_MSG = "Payload Perimeter id does not match URL Perimeter id";

    private PerimetersService perimetersService;
    private final UserActionLogService userActionLogService;

    private @Value("${operatorfabric.userActionLogActivated:true}") boolean userActionLogActivated;

    public PerimetersController(PerimeterRepository perimeterRepository, GroupRepository groupRepository,
            UserRepository userRepository, EventBus eventBus,
            UserActionLogRepository userActionLogRepository,
            LastUserActionRepository lastUserActionRepository) {
        NotificationService notificationService = new NotificationService(userRepository, eventBus);
        perimetersService = new PerimetersService(perimeterRepository, groupRepository, notificationService);
        this.userActionLogService = new UserActionLogService(userActionLogRepository, lastUserActionRepository);
    }

    @GetMapping(produces = { "application/json" })
    public List<Perimeter> fetchPerimeters(HttpServletRequest request, HttpServletResponse response)
            throws ApiErrorException {
        return perimetersService.fetchPerimeters();
    }

    @GetMapping(value = "/{id}", produces = { "application/json" })
    public Perimeter fetchPerimeter(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("id") String perimeterId)
            throws ApiErrorException {
        OperationResult<Perimeter> operationResult = perimetersService.fetchPerimeter(perimeterId);
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
                new ApiError(status, operationResult.getErrorMessage()));
    }

    @SuppressWarnings("java:S4684") // No security issue as each field of the object can be set via the API
    @PostMapping(produces = { "application/json" }, consumes = { "application/json" })
    public Perimeter createPerimeter(HttpServletRequest request, HttpServletResponse response,
            @Valid @RequestBody Perimeter perimeter)
            throws ApiErrorException {

        User user = this.extractUserFromJwtToken(request);

        OperationResult<EntityCreationReport<Perimeter>> result = perimetersService.savePerimeter(perimeter);
        if (result.isSuccess()) {
            if (!result.getResult().isUpdate()) {
                response.addHeader("Location", request.getContextPath() + "/perimeters/" + perimeter.getId());
                response.setStatus(201);
            } else
                response.setStatus(200);

            logUserAction(user.getLogin(), user.getEntities(), "Create perimeter " + perimeter.getId());

            return result.getResult().getEntity();
        } else
            throw createExceptionFromOperationResult(result);
    }

    @SuppressWarnings("java:S4684") // No security issue as each field of the object can be set via the API
    @PutMapping(value = "/{id}", produces = { "application/json" }, consumes = { "application/json" })
    public Perimeter updatePerimeter(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("id") String perimeterId,
            @Valid @RequestBody Perimeter perimeter) throws ApiErrorException {

        User user = this.extractUserFromJwtToken(request);

        // id from perimeter body parameter should match id path parameter
        if (!perimeter.getId().equals(perimeterId)) {
            throw new ApiErrorException(
                    new ApiError(HttpStatus.BAD_REQUEST, NO_MATCHING_PERIMETER_ID_MSG));
        }
        OperationResult<EntityCreationReport<Perimeter>> result = perimetersService.savePerimeter(perimeter);
        if (result.isSuccess()) {
            String comment = "Update perimeter ";

            if (!result.getResult().isUpdate()) {
                response.addHeader("Location", request.getContextPath() + "/perimeters/" + perimeter.getId());
                response.setStatus(201);
                comment = "Create perimeter ";
            } else
                response.setStatus(200);

            logUserAction(user.getLogin(), user.getEntities(), comment + perimeter.getId());

            return result.getResult().getEntity();
        } else
            throw createExceptionFromOperationResult(result);
    }

    @DeleteMapping(value = "/{id}", produces = { "application/json" })
    public Void deletePerimeter(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("id") String perimeterId)
            throws ApiErrorException {

        User user = this.extractUserFromJwtToken(request);

        OperationResult<String> result = perimetersService.deletePerimeter(perimeterId);
        if (result.isSuccess()) {
            logUserAction(user.getLogin(), user.getEntities(), "Delete perimeter " + perimeterId);
            return null;
        } else {
            throw createExceptionFromOperationResult(result);
        }
    }

    @PatchMapping(value = "/{id}/groups", produces = { "application/json" }, consumes = { "application/json" })
    public Void addPerimeterGroups(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("id") String perimeterId,
            @Valid @RequestBody List<String> groups) throws ApiErrorException {

        OperationResult<String> result = perimetersService.addPerimeterGroups(perimeterId, groups);
        if (result.isSuccess())
            return null;
        else
            throw createExceptionFromOperationResult(result);
    }

    @PutMapping(value = "/{id}/groups", produces = { "application/json" }, consumes = { "application/json" })
    public Void updatePerimeterGroups(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("id") String perimeterId,
            @Valid @RequestBody List<String> groups) throws ApiErrorException {
        User user = this.extractUserFromJwtToken(request);

        OperationResult<String> result = perimetersService.updatePerimeterGroups(perimeterId, groups);
        if (result.isSuccess()) {
            logUserAction(user.getLogin(), user.getEntities(),
                    "Update perimeter groups for perimeter " + perimeterId + " with groups " + groups);
            return null;
        } else {
            throw createExceptionFromOperationResult(result);
        }
    }

    @DeleteMapping(value = "/{id}/groups", produces = { "application/json" })
    public Void deletePerimeterGroups(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("id") String perimeterId)
            throws ApiErrorException {

        OperationResult<String> operationResult = perimetersService.deletePerimeterGroups(perimeterId);
        if (!operationResult.isSuccess())
            throw createExceptionFromOperationResult(operationResult);
        return null;

    }

    @DeleteMapping(value = "/{idPerimeter}/groups/{idGroup}", produces = { "application/json" })
    public Void deletePerimeterGroup(HttpServletRequest request, HttpServletResponse response,
            @PathVariable("idPerimeter") String perimeterId,
            @PathVariable("idGroup") String groupId) throws ApiErrorException {

        OperationResult<String> operationResult = perimetersService.deletePerimeterGroup(perimeterId, groupId);
        if (!operationResult.isSuccess())
            throw createExceptionFromOperationResult(operationResult);
        return null;
    }

    private void logUserAction(String login, List<String> entities, String comment) {
        if (userActionLogActivated) {
            userActionLogService.insertUserActionLog(login, UserActionEnum.USER, entities, null, comment);
        }
    }

}
