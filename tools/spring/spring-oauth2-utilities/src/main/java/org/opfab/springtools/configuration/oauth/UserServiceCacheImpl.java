/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.springtools.configuration.oauth;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

import org.opfab.users.model.CurrentUserWithPerimeters;
import org.springframework.beans.factory.annotation.Value;

import com.fasterxml.jackson.databind.ObjectMapper;


public class UserServiceCacheImpl implements UserServiceCache {


    private Map<String, CurrentUserWithPerimeters> cache = new HashMap<>();
    protected static final Map<String,String> tokens = new HashMap<>();
    private String userServiceUrl;
    private ObjectMapper objectMapper = new ObjectMapper();


    public UserServiceCacheImpl(@Value("${operatorfabric.servicesUrls.users:http://users:2103}") String usersServiceUrl) {
        this.userServiceUrl = usersServiceUrl;
    
    }

    
    // The token is stored in the service as when the org.lfenergy.operatorfabric.cards.consultation.services.CardSubscription 
    // class call the cache , it does not have the user token 
    // it is set each time the user make a request as it can have been refresh in between 
    public  void setTokenForUserRequest(String user,String token)
    {
        tokens.put(user, token);
    }


    public CurrentUserWithPerimeters fetchCurrentUserWithPerimetersFromCacheOrProxy(String user)  throws IOException, InterruptedException {
        if (cache.containsKey(user)) {
            return cache.get(user);
        }
        CurrentUserWithPerimeters userWithPerimeter = fetchCurrentUserWithPerimeters(user);
        if (userWithPerimeter != null) {
            cache.put(user, userWithPerimeter);
        }
        return userWithPerimeter;
    }

    private CurrentUserWithPerimeters fetchCurrentUserWithPerimeters(String user)
            throws IOException, InterruptedException {

        String userAsString = fetchCurrentUserWithPerimetersAsString(user);
        CurrentUserWithPerimeters userWithPerimeters = null;

        if (userAsString != null)
            userWithPerimeters = objectMapper.readValue(userAsString, CurrentUserWithPerimeters.class);

        return userWithPerimeters;
    }


    private String fetchCurrentUserWithPerimetersAsString(String user)
            throws IOException, InterruptedException {

        String result = null;
        String bearer = "Bearer " + tokens.get(user);
        HttpClient httpClient = HttpClient.newHttpClient();
        String uri = String.format(
                "%s/internal/CurrentUserWithPerimeters", userServiceUrl);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(uri))
                .header("Authorization", bearer)
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 404)
            return null;
        result = response.body();

        return result;
    }

    public void clearUserCache(){
        cache.clear();
    }

    /** Clear cached user data for a given principalId
     * @param principalId of the user for which cache should be cleared
     */
    public void clearUserCache(String principalId){
        cache.remove(principalId);
    }


}

