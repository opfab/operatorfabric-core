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
import org.opfab.users.model.*;
import org.opfab.users.rabbit.RabbitEventBus;
import org.opfab.users.repositories.PerimeterRepository;
import org.opfab.users.repositories.UserRepository;
import org.opfab.users.repositories.GroupRepository;
import org.opfab.users.services.NotificationService;
import org.opfab.users.services.PerimetersService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

@RestController
@RequestMapping("/perimeters")
public class PerimetersController implements PerimetersApi {

    private static final String NO_MATCHING_PERIMETER_ID_MSG = "Payload Perimeter id does not match URL Perimeter id";

    private PerimetersService perimetersService;

    public PerimetersController(PerimeterRepository perimeterRepository, GroupRepository groupRepository,
            UserRepository userRepository,
            RabbitEventBus rabbitEventBus) {
        NotificationService notificationService = new NotificationService(userRepository, rabbitEventBus);
        perimetersService = new PerimetersService(perimeterRepository, groupRepository, notificationService);
    }

    @Override
    public List<Perimeter> fetchPerimeters(HttpServletRequest request, HttpServletResponse response) throws Exception {
        return perimetersService.fetchPerimeters();
    }

    @Override
    public Perimeter fetchPerimeter(HttpServletRequest request, HttpServletResponse response, String perimeterId)
            throws Exception {
        OperationResult<Perimeter> operationResult = perimetersService.fetchPerimeter(perimeterId);
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
    public Perimeter createPerimeter(HttpServletRequest request, HttpServletResponse response, Perimeter perimeter)
            throws Exception {

        OperationResult<EntityCreationReport<Perimeter>> result = perimetersService.createPerimeter(perimeter);
        if (result.isSuccess()) {
            response.addHeader("Location", request.getContextPath() + "/perimeters/" + perimeter.getId());
            response.setStatus(201);
            return result.getResult().getEntity();
        } else
            throw createExceptionFromOperationResult(result);
    }

    @Override
    public Perimeter updatePerimeter(HttpServletRequest request, HttpServletResponse response, String perimeterId,
            Perimeter perimeter) throws Exception {

        // id from perimeter body parameter should match id path parameter
        if (!perimeter.getId().equals(perimeterId)) {
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message(NO_MATCHING_PERIMETER_ID_MSG)
                            .build());
        }
        OperationResult<EntityCreationReport<Perimeter>> result = perimetersService.updatePerimeter(perimeter);
        if (result.isSuccess()) {
            if (!result.getResult().isUpdate()) {
                response.addHeader("Location", request.getContextPath() + "/perimeters/" + perimeter.getId());
                response.setStatus(201);
            } else
                response.setStatus(200);
            return result.getResult().getEntity();
        } else
            throw createExceptionFromOperationResult(result);
    }

    @Override
    public Void deletePerimeter(HttpServletRequest request, HttpServletResponse response, String perimeterId)
            throws Exception {

        OperationResult<String> result = perimetersService.deletePerimeter(perimeterId);
        if (result.isSuccess())
            return null;
        else
            throw createExceptionFromOperationResult(result);
    }

    @Override
    public Void addPerimeterGroups(HttpServletRequest request, HttpServletResponse response, String perimeterId,
            List<String> groups) throws Exception {

        OperationResult<String> result = perimetersService.addPerimeterGroups(perimeterId, groups);
        if (result.isSuccess())
            return null;
        else
            throw createExceptionFromOperationResult(result);
    }

    @Override
    public Void updatePerimeterGroups(HttpServletRequest request, HttpServletResponse response, String perimeterId,
            List<String> groups) throws Exception {
        OperationResult<String> result = perimetersService.updatePerimeterGroups(perimeterId, groups);
        if (result.isSuccess())
            return null;
        else
            throw createExceptionFromOperationResult(result);
    }

    @Override
    public Void deletePerimeterGroups(HttpServletRequest request, HttpServletResponse response, String perimeterId)
            throws Exception {

        OperationResult<String> operationResult = perimetersService.deletePerimeterGroups(perimeterId);
        if (!operationResult.isSuccess())
            throw createExceptionFromOperationResult(operationResult);
        return null;

    }

    @Override
    public Void deletePerimeterGroup(HttpServletRequest request, HttpServletResponse response, String perimeterId,
            String groupId) throws Exception {

        OperationResult<String> operationResult = perimetersService.deletePerimeterGroup(perimeterId, groupId);
        if (!operationResult.isSuccess())
            throw createExceptionFromOperationResult(operationResult);
        return null;

    }

}
