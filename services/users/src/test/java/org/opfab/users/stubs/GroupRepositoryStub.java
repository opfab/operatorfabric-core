/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.stubs;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.opfab.users.model.Group;
import org.opfab.users.model.GroupData;
import org.opfab.users.repositories.GroupRepository;

public class GroupRepositoryStub implements GroupRepository {

    Map<String, Group> groups = new HashMap<>();

    @Override
    public List<Group> saveAll(List<Group> groupsToSave) {
        groupsToSave.forEach((group) -> groups.put(group.getId(),cloneGroup(group)));
        return null;
    }

    @Override
    public List<Group> findAll() {
        return groups.values().stream().map(group -> cloneGroup(group)).toList();
    }

    @Override
    public Group insert(Group group) {
        groups.put(group.getId(), cloneGroup(group));
        return null;
    }

    @Override
    public Group save(Group group) {
        groups.put(group.getId(), cloneGroup(group));
        return group;
    }

    @Override
    public Optional<Group> findById(String id) {
        Group group = groups.get(id);
        if (group == null)
            return Optional.empty();
        return Optional.of(cloneGroup(group));
    }

    @Override
    public void delete(Group entity) {
        groups.remove(entity.getId());

    }

    @Override
    public void deleteAll() {
        groups.clear();

    }

    @Override
    public List<Group> findByPerimetersContaining(String perimeterContains) {
        List<Group> groupsHavingPerimeter = new ArrayList<>();
        groups.values().forEach((group) -> {
            if (group.getPerimeters().contains(perimeterContains)) {
                groupsHavingPerimeter.add(cloneGroup(group));
            }
        });
        return groupsHavingPerimeter;
    }

    // Use this method to create copy of a group to avoid 
    // test code modifying repository data directly (without calling repository methods)
    private Group cloneGroup(Group group) {
        return (new GroupData((GroupData) group)); 
    } 
}
