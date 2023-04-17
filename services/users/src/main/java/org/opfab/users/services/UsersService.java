/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.users.services;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.opfab.users.model.EntityCreationReport;
import org.opfab.users.model.Group;
import org.opfab.users.model.OperationResult;
import org.opfab.users.model.Perimeter;
import org.opfab.users.model.User;
import org.opfab.users.repositories.EntityRepository;
import org.opfab.users.repositories.GroupRepository;
import org.opfab.users.repositories.PerimeterRepository;
import org.opfab.users.repositories.UserRepository;

public class UsersService {

    private static final String USER_NOT_FOUND_MSG = "User %s not found";
    private static final String CANNOT_REMOVE_ADMIN_USER_FROM_ADMIN_GROUP = "Removing group ADMIN from user admin is not allowed";

    private static final String ADMIN_LOGIN = "admin";
    private static final String ADMIN_GROUP_ID = "ADMIN";

    private UserRepository userRepository;
    private GroupRepository groupRepository;
    private EntityRepository entityRepository;
    private PerimeterRepository perimeterRepository;
    private NotificationService notificationService;

    public UsersService(UserRepository userRepository, GroupRepository groupRepository,
            EntityRepository entityRepository,
            PerimeterRepository perimeterRepository, NotificationService notificationService) {

        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.entityRepository = entityRepository;
        this.perimeterRepository = perimeterRepository;
        this.notificationService = notificationService;

    }

    public List<User> fetchUsers() {
        return userRepository.findAll();
    }

    public OperationResult<User> fetchUser(String userId) {
        Optional<User> user = userRepository.findById(userId).map(User.class::cast);
        if (user.isPresent())
            return new OperationResult<>(user.get(), true, null, null);
        else
            return new OperationResult<>(null, false, OperationResult.ErrorType.NOT_FOUND,
                    String.format(USER_NOT_FOUND_MSG, userId));
    }

    public OperationResult<EntityCreationReport<User>> createUser(User user) {
        boolean formatCheckResult = false;
        if (user.getLogin().length() >= 1)
            formatCheckResult = true;
        user.setLogin(user.getLogin().toLowerCase());
        if (formatCheckResult) {
            if (isRemovingAdminUserFromAdminGroup(user))
                return new OperationResult<>(null, false,
                        OperationResult.ErrorType.BAD_REQUEST, CANNOT_REMOVE_ADMIN_USER_FROM_ADMIN_GROUP);

            boolean isAlreadyExisting = userRepository.findById(user.getLogin()).isPresent();
            User newUser = userRepository.save(user);
            if (isAlreadyExisting)
                notificationService.publishUpdatedUserMessage(user.getLogin());
            EntityCreationReport<User> report = new EntityCreationReport<>(isAlreadyExisting, newUser);
            return new OperationResult<>(report, true, null, null);

        } else
            return new OperationResult<>(null, false, OperationResult.ErrorType.BAD_REQUEST,
                    "Mandatory 'login' field is missing.");

    }

    private boolean isRemovingAdminUserFromAdminGroup(User user) {
        boolean isAdminUser = user.getLogin().equals(ADMIN_LOGIN);
        boolean hasAdminGroup = user.getGroups().contains(ADMIN_GROUP_ID);

        return isAdminUser && !hasAdminGroup;
    }

    public OperationResult<String> deleteUser(String login) {
        if (login.equalsIgnoreCase(ADMIN_GROUP_ID)) {
            return new OperationResult<>(null, false, OperationResult.ErrorType.BAD_REQUEST,
                    "Deleting user admin is not allowed");
        }
        Optional<User> user = userRepository.findById(login);
        if (user.isEmpty())
            return new OperationResult<>(null, false, OperationResult.ErrorType.NOT_FOUND,
                    String.format(USER_NOT_FOUND_MSG, login));

        userRepository.delete(user.get());
        notificationService.publishUpdatedUserMessage(user.get().getLogin());
        return new OperationResult<>(null, true, null, null);
    }

    public OperationResult<List<Perimeter>> fetchUserPerimeters(String login) {
        Optional<User> result = userRepository.findById(login);
        if (result.isEmpty())
            return new OperationResult<>(null, false, OperationResult.ErrorType.NOT_FOUND,
                    String.format(USER_NOT_FOUND_MSG, login));

        List<String> groups = result.get().getGroups();
        Set<Perimeter> perimeters = findPerimetersAttachedToGroups(groups);

        return new OperationResult<>(new ArrayList<>(perimeters), true, null, null);

    }

    private Set<Perimeter> findPerimetersAttachedToGroups(List<String> groupIds) {
        if ((groupIds != null) && (!groupIds.isEmpty())) {
            List<Group> groups = retrieveGroups(groupIds);

            if ((groups != null) && (!groups.isEmpty())) {
                Set<Perimeter> perimetersData = new HashSet<>(); // We use a set because we don't want to have a
                                                                 // duplicate
                groups.forEach( // For each group, we recover its perimeters
                        groupData -> {
                            List<Perimeter> list = retrievePerimeters(groupData.getPerimeters());
                            if (list != null)
                                perimetersData.addAll(list);
                        });
                return perimetersData;
            }
        }
        return Collections.emptySet();
    }

    public List<Group> retrieveGroups(List<String> groupIds) {
        List<Group> foundGroups = new ArrayList<>();
        for (String id : groupIds) {
            Optional<Group> foundGroup = groupRepository.findById(id);
            if (foundGroup.isPresent())
                foundGroups.add(foundGroup.get());
        }
        return foundGroups;
    }

    public List<Perimeter> retrievePerimeters(List<String> perimeterIds) {
        List<Perimeter> foundPerimeters = new ArrayList<>();
        for (String perimeterId : perimeterIds) {
            Optional<Perimeter> foundPerimeter = perimeterRepository.findById(perimeterId);
            if (foundPerimeter.isPresent())
                foundPerimeters.add(foundPerimeter.get());
        }
        return foundPerimeters;
    }

    public OperationResult<User> updateOrCreateUser(User user, boolean updateEntities, boolean updateGroups) {
        boolean formatCheckResult = false;
        if (user.getLogin().length() >= 1)
            formatCheckResult = true;
        user.setLogin(user.getLogin().toLowerCase());

        if (formatCheckResult) {
            User existingUser = userRepository.findById(user.getLogin()).orElse(null);

            setEntitiesForUserUpdate(user, existingUser, updateEntities);
            if ((updateGroups) && (isRemovingAdminUserFromAdminGroup(user))) {
                    return new OperationResult<>(null, false,
                            OperationResult.ErrorType.BAD_REQUEST, CANNOT_REMOVE_ADMIN_USER_FROM_ADMIN_GROUP);
            }
            setGroupsForUserUpdate(user, existingUser, updateGroups);

            User newUser = userRepository.save(user);
            if ((existingUser != null) && !newUser.equals(existingUser))
                notificationService.publishUpdatedUserMessage(user.getLogin());
            return new OperationResult<>(newUser, true, null, null);

        } else
            return new OperationResult<>(null, false, OperationResult.ErrorType.BAD_REQUEST,
                    "Mandatory 'login' field is missing.");
    }

    private void setEntitiesForUserUpdate(User newUser, User existingUser, boolean updateEntities) {
        if (updateEntities)
            removeInvalidEntities(newUser);
        else {
            if (existingUser != null)
                newUser.setEntities(existingUser.getEntities());
            else
                newUser.setEntities(Collections.emptyList());
        }
    }

    private void setGroupsForUserUpdate(User newUser, User existingUser, boolean updateGroups) {
        if (updateGroups) {
            removeInvalidGroups(newUser);
        } else {
            if (existingUser != null)
                newUser.setGroups(existingUser.getGroups());
            else
                newUser.setGroups(Collections.emptyList());
        }
    }

    private void removeInvalidEntities(User user) {
        List<String> entities = user.getEntities();
        if (entities != null) {
            List<String> invalidEntities = entities.stream()
                    .filter(groupId -> this.entityRepository.findById(groupId).isEmpty()).toList();
            if (!invalidEntities.isEmpty())
                entities.removeAll(invalidEntities);
        }
        user.setEntities(entities);
    }

    private void removeInvalidGroups(User user) {
        List<String> groups = user.getGroups();
        if (groups != null) {
            List<String> invalidGroups = groups.stream()
                    .filter(groupId -> this.groupRepository.findById(groupId).isEmpty()).toList();
            if (!invalidGroups.isEmpty())
                groups.removeAll(invalidGroups);
        }
        user.setGroups(groups);
    }

}
