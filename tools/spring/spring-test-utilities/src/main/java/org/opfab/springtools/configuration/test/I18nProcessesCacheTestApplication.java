/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.springtools.configuration.test;

import org.opfab.springtools.configuration.oauth.I18nProcessesCache;
import org.opfab.springtools.configuration.oauth.I18nProcessesProxy;
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

@SpringBootApplication
@EnableConfigurationProperties
@Import({ I18nProcessesCache.class })
public class I18nProcessesCacheTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(I18nProcessesCacheTestApplication.class, args);

        assert (ctx != null);
    }

    @Bean
    public MockClient mockI18nClient() {

        String stringTestI18n = "{ \"summary\": \"Summary translated {{arg1}}\",\"title\": \"Title translated\"}";

        MockClient mockClient = new MockClient();   
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/process2/i18n?version=1",
                200, stringTestI18n);
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/process1/i18n?version=1",
                200, stringTestI18n);
        return mockClient;
    }

    @Bean
    @Primary
    public I18nProcessesProxy mockI18nProcesssProxy(MockClient mockI18nClient) {
        
        // Build Feign with MockClient
        I18nProcessesProxy mockServiceProxy = Feign.builder().decoder(new JacksonDecoder()).client(mockI18nClient)
                .contract(new SpringMvcContract()) // Needed because spring-cloud-starter-feign implements a default
                                                   // Contract class "SpringMvcContract". See
                                                   // https://github.com/spring-cloud/spring-cloud-netflix/issues/760
                .target(new MockTarget<>(I18nProcessesProxy.class));

        return mockServiceProxy;
    }

}
