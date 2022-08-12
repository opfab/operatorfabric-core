/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.springtools.configuration.test;

import org.opfab.springtools.configuration.oauth.ProcessesCache;
import org.opfab.springtools.configuration.oauth.ProcessesProxy;
import org.opfab.springtools.configuration.oauth.UserServiceProxy;
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
@Import({ ProcessesCache.class })
public class ProcessesCacheTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(ProcessesCacheTestApplication.class, args);

        assert (ctx != null);
    }

    @Bean
    public MockClient mockProcessesClient() {

        String stringTestProcesses1 = "{ \"id\": \"api_test\"" +
                ",\"name\": \"api_test name\"" +
                ",\"version\": \"1\"" +
                ",\"states\": {\"messageState\": {\"name\": \"Message\"}}}";

        String stringTestProcesses2 = "{ \"id\": \"api_test2\"" +
                ",\"name\": \"api_test2 name\"" +
                ",\"version\": \"2\"" +
                ",\"states\": {\"messageState2\": {\"name\": \"Message2\"}}}";

        String stringTestProcesses3 = "{ \"id\": \"processWithNoState\"" +
                ",\"name\": \"processWithNoState name\"" +
                ",\"version\": \"1\"}";

        String stringTestProcesses4 = "{ \"id\": \"process1\"" +
                ",\"name\": \"process1 name\"" +
                ",\"version\": \"0\"" +
                ",\"states\": {\"state1\": {\"name\": \"Message\"}}}";

        String stringTestProcesses5 = "{ \"id\": \"\"" +
                ",\"name\": \"taskId name\"" +
                ",\"version\": \"myVersion\"" +
                ",\"states\": {\"currentState\": {\"name\": \"Message\"}}}";

        String stringTestProcesses6 = "{ \"id\": \"PROCESS_CARD_USER\"" +
                ",\"name\": \"PROCESS_CARD_USER name\"" +
                ",\"version\": \"0\"" +
                ",\"states\": {\"state1\": {\"name\": \"Message\"}}}";

        String stringTestProcesses7 = "{ \"id\": \"process2\"" +
                ",\"name\": \"process2 name\"" +
                ",\"version\": \"0\"" +
                ",\"states\": {\"state2\": {\"name\": \"Message\"}}}";

        String stringTestProcesses8 = "{ \"id\": \"process3\"" +
                ",\"name\": \"process3 name\"" +
                ",\"version\": \"0\"" +
                ",\"states\": {\"state3\": {\"name\": \"Message\"}}}";

        String stringTestProcesses9 = "{ \"id\": \"process4\"" +
                ",\"name\": \"process4 name\"" +
                ",\"version\": \"0\"" +
                ",\"states\": {\"state4\": {\"name\": \"Message\"}}}";

        String stringTestProcesses10 = "{ \"id\": \"process5\"" +
                ",\"name\": \"process5 name\"" +
                ",\"version\": \"0\"" +
                ",\"states\": {\"state5\": {\"name\": \"Message\"}}}";

        MockClient mockClient = new MockClient();
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/api_test?version=1",
                200, stringTestProcesses1);
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/api_test2?version=2",
                200, stringTestProcesses2);
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/processWithNoState?version=1",
                200, stringTestProcesses3);
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/process1?version=0",
                200, stringTestProcesses4);
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/taskId?version=myVersion",
                200, stringTestProcesses5);
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/PROCESS_CARD_USER?version=0",
                200, stringTestProcesses6);
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/process2?version=0",
                200, stringTestProcesses7);
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/process3?version=0",
                200, stringTestProcesses8);
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/process4?version=0",
                200, stringTestProcesses9);
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/process5?version=0",
                200, stringTestProcesses10);
        return mockClient;
    }

    @Bean
    @Primary
    public ProcessesProxy mockProcessesProxy(MockClient mockProcessesClient) {

        // Build Feign with MockClient
        ProcessesProxy mockServiceProxy = Feign.builder()
                .decoder(new JacksonDecoder())
                .client(mockProcessesClient)
                .contract(new SpringMvcContract()) // Needed because spring-cloud-starter-feign implements a default
                // Contract class "SpringMvcContract". See
                // https://github.com/spring-cloud/spring-cloud-netflix/issues/760
                .target(new MockTarget<>(ProcessesProxy.class));

        return mockServiceProxy;
    }
}
