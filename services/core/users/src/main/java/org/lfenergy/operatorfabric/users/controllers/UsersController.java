/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.users.controllers;

import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.lfenergy.operatorfabric.users.model.SimpleUser;
import org.lfenergy.operatorfabric.users.model.SimpleUserData;
import org.lfenergy.operatorfabric.users.model.User;
import org.lfenergy.operatorfabric.users.model.UserData;
import org.lfenergy.operatorfabric.users.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UsersController implements UsersApi {

    @Autowired
    private UserRepository userRepository;

    @Override
    public SimpleUser createUser(SimpleUser user) throws Exception {
        userRepository.insert(new UserData(user));
        return user;
    }

    @Override
    public User fetchUser(String login) throws Exception {
        return userRepository.findById(login)
                .orElseThrow(()-> new ApiErrorException(
                        ApiError.builder()
                                .status(HttpStatus.NOT_FOUND)
                                .message("User "+login+" not found")
                                .build()
                ));
    }

    @Override
    public List<? extends User> fetchUsers() throws Exception {
        return userRepository.findAll();
    }

    @Override
    public SimpleUser updateUser(String login, SimpleUser user) throws Exception {
        userRepository.save(new UserData(user));
        return user;
    }
}
