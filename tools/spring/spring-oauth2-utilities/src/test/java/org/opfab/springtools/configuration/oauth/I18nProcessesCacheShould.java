/* Copyright (c) 2021, RTE (http://www.rte-france.com)
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
import org.opfab.springtools.configuration.test.I18nProcessesCacheTestApplication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;

@SpringBootTest(classes = I18nProcessesCacheTestApplication.class)
public class I18nProcessesCacheShould {

    @Autowired
    I18nProcessesCache i18nProcessesCache;

    @Autowired
    MockClient mockI18nClient;

    private final String TEST_URL = "/businessconfig/processes/process1/translation?version=1";
    private final String TEST_URL_2 = "/businessconfig/processes/process2/translation?version=1";

    private final String TEST_PROCESS = "process1";
    private final String TEST_PROCESS_2 = "process2";
    private final String TEST_VERSION = "1";

    @BeforeEach
    public void setup() {
        i18nProcessesCache.clearCache();
        mockI18nClient.resetRequests();
    }

    @Test
    public void objectsUnderTestAreNotNull() {
        assertThat(i18nProcessesCache).isNotNull();
        assertThat(mockI18nClient).isNotNull();
    }

    @Test
    public void mockClientRequestsAreResetBeforeEachTest() {
        assertThat(mockI18nClient.verifyTimes(HttpMethod.GET, TEST_URL, 0)).isEmpty();
    }

    @Test
    public void shouldNotHitCacheForFirstCall() {
        // First call
        i18nProcessesCache.fetchProcessI18nFromCacheOrProxy(TEST_PROCESS, TEST_VERSION);
        mockI18nClient.verifyTimes(HttpMethod.GET, TEST_URL, 1);
    }

    @Test
    public void shouldReturnSameDataForSecondCall() {

        // First call
        JsonNode trx1 = i18nProcessesCache.fetchProcessI18nFromCacheOrProxy(TEST_PROCESS, TEST_VERSION);

        // Second call
        JsonNode trx2 = i18nProcessesCache.fetchProcessI18nFromCacheOrProxy(TEST_PROCESS, TEST_VERSION);

        assertThat(trx1).isNotNull();
        assertThat(trx1).isEqualTo(trx2);
    }

    @Test
    public void shouldHitCacheForSecondCall() {

        // First call
        i18nProcessesCache.fetchProcessI18nFromCacheOrProxy(TEST_PROCESS, TEST_VERSION);

        // Second call
        i18nProcessesCache.fetchProcessI18nFromCacheOrProxy(TEST_PROCESS, TEST_VERSION);

        mockI18nClient.verifyTimes(HttpMethod.GET, TEST_URL, 1);
    }

    @Test
    public void shouldClearSelectedCache() {

        // First call
        i18nProcessesCache.fetchProcessI18nFromCacheOrProxy(TEST_PROCESS, TEST_VERSION);
        i18nProcessesCache.fetchProcessI18nFromCacheOrProxy(TEST_PROCESS_2, TEST_VERSION);

        // Clear cache only for process2
        i18nProcessesCache.clearCache(TEST_PROCESS_2, TEST_VERSION);

        // Second call
        i18nProcessesCache.fetchProcessI18nFromCacheOrProxy(TEST_PROCESS, TEST_VERSION);
        i18nProcessesCache.fetchProcessI18nFromCacheOrProxy(TEST_PROCESS_2, TEST_VERSION);

        // Check number of calls
        mockI18nClient.verifyTimes(HttpMethod.GET, TEST_URL, 1);
        mockI18nClient.verifyTimes(HttpMethod.GET, TEST_URL_2, 2);
    }

}
