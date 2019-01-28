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

@SpringBootApplication
@Slf4j
@Import({UserServiceCache.class})
public class UserServiceCacheTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(UserServiceCacheTestApplication.class, args);

        assert (ctx != null);
    }


    //TODO Find out what the AssertionDecoder from the example is for (try leaving it out).
    class AssertionDecoder implements Decoder {

        private final Decoder delegate;

        public AssertionDecoder(Decoder delegate) {
            this.delegate = delegate;
        }

        @Override
        public Object decode(Response response, Type type)
                throws IOException, DecodeException, FeignException {
            assertThat(response.request()).isNotNull();
            return delegate.decode(response, type);
        }

    }

    @Bean
    public MockClient mockClient(){
        //Create MockClient and set behaviour (which requests are accepted and with which response)

        String stringUser1 = "{" +
                "\"login\": \"jmcclane\"," +
                "\"firstName\": \"John\"," +
                "\"lastName\": \"McClane\"," +
                "\"groups\": [\"good_guys\",\"user\"]" + //TODO Was groupSet in ObjectMapper. How can we know what the user service returns?
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
        //TODO Move MockClient behaviour configuration to test setup ?

        return mockClient;
    }

    @Bean
    @Primary
    public UserServiceProxy mockUserServiceProxy(MockClient mockClient) {

        //Build Feign with MockClient
        UserServiceProxy mockUserServiceProxy = Feign.builder()
                .decoder(new AssertionDecoder(new JacksonDecoder()))
                .client(mockClient)
                .contract(new SpringMvcContract())
                /* Got : java.lang.IllegalStateException: Method getServiceInfo not annotated with HTTP method type (ex. GET, POST)
                Found : https://github.com/spring-cloud/spring-cloud-netflix/issues/760 *///TODO To be removed
                .target(new MockTarget<>(UserServiceProxy.class));
        //TODO Look at other examples in MockClientTest

        return mockUserServiceProxy;
    }

}
