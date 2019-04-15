/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.users.controllers;

import org.lfenergy.operatorfabric.springtools.configuration.oauth.UpdatedUserEvent;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.lfenergy.operatorfabric.users.model.SimpleUser;
import org.lfenergy.operatorfabric.users.model.User;
import org.lfenergy.operatorfabric.users.model.UserData;
import org.lfenergy.operatorfabric.users.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.bus.ServiceMatcher;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * UsersController, documented at {@link UsersApi}
 *
 * @author David Binder
 */
@RestController
@RequestMapping("/users")
public class UsersController implements UsersApi {

    public static final String USER_NOT_FOUND_MSG = "User %s not found";
    public static final String NO_MATCHING_USER_NAME_MSG = "Payload User login does not match URL User login";
    @Autowired
    private UserRepository userRepository;

    /* These are Spring Cloud Bus beans used to fire an event (UpdatedUserEvent) every time a user is modified.
     *  Other services handle this event by clearing their user cache for the given user. See issue #64*/
    @Autowired
    private ServiceMatcher busServiceMatcher;

    @Autowired
    private ApplicationEventPublisher publisher;

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
                                .message(String.format(USER_NOT_FOUND_MSG,login))
                                .build()
                ));
    }

    @Override
    public List<? extends User> fetchUsers() throws Exception {
        return userRepository.findAll();
    }

    @Override
    public SimpleUser updateUser(String login, SimpleUser user) throws Exception {

        //Only existing users can be updated
        userRepository.findById(login)
                .orElseThrow(()-> new ApiErrorException(
                        ApiError.builder()
                                .status(HttpStatus.NOT_FOUND)
                                .message(String.format(USER_NOT_FOUND_MSG,login))
                                .build()
                ));

        //login from user body parameter should match login path parameter
        if(!user.getLogin().equals(login)){
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message(NO_MATCHING_USER_NAME_MSG)
                            .build());
        } else {
            userRepository.save(new UserData(user));
            publisher.publishEvent(new UpdatedUserEvent(this,busServiceMatcher.getServiceId(),user.getLogin()));
            return user;
        }

    }
}
