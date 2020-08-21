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
import org.lfenergy.operatorfabric.users.model.Entity;
import org.lfenergy.operatorfabric.users.model.EntityData;
import org.lfenergy.operatorfabric.users.model.UserData;
import org.lfenergy.operatorfabric.users.repositories.EntityRepository;
import org.lfenergy.operatorfabric.users.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.bus.ServiceMatcher;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


/**
 * GroupsController, documented at {@link EntitiesApi}
 *
 */
@RestController
@RequestMapping("/entities")
public class EntitiesController implements EntitiesApi {

    public static final String ENTITY_NOT_FOUND_MSG = "Entity %s not found";
    public static final String USER_NOT_FOUND_MSG = "User %s not found";
    public static final String BAD_USER_LIST_MSG = "Bad user list : user %s not found";
    public static final String NO_MATCHING_ENTITY_ID_MSG = "Payload Entity id does not match URL Entity id";
    @Autowired
    private EntityRepository entityRepository;
    @Autowired
    private UserRepository userRepository;

    /* These are Spring Cloud Bus beans used to fire an event (UpdatedUserEvent) every time a user is modified.
    *  Other services handle this event by clearing their user cache for the given user. See issue #64*/
    @Autowired
    private ServiceMatcher busServiceMatcher;
    @Autowired
    private ApplicationEventPublisher publisher;

    @Override
    public Void addEntityUsers(HttpServletRequest request, HttpServletResponse response, String id, List<String> users) throws Exception {

        //Only existing entities can be updated
        findEntityOrThrow(id);

        //Retrieve users from repository for users list, throwing an error if a login is not found
        List<UserData> foundUsers = retrieveUsers(users);

        for (UserData userData : foundUsers) {
            userData.addEntity(id);
            publisher.publishEvent(new UpdatedUserEvent(this, busServiceMatcher.getServiceId(), userData.getLogin()));
        }
        userRepository.saveAll(foundUsers);
        return null;

    }

    @Override
    public Entity createEntity(HttpServletRequest request, HttpServletResponse response, Entity entity) throws Exception {
        if(entityRepository.findById(entity.getId()).orElse(null) == null){
            response.addHeader("Location", request.getContextPath() + "/entities/" + entity.getId());
            response.setStatus(201);
        }
        return entityRepository.save((EntityData) entity);
    }

    @Override
    public Void deleteEntityUsers(HttpServletRequest request, HttpServletResponse response, String id) throws Exception {

        //Only existing entities can be updated
         findEntityOrThrow(id);

        //We delete the links between the users who are part of the entity to delete, and the entity
        removeTheReferenceToTheEntityForMemberUsers(id);
        return null;
    }

    @Override
    public Void deleteEntityUser(HttpServletRequest request, HttpServletResponse response, String id, String login) throws Exception {

        //Only existing entities can be updated
        findEntityOrThrow(id);

        //Retrieve users from repository for users list, throwing an error if a login is not found
        UserData foundUser = userRepository.findById(login).orElseThrow(()->new ApiErrorException(
                ApiError.builder()
                        .status(HttpStatus.NOT_FOUND)
                        .message(String.format(USER_NOT_FOUND_MSG, login))
                        .build()
        ));

        if(foundUser!=null) {
                foundUser.deleteEntity(id);
                publisher.publishEvent(new UpdatedUserEvent(this, busServiceMatcher.getServiceId(), foundUser.getLogin()));
            userRepository.save(foundUser);
        }
        return null;
    }

    @Override
    public List<? extends Entity> fetchEntities(HttpServletRequest request, HttpServletResponse response) throws Exception {
        return entityRepository.findAll();
    }

    @Override
    public Entity fetchEntity(HttpServletRequest request, HttpServletResponse response, String id) throws Exception {
        return entityRepository.findById(id).orElseThrow(
           ()-> new ApiErrorException(
              ApiError.builder()
                 .status(HttpStatus.NOT_FOUND)
                 .message(String.format(ENTITY_NOT_FOUND_MSG, id))
                 .build()
           )
        );
    }

    @Override
    public Entity updateEntity(HttpServletRequest request, HttpServletResponse response, String id, Entity entity) throws Exception {
        //id from entity body parameter should match id path parameter
        if(!entity.getId().equals(id)){
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
    public Void updateEntityUsers(HttpServletRequest request, HttpServletResponse response, String id, List<String> users) throws Exception {

        //Only existing entities can be updated
        findEntityOrThrow(id);

        List<UserData> formerlyBelongs = userRepository.findByEntitiesContaining(id);
        List<String> newUsersInEntity = new ArrayList<>(users);

        //Make sure the intended updated users list only contains logins existing in the repository, throwing an error if this is not the case
        retrieveUsers(users);

        List<UserData> toUpdate =
                formerlyBelongs.stream()
                        .filter(u->!users.contains(u.getLogin()))
                        .peek(u-> {
                            u.deleteEntity(id);
                            newUsersInEntity.remove(u.getLogin());
                            //Fire an UpdatedUserEvent for all users that are updated because they're removed from the entity
                            publisher.publishEvent(new UpdatedUserEvent(this, busServiceMatcher.getServiceId(), u.getLogin()));
                        }).collect(Collectors.toList());

        userRepository.saveAll(toUpdate);
        addEntityUsers(request, response, id, newUsersInEntity); //For users that are added to the entity, the event will be published by addEntityUsers.
        return null;
    }

    @Override
    public Void deleteEntity(HttpServletRequest request, HttpServletResponse response, String id) throws Exception {

        // Only existing entity can be deleted
        EntityData foundEntityData = findEntityOrThrow(id);

        // First we have to delete the links between the users who are part of the entity to delete, and the entity
        removeTheReferenceToTheEntityForMemberUsers(id);

        // Then we can delete the entity
        entityRepository.delete(foundEntityData);

        return null;
    }

    // Remove the link between the entity and all its members (this link is in "user" mongo collection)
    private void removeTheReferenceToTheEntityForMemberUsers(String idEntity) {
        List<UserData> foundUsers = userRepository.findByEntitiesContaining(idEntity);

        if (foundUsers != null) {
            for (UserData userData : foundUsers) {
                userData.deleteEntity(idEntity);
                publisher.publishEvent(new UpdatedUserEvent(this, busServiceMatcher.getServiceId(), userData.getLogin()));
            }
            userRepository.saveAll(foundUsers);
        }
    }

    private EntityData findEntityOrThrow(String id) {
        return entityRepository.findById(id).orElseThrow(
                ()-> new ApiErrorException(
                        ApiError.builder()
                                .status(HttpStatus.NOT_FOUND)
                                .message(String.format(ENTITY_NOT_FOUND_MSG, id))
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
                                    .message(String.format(BAD_USER_LIST_MSG, login))
                                    .build()
                    ));
            foundUsers.add(foundUser);
        }

        return foundUsers;
    }
}
