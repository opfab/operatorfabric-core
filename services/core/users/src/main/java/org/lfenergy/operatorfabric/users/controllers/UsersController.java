/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.users.controllers;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.config.oauth.UpdatedUserEvent;
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
@Slf4j
@RequestMapping("/users")
public class UsersController implements UsersApi {

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
        log.info("TestCache : Fetch user was called for {}",login);
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
        //Check publishing stuff
        log.info("TestCache : Check publishing stuff");
        log.info("Login : {}",login);
        log.info("User : {}", user);
        log.info("User.getLogin {}", user.getLogin());
        log.info("ServiceMatcher is not null : {}", !busServiceMatcher.equals(null));
        log.info("ServiceMatcher is {}", busServiceMatcher.toString());
        log.info("ServiceMatcher id {}", busServiceMatcher.getServiceId());
        log.info("Publisher is not null : {}", !publisher.equals(null));
        log.info("Publisher is {}", publisher.toString());
        publisher.publishEvent(new UpdatedUserEvent(this,busServiceMatcher.getServiceId(),user.getLogin()));
        log.info("TestCache : UpdateUserEvent was fired from updateUser for {}",user.getLogin());
        return user;
    }
}
