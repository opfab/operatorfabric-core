/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.springtools.config.oauth.application;

import feign.Feign;
import feign.FeignException;
import feign.Response;
import feign.codec.DecodeException;
import feign.codec.Decoder;
import feign.jackson.JacksonDecoder;
import feign.mock.HttpMethod;
import feign.mock.MockClient;
import feign.mock.MockTarget;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.config.oauth.UserServiceCache;
import org.lfenergy.operatorfabric.springtools.config.oauth.UserServiceProxy;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.support.SpringMvcContract;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;

import java.io.IOException;
import java.lang.reflect.Type;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * <p></p>
 * Created on 28/01/19
 *
 * @author Alexandra Guironnet
 */
@SpringBootApplication
@Slf4j
@Import({UserServiceCache.class})
public class UserServiceCacheTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(UserServiceCacheTestApplication.class, args);

        assert (ctx != null);
    }

    @Bean
    public MockClient mockClient(){

        //Create MockClient and set behaviour
        String stringUser1 = "{" +
                "\"login\": \"jmcclane\"," +
                "\"firstName\": \"John\"," +
                "\"lastName\": \"McClane\"," +
                "\"groups\": [\"good_guys\",\"user\"]" +
                "}";
        String stringUser2 = "{" +
                "\"login\": \"hgruber\"," +
                "\"firstName\": \"Hans\"," +
                "\"lastName\": \"Gruber\"," +
                "\"groups\": [\"bad_guys\",\"admin\"]" +
                "}";

        MockClient mockClient = new MockClient();
        mockClient = mockClient
                .ok(HttpMethod.GET, "/users/jmcclane", stringUser1)
                .ok(HttpMethod.GET, "/users/hgruber", stringUser2);

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
