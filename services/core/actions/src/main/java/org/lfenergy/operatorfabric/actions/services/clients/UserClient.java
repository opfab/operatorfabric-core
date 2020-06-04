/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.lfenergy.operatorfabric.actions.services.clients;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.reactive.function.client.WebClient;

import org.lfenergy.operatorfabric.users.model.User;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class UserClient {

    public static final String USER_401_MESSAGE = "OperatorFabric user service returned 401(Unauthorized), " +
            "authentication may have expired or remote service is incorrectly configured";
    public static final String USER_403_MESSAGE = "OperatorFabric user service returned 403(Unauthorized), " +
            "user not allowed to access resource";
    public static final String USER_ERROR_MESSAGE = "Error accessing OperatorFabric user service, no fallback behavior";
    public static final String NO_USER_ACTION_MESSAGE = "No User found";
    public static final String USER_FETCH_ERROR = "Unable to fetch User";

    @Value("${operatorfabric.services.base-url.users}")
    String userBaseUrl;
    WebClient client = WebClient.create(this.userBaseUrl);

    public Mono<User> fetchUser(@PathVariable("id") String userId,
                                @RequestHeader("Authorization")String auth){
        return client.get()
                .uri(this.userBaseUrl+"/users/{id}", userId)
                .header("Authorization", auth)
                .retrieve()
                .onStatus(HttpStatus::is4xxClientError, response -> {
                    switch (response.rawStatusCode()) {
                        case 404:
                            return Mono.error(new ApiErrorException(ApiError.builder().status(HttpStatus.NOT_FOUND)
                                    .message(NO_USER_ACTION_MESSAGE).build()));
                        case 401:
                            return Mono.error(new ApiErrorException(ApiError.builder().status(HttpStatus.UNAUTHORIZED)
                                    .message(USER_401_MESSAGE).build()));
                        case 403:
                            return Mono.error(new ApiErrorException(ApiError.builder().status(HttpStatus.UNAUTHORIZED)
                                    .message(USER_403_MESSAGE).build()));
                        default:
                            return Mono.error(new ApiErrorException(ApiError.builder().status(HttpStatus.BAD_GATEWAY)
                                    .message(USER_ERROR_MESSAGE).build()));
                    }
                })
                .bodyToMono(User.class)
                .onErrorResume(m ->
                        Mono.error(new ApiErrorException(ApiError
                                .builder()
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .message(USER_FETCH_ERROR)
                                .build()))
                );

    }
}
