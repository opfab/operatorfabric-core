/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.externaldevices.application;

import feign.Feign;
import feign.jackson.JacksonDecoder;
import feign.jackson.JacksonEncoder;
import feign.mock.HttpMethod;
import feign.mock.MockClient;
import feign.mock.MockTarget;
import org.opfab.externaldevices.configuration.externaldevices.ExternalDevicesWatchdogProperties;
import org.opfab.externaldevices.drivers.ModbusDriverFactory;
import org.opfab.externaldevices.repositories.DeviceConfigurationRepository;
import org.opfab.externaldevices.repositories.SignalMappingRepository;
import org.opfab.externaldevices.repositories.UserConfigurationRepository;
import org.opfab.externaldevices.services.ConfigService;
import org.opfab.externaldevices.services.DevicesService;
import org.opfab.springtools.configuration.mongo.EnableOperatorFabricMongo;
import org.opfab.springtools.configuration.oauth.UserServiceProxy;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.openfeign.support.SpringMvcContract;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableOperatorFabricMongo
@EnableConfigurationProperties
@EnableMongoRepositories(basePackageClasses = {DeviceConfigurationRepository.class, UserConfigurationRepository.class, SignalMappingRepository.class})
@Import({DevicesService.class, ConfigService.class, ModbusDriverFactory.class, ExternalDevicesWatchdogProperties.class})
public class UnitTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(UnitTestApplication.class, args);
        assert (ctx != null);
    }

    @Bean
    public MockClient mockClient(){
        MockClient mockClient = new MockClient();
        mockClient = mockClient.ok(HttpMethod.PATCH, "/users/user1/settings", "")
                                .ok(HttpMethod.PATCH, "/users/user_configuration_that_doesnt_exist/settings", "");

        return mockClient;
    }

    @Bean
    @Primary
    public UserServiceProxy mockUserServiceProxy(MockClient mockClient) {

        //Build Feign with MockClient
        UserServiceProxy mockUserServiceProxy = Feign.builder()
                .encoder(new JacksonEncoder())
                .decoder(new JacksonDecoder())
                .client(mockClient)
                .contract(new SpringMvcContract()) // Needed because spring-cloud-starter-feign implements a default Contract class "SpringMvcContract". See https://github.com/spring-cloud/spring-cloud-netflix/issues/760
                .target(new MockTarget<>(UserServiceProxy.class));

        return mockUserServiceProxy;
    }

}
