/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.springtools.configuration.oauth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.stereotype.Component;

import feign.FeignException;

import org.opfab.businessconfig.model.Process;

import java.util.HashMap;
import java.util.Map;


/**
 * <p>This class is responsible for retrieving Process data as {@link Process} information either from cache or from the {@link ProcessesProxy},
 * as well as clearing the cache on request.</p>
 */
@EnableCaching
@Component
public class ProcessesCache {

    @Autowired
    private ProcessesProxy client;

    protected static final Map<String,String> tokens = new HashMap<>();

    // The token is stored in the service as when the org.lfenergy.operatorfabric.cards.consultation.services.CardSubscription
    // class call the cache , it does not have the user token
    // it is set each time the user make a request as it can have been refresh in between
    public static void setTokenForUserRequest(String user,String token)
    {
        tokens.put(user, token);
    }

    /** Retrieve Process data from cache or from Businessconfig service through proxy
     * @param process process id
     * @param version process version
     * @return {@link Process}
     */
    @Cacheable(value = "process", key = "{#process, #version}")
    public Process fetchProcessFromCacheOrProxy(String process, String version) throws FeignException {
        return client.getProcess(process, version);
    }

    /** Clear all cached  data
     */
    @CacheEvict(value = "process", allEntries = true)
    public void clearCache(){
        //Cache eviction is triggered through @CacheEvict annotation
    }

    /** Clear cached  data for a given process and version
     * @param process process id
     * @param version process version
     */
    @CacheEvict(value = "process", key = "{#process, #version}")
    public void clearCache(String process, String version){
        //Cache eviction is triggered through @CacheEvict annotation
    }
}

