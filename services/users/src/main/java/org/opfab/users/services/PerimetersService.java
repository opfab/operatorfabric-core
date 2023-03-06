/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.services;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.opfab.users.model.EntityCreationReport;
import org.opfab.users.model.Group;
import org.opfab.users.model.GroupData;
import org.opfab.users.model.OperationResult;
import org.opfab.users.model.Perimeter;
import org.opfab.users.model.StateRight;
import org.opfab.users.repositories.GroupRepository;
import org.opfab.users.repositories.PerimeterRepository;
import org.opfab.users.utils.IdFormatChecker;

public class PerimetersService {

    private static final String PERIMETER_NOT_FOUND_MSG = "Perimeter %s not found";
    private static final String DUPLICATE_STATE_IN_PERIMETER = "Bad stateRights list : there is one or more duplicate state(s) in the perimeter";
    private static final String PERIMETER_ALREADY_EXIST = "Creation failed because perimeter %s already exist";
    private static final String BAD_GROUP_LIST_MSG = "Bad group list : group %s not found";
    private static final String GROUP_NOT_FOUND_MSG = "Group %s not found";

    private PerimeterRepository perimeterRepository;
    private GroupRepository groupRepository;
    private NotificationService notificationService;

    public PerimetersService(
            PerimeterRepository perimeterRepository, GroupRepository groupRepository, NotificationService notificationService) {
        this.perimeterRepository = perimeterRepository;
        this.groupRepository = groupRepository;
        this.notificationService = notificationService;

    }

    public List<Perimeter> fetchPerimeters() {
        return perimeterRepository.findAll();
    }

    public OperationResult<Perimeter> fetchPerimeter(String perimeterId) {
        Optional<Perimeter> perimeter = perimeterRepository.findById(perimeterId);
        if (perimeter.isPresent())
            return new OperationResult<>(perimeter.get(), true, null, null);
        else
            return new OperationResult<>(null, false, OperationResult.ErrorType.NOT_FOUND,
                    String.format(PERIMETER_NOT_FOUND_MSG, perimeterId));
    }

    public OperationResult<EntityCreationReport<Perimeter>> createPerimeter(Perimeter perimeter) {
        IdFormatChecker.IdCheckResult formatCheckResult = IdFormatChecker.check(perimeter.getId());
        if (formatCheckResult.isValid()) {
            boolean isAlreadyExisting = perimeterRepository.findById(perimeter.getId()).isPresent();
            if (isAlreadyExisting)
                return new OperationResult<>(null, false, OperationResult.ErrorType.BAD_REQUEST,
                        String.format(PERIMETER_ALREADY_EXIST, perimeter.getId()));

            if (!isEachStateUniqueInPerimeter(perimeter))
                return new OperationResult<>(null, false, OperationResult.ErrorType.BAD_REQUEST,
                        DUPLICATE_STATE_IN_PERIMETER);
            Perimeter insertedPerimeter = perimeterRepository.save(perimeter);
            EntityCreationReport<Perimeter> report = new EntityCreationReport<>(isAlreadyExisting, insertedPerimeter);
            return new OperationResult<>(report, true, null, null);

        } else
            return new OperationResult<>(null, false, OperationResult.ErrorType.BAD_REQUEST,
                    formatCheckResult.getErrorMessage());

    }

    private boolean isEachStateUniqueInPerimeter(Perimeter perimeter) {

        if ((perimeter != null) && (perimeter.getStateRights().size() > 1)) {

            Set<String> mySet = new HashSet<>();
            for (StateRight stateRight : perimeter.getStateRights()) {

                String state = stateRight.getState();
                if (!mySet.contains(state))
                    mySet.add(state);
                else
                    return false;
            }
        }
        return true;
    }

    public OperationResult<EntityCreationReport<Perimeter>> updatePerimeter(Perimeter perimeter) {
        IdFormatChecker.IdCheckResult formatCheckResult = IdFormatChecker.check(perimeter.getId());
        if (formatCheckResult.isValid()) {
            boolean isAlreadyExisting = perimeterRepository.findById(perimeter.getId()).isPresent();
            if (!isEachStateUniqueInPerimeter(perimeter))
                return new OperationResult<>(null, false, OperationResult.ErrorType.BAD_REQUEST,
                        DUPLICATE_STATE_IN_PERIMETER);

            List<Group> foundGroups = groupRepository.findByPerimetersContaining(perimeter.getId());
            Perimeter insertedPerimeter = perimeterRepository.save(perimeter);
            if (foundGroups != null) {
                for (Group group : foundGroups) {
                    notificationService.publishUpdatedGroupMessage(group.getId());
                }
            }
            EntityCreationReport<Perimeter> report = new EntityCreationReport<>(isAlreadyExisting, insertedPerimeter);
            return new OperationResult<>(report, true, null, null);

        } else
            return new OperationResult<>(null, false, OperationResult.ErrorType.BAD_REQUEST,
                    formatCheckResult.getErrorMessage());

    }

    public OperationResult<String> deletePerimeter(String perimeterId) {
        Optional<Perimeter> group = perimeterRepository.findById(perimeterId);
        if (group.isEmpty())
            return new OperationResult<>(null, false, OperationResult.ErrorType.NOT_FOUND,
                    String.format(PERIMETER_NOT_FOUND_MSG, perimeterId));

        removeTheReferenceToThePerimeterForConcernedGroups(perimeterId);

        perimeterRepository.delete(group.get());
        return new OperationResult<>(null, true, null, null);
    }

    // Remove the link between the perimeter and the groups that own this perimeter
    // (this link is in "group" mongo collection)
    private void removeTheReferenceToThePerimeterForConcernedGroups(String idPerimeter) {

        List<Group> foundGroups = groupRepository.findByPerimetersContaining(idPerimeter);

        if (foundGroups != null) {
            for (Group group : foundGroups) {
                ((GroupData) group).deletePerimeter(idPerimeter);
                notificationService.publishUpdatedGroupMessage(group.getId());
            }
            groupRepository.saveAll(foundGroups);
        }
    }

    public OperationResult<String> addPerimeterGroups(String perimeterId, List<String> groups) {
        if (!perimeterRepository.findById(perimeterId).isPresent())
            return new OperationResult<>(null, false, OperationResult.ErrorType.NOT_FOUND,
                    String.format(PERIMETER_NOT_FOUND_MSG, perimeterId));

        OperationResult<List<Group>> foundGroupsResult = retrieveGroups(groups);
        if (foundGroupsResult.isSuccess()) {
            List<Group> foundGroups = foundGroupsResult.getResult();
            for (Group group : foundGroups) {
                ((GroupData) group).addPerimeter(perimeterId);
                groupRepository.save(group);
                notificationService.publishUpdatedGroupMessage(group.getId());
            }
        } else
            return new OperationResult<>(null, false, foundGroupsResult.getErrorType(),
                    foundGroupsResult.getErrorMessage());
        return new OperationResult<>(null, true, null, perimeterId);
    }

    private OperationResult<List<Group>> retrieveGroups(List<String> groupIds) {
        List<Group> foundGroups = new ArrayList<>();
        for (String groupId : groupIds) {
            Optional<Group> foundGroup = groupRepository.findById(groupId);
            if (foundGroup.isEmpty())
                return new OperationResult<>(null, false, OperationResult.ErrorType.BAD_REQUEST,
                        String.format(BAD_GROUP_LIST_MSG, groupId));
            else
                foundGroups.add(foundGroup.get());
        }
        return new OperationResult<>(foundGroups, true, null, null);
    }

    public OperationResult<String> updatePerimeterGroups(String perimeterId, List<String> groups) {
        if (!perimeterRepository.findById(perimeterId).isPresent())
            return new OperationResult<>(null, false, OperationResult.ErrorType.NOT_FOUND,
                    String.format(PERIMETER_NOT_FOUND_MSG, perimeterId));
        OperationResult<List<Group>> foundGroupsResult = retrieveGroups(groups);
        if (foundGroupsResult.isSuccess()) {
            List<Group> formerlyBelongs = groupRepository.findByPerimetersContaining(perimeterId);
            formerlyBelongs.forEach(group -> {
                if (!groups.contains(group.getId())) {
                    ((GroupData) group).deletePerimeter(perimeterId);
                    groupRepository.save(group);
                    notificationService.publishUpdatedGroupMessage(group.getId());
                }
            });
            addPerimeterGroups(perimeterId, groups);
        } else
            return new OperationResult<>(null, false, foundGroupsResult.getErrorType(),
                    foundGroupsResult.getErrorMessage());

        return new OperationResult<>(null, true, null, null);
    }

    public OperationResult<String> deletePerimeterGroups(String perimeterId) {
        if (!perimeterRepository.findById(perimeterId).isPresent())
            return new OperationResult<>(null, false, OperationResult.ErrorType.NOT_FOUND,
                    String.format(PERIMETER_NOT_FOUND_MSG, perimeterId));
        removeTheReferenceToThePerimeterForConcernedGroups(perimeterId);
        return new OperationResult<>(null, true, null, perimeterId);
    }

    public OperationResult<String> deletePerimeterGroup(String perimeterId, String groupId) {

        if (!perimeterRepository.findById(perimeterId).isPresent())
            return new OperationResult<>(null, false, OperationResult.ErrorType.NOT_FOUND,
                    String.format(PERIMETER_NOT_FOUND_MSG, perimeterId));

        Optional<Group> foundGroup = groupRepository.findById(groupId);

        if (foundGroup.isEmpty()) {
            return new OperationResult<>(null, false, OperationResult.ErrorType.NOT_FOUND,
                    String.format(GROUP_NOT_FOUND_MSG, groupId));
        }

        ((GroupData) foundGroup.get()).deletePerimeter(perimeterId);
        groupRepository.save(foundGroup.get());
        notificationService.publishUpdatedGroupMessage(groupId);

        return new OperationResult<>(null, true, null, "");
    }

}
