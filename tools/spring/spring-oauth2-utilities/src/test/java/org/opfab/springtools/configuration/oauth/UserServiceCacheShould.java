/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.springtools.configuration.oauth;

import feign.mock.HttpMethod;
import feign.mock.MockClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.opfab.springtools.configuration.test.UserServiceCacheTestApplication;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;


@SpringBootTest(classes = UserServiceCacheTestApplication.class)
public class UserServiceCacheShould {

    @Autowired
    UserServiceCache userServiceCache;

    @Autowired
    MockClient mockClient;

    @BeforeEach
    public void setup(){
        userServiceCache.clearUserCache();
        mockClient.resetRequests();
    }

    @Test
    public void objectsUnderTestAreNotNull(){
        assertThat(userServiceCache).isNotNull();
        assertThat(mockClient).isNotNull();
    }

    @Test
    public void mockClientRequestsAreResetBeforeEachTest(){
        assertThat(mockClient.verifyTimes(HttpMethod.GET, "/CurrentUserWithPerimeters",0)).isEmpty();
    }

    @Test
    public void shouldReturnCorrectUserData(){
        String principalID ="testuser";
        CurrentUserWithPerimeters user = userServiceCache.fetchCurrentUserWithPerimetersFromCacheOrProxy(principalID);
        assertThat(user).isNotNull();
        assertThat(user).isInstanceOf(CurrentUserWithPerimeters.class);
        assertThat(user.getUserData().getLogin()).isEqualTo(principalID);
        assertThat(user.getUserData().getGroups()).containsExactlyInAnyOrder("testgroup1");
        assertThat(user.getUserData().getFirstName()).isEqualTo("John");
        assertThat(user.getUserData().getLastName()).isEqualTo("McClane");
    }

    @Test 
    public void shouldInsertToken() {
        String user1 ="testuser";
        String user2 ="testuser2";
        UserServiceCache.setTokenForUserRequest(user1, "testtoken");
        UserServiceCache.setTokenForUserRequest(user2, "testtoken2");
        CurrentUserWithPerimeters user = userServiceCache.fetchCurrentUserWithPerimetersFromCacheOrProxy(user1);
        Map headers  = mockClient.verifyOne(HttpMethod.GET, "/CurrentUserWithPerimeters").headers();
        String token = headers.get("Authorization").toString();
        assertThat(token).isEqualTo("[Bearer testtoken]");
        mockClient.resetRequests();
        user = userServiceCache.fetchCurrentUserWithPerimetersFromCacheOrProxy(user2);
        headers  = mockClient.verifyOne(HttpMethod.GET, "/CurrentUserWithPerimeters").headers();
        token = headers.get("Authorization").toString();
        assertThat(token).isEqualTo("[Bearer testtoken2]");
        
    }

    @Test
    public void shouldNotHitCacheForFirstCall(){
        String principalID ="testuser";
        //First call
        userServiceCache.fetchCurrentUserWithPerimetersFromCacheOrProxy(principalID);
        mockClient.verifyTimes(HttpMethod.GET, "/CurrentUserWithPerimeters", 1);
    }

    @Test
    public void shouldReturnSameDataForSecondCall(){
        String principalID ="testuser";

        //First call
        CurrentUserWithPerimeters user1 = userServiceCache.fetchCurrentUserWithPerimetersFromCacheOrProxy(principalID);

        //Second call
        CurrentUserWithPerimeters user2 = userServiceCache.fetchCurrentUserWithPerimetersFromCacheOrProxy(principalID);

        assertThat(user1).isNotNull();
        assertThat(user1).isEqualTo(user2);
    }


    @Test
    public void shouldHitCacheForSecondCall(){
        String principalID ="jmcclane";

        //First call
        userServiceCache.fetchCurrentUserWithPerimetersFromCacheOrProxy(principalID);

        //Second call
        userServiceCache.fetchCurrentUserWithPerimetersFromCacheOrProxy(principalID);

        mockClient.verifyTimes(HttpMethod.GET, "/CurrentUserWithPerimeters", 1);
    }


    @Test
    public void shouldClearSelectedCache(){
        String principalID1 = "jmcclane";
        String principalID2 = "hgruber";

        //First call
        userServiceCache.fetchCurrentUserWithPerimetersFromCacheOrProxy(principalID1);
        userServiceCache.fetchCurrentUserWithPerimetersFromCacheOrProxy(principalID2);

        //Clear cache only for principalID1
        userServiceCache.clearUserCache(principalID1);

        //Second call
        userServiceCache.fetchCurrentUserWithPerimetersFromCacheOrProxy(principalID1);
        userServiceCache.fetchCurrentUserWithPerimetersFromCacheOrProxy(principalID2);

        //Check number of calls
        mockClient.verifyTimes(HttpMethod.GET, "/CurrentUserWithPerimeters", 3);
    }

}
