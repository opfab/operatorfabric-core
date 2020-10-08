/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.users.controllers;

import org.lfenergy.operatorfabric.springtools.configuration.oauth.UpdatedUserEvent;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.lfenergy.operatorfabric.users.model.*;
import org.lfenergy.operatorfabric.users.repositories.GroupRepository;
import org.lfenergy.operatorfabric.users.repositories.PerimeterRepository;
import org.lfenergy.operatorfabric.users.repositories.UserRepository;
import org.lfenergy.operatorfabric.users.services.UserServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.bus.ServiceMatcher;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;


/**
 * GroupsController, documented at {@link GroupsApi}
 *
 */
@RestController
@RequestMapping("/groups")
public class GroupsController implements GroupsApi {

    public static final String GROUP_NOT_FOUND_MSG = "Group %s not found";
    public static final String USER_NOT_FOUND_MSG = "User %s not found";
    public static final String BAD_USER_LIST_MSG = "Bad user list : user %s not found";
    public static final String BAD_PERIMETER_LIST_MSG = "Bad perimeter list : perimeter %s not found";
    public static final String NO_MATCHING_GROUP_ID_MSG = "Payload Group id does not match URL Group id";
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PerimeterRepository perimeterRepository;
    @Autowired
    private UserServiceImp userService;

    /* These are Spring Cloud Bus beans used to fire an event (UpdatedUserEvent) every time a user is modified.
    *  Other services handle this event by clearing their user cache for the given user. See issue #64*/
    @Autowired
    private ServiceMatcher busServiceMatcher;
    @Autowired
    private ApplicationEventPublisher publisher;

    @Override
    public Void addGroupUsers(HttpServletRequest request, HttpServletResponse response, String id, List<String> users) throws Exception {

        //Only existing groups can be updated
        findGroupOrThrow(id);

        //Retrieve users from repository for users list, throwing an error if a login is not found
        List<UserData> foundUsers = retrieveUsers(users);

        for (UserData userData : foundUsers) {
            userData.addGroup(id);
            publisher.publishEvent(new UpdatedUserEvent(this, busServiceMatcher.getServiceId(), userData.getLogin()));
        }
        userRepository.saveAll(foundUsers);
        return null;
    }

    @Override
    public Group createGroup(HttpServletRequest request, HttpServletResponse response, Group group) throws Exception {
        if(groupRepository.findById(group.getId()).orElse(null) == null){
            response.addHeader("Location", request.getContextPath() + "/groups/" + group.getId());
            response.setStatus(201);
        }
        return groupRepository.save((GroupData)group);
    }

    @Override
    public Void deleteGroupUsers(HttpServletRequest request, HttpServletResponse response, String id) throws Exception {

        //Only existing groups can be updated
         findGroupOrThrow(id);

        //We delete the link between the group and its users
        removeTheReferenceToTheGroupForMemberUsers(id);
        return null;
    }

    @Override
    public Void deleteGroupUser(HttpServletRequest request, HttpServletResponse response, String id, String login) throws Exception {

        //Only existing groups can be updated
        findGroupOrThrow(id);

        //Retrieve users from repository for users list, throwing an error if a login is not found
        UserData foundUser = userRepository.findById(login).orElseThrow(()->new ApiErrorException(
                ApiError.builder()
                        .status(HttpStatus.NOT_FOUND)
                        .message(String.format(USER_NOT_FOUND_MSG,login))
                        .build()
        ));

        if(foundUser!=null) {
                foundUser.deleteGroup(id);
                publisher.publishEvent(new UpdatedUserEvent(this, busServiceMatcher.getServiceId(), foundUser.getLogin()));
            userRepository.save(foundUser);
        }
        return null;
    }

    @Override
    public List<? extends Group> fetchGroups(HttpServletRequest request, HttpServletResponse response) throws Exception {
        return groupRepository.findAll();
    }

    @Override
    public Group fetchGroup(HttpServletRequest request, HttpServletResponse response, String id) throws Exception {
        return groupRepository.findById(id).orElseThrow(
           ()-> new ApiErrorException(
              ApiError.builder()
                 .status(HttpStatus.NOT_FOUND)
                 .message(String.format(GROUP_NOT_FOUND_MSG,id))
                 .build()
           )
        );
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
    public Void updateGroupUsers(HttpServletRequest request, HttpServletResponse response, String id, List<String> users) throws Exception {

        //Only existing groups can be updated
        findGroupOrThrow(id);

        List<UserData> formerlyBelongs = userRepository.findByGroupSetContaining(id);
        List<String> newUsersInGroup = new ArrayList<>(users);

        //Make sure the intended updated users list only contains logins existing in the repository, throwing an error if this is not the case
        retrieveUsers(users);

        List<UserData> toUpdate =
                formerlyBelongs.stream()
                        .filter(u->!users.contains(u.getLogin()))
                        .peek(u-> {
                            u.deleteGroup(id);
                            newUsersInGroup.remove(u.getLogin());
                            //Fire an UpdatedUserEvent for all users that are updated because they're removed from the group
                            publisher.publishEvent(new UpdatedUserEvent(this, busServiceMatcher.getServiceId(), u.getLogin()));
                        }).collect(Collectors.toList());

        userRepository.saveAll(toUpdate);
        addGroupUsers(request, response, id, newUsersInGroup); //For users that are added to the group, the event will be published by addGroupUsers.
        return null;
    }

    @Override
    public List<? extends Perimeter> fetchGroupPerimeters(HttpServletRequest request, HttpServletResponse response, String id) throws Exception{

        List<String> perimeters = findGroupOrThrow(id).getPerimeters();

        //Retrieve perimeters from repository for perimeters list, throwing an error if a perimeter is not found
        if (perimeters != null)
            return retrievePerimeters(perimeters);

        return Collections.emptyList();
    }

    @Override
    public Void updateGroupPerimeters(HttpServletRequest request, HttpServletResponse response, String id, List<String> perimeters) throws Exception{

        //Only existing groups can be updated
        GroupData group = findGroupOrThrow(id);

        //Make sure the intended updated perimeters list only contains perimeter ids existing in the repository, throwing an error if this is not the case
        retrievePerimeters(perimeters);

        group.setPerimeters(perimeters);
        userService.publishUpdatedUserEvent(id);

        groupRepository.save(group);
        return null;
    }

    @Override
    public Void addGroupPerimeters(HttpServletRequest request, HttpServletResponse response, String id, List<String> perimeters) throws Exception{

        //Only existing groups can be updated
        GroupData group = findGroupOrThrow(id);

        //Make sure the perimeters list only contains perimeter ids existing in the repository, throwing an error if this is not the case
        retrievePerimeters(perimeters);

        for (String perimeter : perimeters)
            group.addPerimeter(perimeter);

        userService.publishUpdatedUserEvent(id);

        groupRepository.save(group);
        return null;
    }

    @Override
    public Void deleteGroup(HttpServletRequest request, HttpServletResponse response, String id) throws Exception {

        // Only existing group can be deleted
        GroupData foundGroupData = findGroupOrThrow(id);

        // First we have to delete the link between the group to delete and its users
        removeTheReferenceToTheGroupForMemberUsers(id);

        // Then we can delete the group
        groupRepository.delete(foundGroupData);
        return null;
    }

    // Remove the link between the group and all its members (this link is in "user" mongo collection)
    private void removeTheReferenceToTheGroupForMemberUsers(String idGroup) {
        List<UserData> foundUsers = userRepository.findByGroupSetContaining(idGroup);

        if (foundUsers != null) {
            for (UserData userData : foundUsers) {
                userData.deleteGroup(idGroup);
                publisher.publishEvent(new UpdatedUserEvent(this, busServiceMatcher.getServiceId(), userData.getLogin()));
            }
            userRepository.saveAll(foundUsers);
        }
    }

    private GroupData findGroupOrThrow(String id) {
        return groupRepository.findById(id).orElseThrow(
                ()-> new ApiErrorException(
                        ApiError.builder()
                                .status(HttpStatus.NOT_FOUND)
                                .message(String.format(GROUP_NOT_FOUND_MSG, id))
                                .build()
                ));
    }

    /** Retrieve users from repository for logins list, throwing an error if a login is not found
     * */
    private List<UserData> retrieveUsers(List<String> logins) {

        List<UserData> foundUsers = new ArrayList<>();
        for(String login : logins){
            UserData foundUser = userRepository.findById(login).orElseThrow(
                    () -> new ApiErrorException(
                            ApiError.builder()
                                    .status(HttpStatus.BAD_REQUEST)
                                    .message(String.format(BAD_USER_LIST_MSG,login))
                                    .build()
                    ));
            foundUsers.add(foundUser);
        }
        return foundUsers;
    }

    /** Retrieve perimeters from repository for perimeter list, throwing an error if a perimeter is not found
     * */
    private List<PerimeterData> retrievePerimeters(List<String> perimeterIds) {

        List<PerimeterData> foundPerimeters = new ArrayList<>();
        for(String perimeterId : perimeterIds){
            PerimeterData foundPerimeter = perimeterRepository.findById(perimeterId).orElseThrow(
                    () -> new ApiErrorException(
                            ApiError.builder()
                                    .status(HttpStatus.BAD_REQUEST)
                                    .message(String.format(BAD_PERIMETER_LIST_MSG, perimeterId))
                                    .build()
                    ));
            foundPerimeters.add(foundPerimeter);
        }
        return foundPerimeters;
    }
}
