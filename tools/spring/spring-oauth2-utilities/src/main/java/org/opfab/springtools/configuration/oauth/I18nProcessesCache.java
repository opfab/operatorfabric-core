/* Copyright (c) 2021, RTE (http://www.rte-france.com)
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

import com.fasterxml.jackson.databind.JsonNode;

/**
 * <p>This class is responsible for retrieving i18n as {@link JsonNode} information either from cache or from the {@link I18nProcessesProxy},
 * as well as clearing the cache on request.</p>
 */
@EnableCaching
@Component
public class I18nProcessesCache {

    @Autowired
    private I18nProcessesProxy client;

    /** Retrieve i18n translation data from cache or from Businessconfig service through proxy
     * @param process process name 
     * @param version process version 
     * @return {@link JsonNode}
     */
    @Cacheable(value = "i18n")
    public JsonNode fetchProcessI18nFromCacheOrProxy(String process, String version) throws FeignException {
        return client.getTranslation(process, version);
    }

    /** Clear all cached  data
     */
    @CacheEvict(value = "i18n", allEntries = true)
    public void clearCache(){
        //Cache eviction is triggered through @CacheEvict annotation
    }

    /** Clear cached  data for a given process and version
     * @param process process name 
     * @param version process version 
     */
    @CacheEvict(value = "i18n")
    public void clearCache(String process, String version){
         //Cache eviction is triggered through @CacheEvict annotation
    }


}

