/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.springtools.configuration.test;

import org.opfab.springtools.configuration.oauth.UserServiceCache;
import org.opfab.springtools.configuration.oauth.UserServiceProxy;
import org.opfab.springtools.configuration.oauth.jwt.JwtProperties;
import org.opfab.springtools.configuration.oauth.jwt.groups.GroupsProperties;
import org.opfab.springtools.configuration.oauth.jwt.groups.GroupsUtils;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.openfeign.support.SpringMvcContract;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;

import feign.Feign;
import feign.jackson.JacksonDecoder;
import feign.mock.HttpMethod;
import feign.mock.MockClient;
import feign.mock.MockTarget;
import lombok.extern.slf4j.Slf4j;


@SpringBootApplication
@EnableConfigurationProperties
@Slf4j
@Import({UserServiceCache.class, GroupsProperties.class, GroupsUtils.class, JwtProperties.class})
public class UserServiceCacheTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(UserServiceCacheTestApplication.class, args);

        assert (ctx != null);
    }

    @Bean
    public MockClient mockClient(){

        String stringTestUserWithPerimeter = "{" + 
            "\"userData\": {" +
                "\"login\": \"testuser\"," +
                "\"firstName\": \"John\"," +
            "   \"lastName\": \"McClane\"," +
                "\"groups\": [\"testgroup1\"]" +
                "}," + 
            "\"computedPerimeters\": [" + 
            " { " + 
            "    \"process\": \"Process1\"," + 
            "    \"state\": \"State1\"," + 
            "    \"rights\": \"Receive\"" + 
            "  }]" +
          "}";
        


        MockClient mockClient = new MockClient();
        mockClient = mockClient.ok(HttpMethod.GET, "/CurrentUserWithPerimeters", stringTestUserWithPerimeter);

        return mockClient;
    }

    @Bean
    @Primary
    public UserServiceProxy mockUserServiceProxy(MockClient mockClient) {

        //Build Feign with MockClient
        UserServiceProxy mockUserServiceProxy = Feign.builder()
                .decoder(new JacksonDecoder())
                .client(mockClient)
                .contract(new SpringMvcContract()) // Needed because spring-cloud-starter-feign implements a default Contract class "SpringMvcContract". See https://github.com/spring-cloud/spring-cloud-netflix/issues/760
                .target(new MockTarget<>(UserServiceProxy.class));

        return mockUserServiceProxy;
    }

}
