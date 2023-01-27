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
import org.opfab.users.repositories.GroupRepository;
import org.opfab.users.repositories.PerimeterRepository;
import org.opfab.users.repositories.UserRepository;
import org.opfab.users.services.GroupsService;
import org.opfab.users.services.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;

@RestController
@RequestMapping("/groups")
public class GroupsController implements GroupsApi {

    private static final String NO_MATCHING_GROUP_ID_MSG = "Payload Group id does not match URL Group id";
    
    private GroupsService groupsService; 

    public GroupsController(GroupRepository groupRepository,UserRepository userRepository,PerimeterRepository perimeterRepository,RabbitEventBus rabbitEventBus) {
        NotificationService notificationService = new NotificationService(userRepository, rabbitEventBus);
        this.groupsService = new GroupsService(groupRepository, userRepository, perimeterRepository, notificationService);
    }

    @Override
    public List<Group> fetchGroups(HttpServletRequest request, HttpServletResponse response) throws Exception {
        return groupsService.fetchGroups();
    }

    @Override
    public Group fetchGroup(HttpServletRequest request, HttpServletResponse response, String id) throws Exception {
        OperationResult<Group>  operationResult = groupsService.fetchGroup(id);
        if (!operationResult.isSuccess()) throw createExceptionFromOperationResult(operationResult);
        return operationResult.getResult();
    }

    private  <S extends Object>  Exception createExceptionFromOperationResult(OperationResult<S> operationResult) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (operationResult.getErrorType().equals(OperationResult.ErrorType.NOT_FOUND)) status = HttpStatus.NOT_FOUND;
        if (operationResult.getErrorType().equals(OperationResult.ErrorType.BAD_REQUEST)) status = HttpStatus.BAD_REQUEST;
        return  new ApiErrorException(
            ApiError.builder()
                    .status(status)
                    .message(operationResult.getErrorMessage())
                    .build());
    } 

    @Override
    public Group createGroup(HttpServletRequest request, HttpServletResponse response, Group group) throws Exception {
        OperationResult<EntityCreationReport<Group>> result = groupsService.createGroup(group);
        if (result.isSuccess()) {
            if (!result.getResult().isUpdate()) {
                response.addHeader("Location", request.getContextPath() + "/groups/" + group.getId());
                response.setStatus(201);
            }
            return result.getResult().getEntity();
        }
        else throw  createExceptionFromOperationResult(result);
    }


    @Override
    public Group updateGroup(HttpServletRequest request, HttpServletResponse response, String id, Group group) throws Exception {
        //id from group body parameter should match id path parameter
        if(!group.getId().equals(id)){
            throw new ApiErrorException(
                ApiError.builder()
                        .status(HttpStatus.BAD_REQUEST)
                        .message(NO_MATCHING_GROUP_ID_MSG)
                        .build());
        } else {
            return createGroup(request,response,group);
        }
    }

    @Override
    public Void deleteGroup(HttpServletRequest request, HttpServletResponse response, String id) throws Exception {
        OperationResult<String> result = groupsService.deleteGroup(id);
        if (result.isSuccess()) return null;
        else throw  createExceptionFromOperationResult(result);
    }

    @Override
    public Void addGroupUsers(HttpServletRequest request, HttpServletResponse response, String id, List<String> users) throws Exception {
        OperationResult<String> result = groupsService.addGroupUsers(id, users);
        if (result.isSuccess()) return null;
        else throw  createExceptionFromOperationResult(result);
    }

    @Override
    public Void deleteGroupUsers(HttpServletRequest request, HttpServletResponse response, String groupId) throws Exception {
        OperationResult<String> operationResult = groupsService.deleteGroupUsers(groupId);
        if (!operationResult.isSuccess()) throw createExceptionFromOperationResult(operationResult);
        return null;
    }

    @Override
    public Void deleteGroupUser(HttpServletRequest request, HttpServletResponse response, String id, String login) throws Exception {
        OperationResult<String> operationResult =  groupsService.deleteGroupUser(id, login);
        if (!operationResult.isSuccess()) throw createExceptionFromOperationResult(operationResult);
        return null;
    }

    @Override
    public Void updateGroupUsers(HttpServletRequest request, HttpServletResponse response, String id, List<String> users) throws Exception {
        OperationResult<String> result = groupsService.updateGroupUsers(id, users);
        if (result.isSuccess()) return null;
        else throw  createExceptionFromOperationResult(result);
    }

    @Override
    public List<Perimeter> fetchGroupPerimeters(HttpServletRequest request, HttpServletResponse response, String id) throws Exception{
        OperationResult<List<Perimeter>> result = groupsService.fetchGroupPerimeters(id);
        if (result.isSuccess()) return result.getResult();
        else throw  createExceptionFromOperationResult(result);
    }

    @Override
    public Void updateGroupPerimeters(HttpServletRequest request, HttpServletResponse response, String id, List<String> perimeters) throws Exception{
        OperationResult<String> result = groupsService.updateGroupPerimeters(id, perimeters);
        if (result.isSuccess()) return null;
        else throw  createExceptionFromOperationResult(result);
    }

    @Override
    public Void addGroupPerimeters(HttpServletRequest request, HttpServletResponse response, String id, List<String> perimeters) throws Exception{
        OperationResult<String> result = groupsService.addGroupPerimeters(id, perimeters);
        if (result.isSuccess()) return null;
        else throw  createExceptionFromOperationResult(result);
    }
}
