/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.springtools.configuration.oauth;

import feign.FeignException;
import org.lfenergy.operatorfabric.users.model.User;
import org.lfenergy.operatorfabric.users.model.CurrentUserWithPerimeters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.stereotype.Component;

/**
 * <p>This class is responsible for retrieving {@link User} information either from cache or from the {@link UserServiceProxy},
 * as well as clearing the cache on request.</p>
 * A dedicated class had to be created because caching annotations won't work if the cached method is called from its own class.
 *
 *
 */
@EnableCaching
@Component
public class UserServiceCache {

    @Autowired
    private UserServiceProxy proxy;

    /** Retrieve user data from cache or from Users service through proxy
     * @param principalId of the user to be retrieved
     * @return {@link User}
     */
    @Cacheable(value = "user", key = "{#principalId}")
    public User fetchUserFromCacheOrProxy(String principalId) throws FeignException {
        return proxy.fetchUser(principalId);
    }

    /** Retrieve current user data with his perimeters from cache or from Users service through proxy
     * @param principalId of the user to be retrieved
     * @return {@link CurrentUserWithPerimeters}
     */
    @Cacheable(value = "user", key = "{#principalId}")
    public CurrentUserWithPerimeters fetchCurrentUserWithPerimetersFromCacheOrProxy(String principalId) throws FeignException {
        return proxy.fetchCurrentUserWithPerimeters();
    }

    /** Clear all cached user data
     */
    @CacheEvict(value = "user", allEntries = true)
    public void clearUserCache(){
    }

    /** Clear cached user data for a given principalId
     * @param principalId of the user for which cache should be cleared
     */
    @CacheEvict(value = "user", key = "{#principalId}")
    public void clearUserCache(String principalId){
    }


}

