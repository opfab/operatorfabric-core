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

        String stringTestI18nForApi_test = "{ \"summary\": \"Message received\",\"defaultProcess\": {" +
                "\"title\": \"Message\", \"summary\": \"Message received\"}}";

        String stringTestI18nForProcess1 = "{ \"summary\": \"Message received\",\"defaultProcess\": {" +
                "\"title\": \"Message\", \"summary\": \"Message received\"}, \"title\": \"Message\"}";

        String stringTestI18nForProcess2 = "{ \"summary\": \"Message received\",\"defaultProcess\": {" +
                "\"title\": \"Message\", \"summary\": \"Message received\"}, \"title\": \"Message\"}";

        String stringTestI18nForProcess3 = "{ \"summary\": \"Message received\",\"defaultProcess\": {" +
                "\"title\": \"Message\", \"summary\": \"Message received\"}, \"title\": \"Message\"}";

        String stringTestI18nForProcess4 = "{ \"summary\": \"Message received\",\"defaultProcess\": {" +
                "\"title\": \"Message\", \"summary\": \"Message received\"}, \"title\": \"Message\"}";

        String stringTestI18nForProcess5 = "{ \"summary\": \"Message received\",\"defaultProcess\": {" +
                "\"title\": \"Message\", \"summary\": \"Message received\"}, \"title\": \"Message\"}";

        String stringTestI18nForPROCESS_CARD_USER = "{ \"summary\": \"Message received\",\"defaultProcess\": {" +
                "\"title\": \"Message\", \"summary\": \"Message received\"}, \"title\": \"Message\"}";

        String stringTestI18nForTaskId = "{ \"MySummary\": \"Message received\", \"MyTitle\": \"Message\"}";

        
        MockClient mockClient = new MockClient();

        // api_test, version 1
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/api_test/i18n?version=1",
                200, stringTestI18nForApi_test);

        // process1, version 0
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/process1/i18n?version=0",
                200, stringTestI18nForProcess1);

        // process1, version 1
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/process1/i18n?version=1",
                200, stringTestI18n);

        // process2, version 0
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/process2/i18n?version=0",
                200, stringTestI18nForProcess2);

        // process2, version 1
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/process2/i18n?version=1",
                200, stringTestI18n);

        // process3, version 0
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/process3/i18n?version=0",
                200, stringTestI18nForProcess3);

        // process4, version 0
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/process4/i18n?version=0",
                200, stringTestI18nForProcess4);

        //process5, version 0
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/process5/i18n?version=0",
                200, stringTestI18nForProcess5);

        // PROCESS_CARD_USER, version 0
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/PROCESS_CARD_USER/i18n?version=0",
                200, stringTestI18nForPROCESS_CARD_USER);

        // taskId, version myVersion
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/taskId/i18n?version=myVersion",
                200, stringTestI18nForTaskId);

        // processWithNonExistingI18nFile, version 1
        mockClient = mockClient.add(HttpMethod.GET, "/businessconfig/processes/processWithNonExistingI18nFile/i18n?version=1",
                404, "");

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
