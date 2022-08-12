/* Copyright (c) 2022, RTE (http://www.rte-france.com)
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
import org.opfab.springtools.configuration.test.ProcessesCacheTestApplication;
import org.opfab.businessconfig.model.Process;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = ProcessesCacheTestApplication.class)
class ProcessesCacheShould {

    @Autowired
    ProcessesCache processesCache;

    @Autowired
    MockClient mockProcessesClient;

    private final String TEST_URL = "/businessconfig/processes/api_test?version=1";
    private final String TEST_URL_2 = "/businessconfig/processes/api_test2?version=2";

    private final String TEST_PROCESS = "api_test";
    private final String TEST_PROCESS_2 = "api_test2";

    private final String TEST_VERSION = "1";
    private final String TEST_VERSION_2 = "2";

    @BeforeEach
    public void setup() {
        processesCache.clearCache();
        mockProcessesClient.resetRequests();
    }

    @Test
    void objectsUnderTestAreNotNull() {
        assertThat(processesCache).isNotNull();
        assertThat(mockProcessesClient).isNotNull();
    }

    @Test
    void mockClientRequestsAreResetBeforeEachTest() {
        assertThat(mockProcessesClient.verifyTimes(HttpMethod.GET, TEST_URL, 0)).isEmpty();
    }

    @Test
    void shouldNotHitCacheForFirstCall() {
        String principalID ="testuser";

        // First call
        processesCache.fetchProcessFromCacheOrProxy(TEST_PROCESS, TEST_VERSION, principalID);
        mockProcessesClient.verifyTimes(HttpMethod.GET, TEST_URL, 1);
    }

    @Test
    void shouldReturnSameDataForSecondCall() {
        String principalID1 ="testuser1";
        String principalID2 ="testuser2";

        // First call
        Process request1 = processesCache.fetchProcessFromCacheOrProxy(TEST_PROCESS, TEST_VERSION, principalID1);

        // Second call
        Process request2 = processesCache.fetchProcessFromCacheOrProxy(TEST_PROCESS, TEST_VERSION, principalID2);

        assertThat(request1).isNotNull().isEqualTo(request2);
    }

    @Test
    void shouldHitCacheForSecondCall() {
        String principalID ="testuser";

        // First call
        processesCache.fetchProcessFromCacheOrProxy(TEST_PROCESS, TEST_VERSION, principalID);

        // Second call
        processesCache.fetchProcessFromCacheOrProxy(TEST_PROCESS, TEST_VERSION, principalID);

        mockProcessesClient.verifyTimes(HttpMethod.GET, TEST_URL, 1);
    }

    @Test
    void shouldClearSelectedCache() {
        String principalID ="testuser";

        // First call
        processesCache.fetchProcessFromCacheOrProxy(TEST_PROCESS, TEST_VERSION, principalID);
        processesCache.fetchProcessFromCacheOrProxy(TEST_PROCESS_2, TEST_VERSION_2, principalID);

        // Clear cache only for process2
        processesCache.clearCache(TEST_PROCESS_2, TEST_VERSION_2);

        // Second call
        processesCache.fetchProcessFromCacheOrProxy(TEST_PROCESS, TEST_VERSION, principalID);
        processesCache.fetchProcessFromCacheOrProxy(TEST_PROCESS_2, TEST_VERSION_2, principalID);

        // Check number of calls
        mockProcessesClient.verifyTimes(HttpMethod.GET, TEST_URL, 1);
        mockProcessesClient.verifyTimes(HttpMethod.GET, TEST_URL_2, 2);
    }
}
