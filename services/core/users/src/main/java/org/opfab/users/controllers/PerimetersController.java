/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
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
import org.opfab.users.repositories.PerimeterRepository;
import org.opfab.users.repositories.GroupRepository;
import org.opfab.users.services.UserServiceImp;
import org.opfab.users.model.GroupData;
import org.opfab.users.model.PerimeterData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * PerimetersController, documented at {@link PerimetersApi}
 *
 */
@RestController
@RequestMapping("/perimeters")
public class PerimetersController implements PerimetersApi {

    public static final String PERIMETER_NOT_FOUND_MSG = "Perimeter %s not found";
    public static final String GROUP_NOT_FOUND_MSG = "Group %s not found";
    public static final String BAD_GROUP_LIST_MSG = "Bad group list : group %s not found";
    public static final String NO_MATCHING_PERIMETER_ID_MSG = "Payload Perimeter id does not match URL Perimeter id";
    public static final String DUPLICATE_STATE_IN_PERIMETER = "Bad stateRights list : there is one or more duplicate state(s) in the perimeter";
    @Autowired
    private PerimeterRepository perimeterRepository;
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private UserServiceImp userService;

    @Override
    public Void addPerimeterGroups(HttpServletRequest request, HttpServletResponse response, String id, List<String> groups) throws Exception {

        //Only existing perimeters can be updated
        findPerimeterOrThrow(id);

        //Retrieve groups from repository for groups list, throwing an error if a group id is not found
        List<GroupData> foundGroups = retrieveGroups(groups);

        for (GroupData groupData : foundGroups) {
            groupData.addPerimeter(id);
            userService.publishUpdatedGroupMessage(groupData.getId());
        }
        groupRepository.saveAll(foundGroups);
        return null;
    }

    @Override
    public Perimeter createPerimeter(HttpServletRequest request, HttpServletResponse response, Perimeter perimeter) throws Exception {
        if(perimeterRepository.findById(perimeter.getId()).orElse(null) == null){

            if(! userService.isEachStateUniqueInPerimeter(perimeter)){
                throw new ApiErrorException(
                        ApiError.builder()
                                .status(HttpStatus.BAD_REQUEST)
                                .message(DUPLICATE_STATE_IN_PERIMETER)
                                .build());
            }
            response.addHeader("Location", request.getContextPath() + "/perimeters/" + perimeter.getId());
            response.setStatus(201);
            return perimeterRepository.save((PerimeterData)perimeter);
        }
        else
            throw new DuplicateKeyException("Duplicate key : " + perimeter.getId());
    }

    @Override
    public Void deletePerimeterGroups(HttpServletRequest request, HttpServletResponse response, String id) throws Exception {

        // Only existing perimeters can be updated
        findPerimeterOrThrow(id);

        // We delete the links between the groups that contain the perimeter, and the perimeter
        removeTheReferenceToThePerimeterForConcernedGroups(id);
        return null;
    }

    @Override
    public Void deletePerimeterGroup(HttpServletRequest request, HttpServletResponse response, String idParameter, String idGroup) throws Exception {

        //Only existing perimeters can be updated
        findPerimeterOrThrow(idParameter);

        //Retrieve group from repository for idGroup, throwing an error if idGroup is not found
        GroupData foundGroup = groupRepository.findById(idGroup).orElseThrow(()->new ApiErrorException(
                ApiError.builder()
                        .status(HttpStatus.NOT_FOUND)
                        .message(String.format(GROUP_NOT_FOUND_MSG, idGroup))
                        .build()
        ));

        if (foundGroup != null) {
            foundGroup.deletePerimeter(idParameter);

            userService.publishUpdatedGroupMessage(foundGroup.getId());
            groupRepository.save(foundGroup);
        }
        return null;
    }

    @Override
    public List<? extends Perimeter> fetchPerimeters(HttpServletRequest request, HttpServletResponse response) throws Exception {
        return perimeterRepository.findAll();
    }

    @Override
    public Perimeter fetchPerimeter(HttpServletRequest request, HttpServletResponse response, String id) throws Exception {
        return perimeterRepository.findById(id).orElseThrow(
                ()-> new ApiErrorException(
                        ApiError.builder()
                                .status(HttpStatus.NOT_FOUND)
                                .message(String.format(PERIMETER_NOT_FOUND_MSG, id))
                                .build()
                )
        );
    }

    @Override
    public Perimeter updatePerimeter(HttpServletRequest request, HttpServletResponse response, String id, Perimeter perimeter) throws Exception {
        //id from perimeter body parameter should match id path parameter
        if (!perimeter.getId().equals(id)){
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message(NO_MATCHING_PERIMETER_ID_MSG)
                            .build());
        }
        else if (! userService.isEachStateUniqueInPerimeter(perimeter)){
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message(DUPLICATE_STATE_IN_PERIMETER)
                            .build());
        }
        else {
            if (perimeterRepository.findById(perimeter.getId()).orElse(null) == null)
                response.setStatus(201);
            else
                response.setStatus(200);

            response.addHeader("Location", request.getContextPath() + "/perimeters/" + perimeter.getId());

            //Retrieve groups from repository
            List<GroupData> foundGroups = groupRepository.findByPerimetersContaining(id);
            if (foundGroups != null) {
                for (GroupData groupData : foundGroups) {
                    userService.publishUpdatedGroupMessage(groupData.getId());
                }
            }
            return perimeterRepository.save((PerimeterData)perimeter);
        }
    }

    @Override
    public Void updatePerimeterGroups(HttpServletRequest request, HttpServletResponse response, String id, List<String> groups) throws Exception {

        //Only existing perimeters can be updated
        findPerimeterOrThrow(id);

        List<GroupData> formerlyBelongs = groupRepository.findByPerimetersContaining(id);
        List<String> newGroupsInPerimeter = new ArrayList<>(groups);

        //Make sure the intended updated groups list only contains group ids existing in the repository, throwing an error if this is not the case
        retrieveGroups(groups);

        List<GroupData> toUpdate =
                formerlyBelongs.stream()
                        .filter(g->!groups.contains(g.getId()))
                        .peek(g-> {
                            g.deletePerimeter(id);
                            newGroupsInPerimeter.remove(g.getId());
                            //Send a user config change event for all users that are updated because they're removed from the group
                            userService.publishUpdatedGroupMessage(g.getId());
                        }).collect(Collectors.toList());

        groupRepository.saveAll(toUpdate);
        //For groups that are added to the perimeter, the event will be published by addPerimeterGroups.
        addPerimeterGroups(request, response, id, newGroupsInPerimeter);
        return null;
    }

    @Override
    public Void deletePerimeter(HttpServletRequest request, HttpServletResponse response, String id) throws Exception {

        // Only existing perimeter can be deleted
        PerimeterData foundPerimeterData = findPerimeterOrThrow(id);

        // First we have to delete the links between the groups that contain the perimeter to delete, and the perimeter
        removeTheReferenceToThePerimeterForConcernedGroups(id);

        // Then we can delete the perimeter
        perimeterRepository.delete(foundPerimeterData);
        return null;
    }

    // Remove the link between the perimeter and the groups that own this perimeter (this link is in "group" mongo collection)
    private void removeTheReferenceToThePerimeterForConcernedGroups(String idPerimeter) {

        List<GroupData> foundGroups = groupRepository.findByPerimetersContaining(idPerimeter);

        if (foundGroups != null) {
            for (GroupData groupData : foundGroups) {
                groupData.deletePerimeter(idPerimeter);
                userService.publishUpdatedGroupMessage(groupData.getId());
            }
            groupRepository.saveAll(foundGroups);
        }
    }

    private PerimeterData findPerimeterOrThrow(String id) {
        return perimeterRepository.findById(id).orElseThrow(
                ()-> new ApiErrorException(
                        ApiError.builder()
                                .status(HttpStatus.NOT_FOUND)
                                .message(String.format(PERIMETER_NOT_FOUND_MSG, id))
                                .build()
                ));
    }

    /** Retrieve groups from repository for groups list, throwing an error if a group id is not found
     * */
    private List<GroupData> retrieveGroups(List<String> groupIds) {

        List<GroupData> foundGroups = new ArrayList<>();
        for(String id : groupIds){
            GroupData foundGroup = groupRepository.findById(id).orElseThrow(
                    () -> new ApiErrorException(
                            ApiError.builder()
                                    .status(HttpStatus.BAD_REQUEST)
                                    .message(String.format(BAD_GROUP_LIST_MSG, id))
                                    .build()
                    ));
            foundGroups.add(foundGroup);
        }
        return foundGroups;
    }
}
