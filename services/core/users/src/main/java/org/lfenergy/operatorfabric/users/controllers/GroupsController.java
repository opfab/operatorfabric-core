/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.users.controllers;

import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.lfenergy.operatorfabric.users.model.Group;
import org.lfenergy.operatorfabric.users.model.GroupData;
import org.lfenergy.operatorfabric.users.model.UserData;
import org.lfenergy.operatorfabric.users.repositories.GroupRepository;
import org.lfenergy.operatorfabric.users.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;


/**
 * GroupsController, documented at {@link GroupsApi}
 *
 * @author David Binder
 */
@RestController
@RequestMapping("/groups")
public class GroupsController implements GroupsApi {

    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private UserRepository userRepository;

    @Override
    public Void addGroupUsers(String name, List<String> users) throws Exception {
        Iterable<UserData> foundUsers = userRepository.findAllById(users);
        for (UserData userData : foundUsers) {
            userData.addGroup(name);
        }
        userRepository.saveAll(foundUsers);
        return null;
    }

    @Override
    public Group createGroup(Group group) throws Exception {
        return groupRepository.insert((GroupData)group);
    }

    @Override
    public Void deleteGroupUsers(String name, List<String> users) throws Exception {
        Iterable<UserData> foundUsers = userRepository.findAllById(users);
        for (UserData userData : foundUsers) {
            userData.deleteGroup(name);
        }
        userRepository.saveAll(foundUsers);
        return null;
    }

    @Override
    public List<? extends Group> fetchGroups() throws Exception {
        return groupRepository.findAll();
    }

    @Override
    public Group fetchGroup(String name) throws Exception {
        return groupRepository.findById(name).orElseThrow(
           ()-> new ApiErrorException(
              ApiError.builder()
                 .status(HttpStatus.NOT_FOUND)
                 .message("Group "+name+" not found")
                 .build()
           )
        );
    }

    @Override
    public Group updateGroup(String name, Group group) throws Exception {
        return groupRepository.save((GroupData)group);
    }

    @Override
    public Void updateGroupUsers(String name, List<String> users) throws Exception {
        List<UserData> formelyBelongs = userRepository.findByGroupSetContaining(name);
        List<String> newUsersInGroup = new ArrayList<>(users);
        List<UserData> toUpdate = new ArrayList<>();
        formelyBelongs.stream()
           .filter(u->!users.contains(u.getLogin()))
           .forEach(u-> {
               u.deleteGroup(name);
               newUsersInGroup.remove(u.getLogin());
               toUpdate.add(u);
           });
        userRepository.saveAll(toUpdate);
        addGroupUsers(name,newUsersInGroup);
        return null;
    }
}
