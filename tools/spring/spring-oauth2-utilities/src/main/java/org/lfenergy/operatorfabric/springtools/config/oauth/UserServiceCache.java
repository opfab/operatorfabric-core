/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.springtools.config.oauth;

import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.stereotype.Component;

@EnableCaching
@Component
public class UserServiceCache {

    @Autowired
    private UserServiceProxy proxy;

    /**
     *
     * @param principalId
     * @return {@link User} object retrieved from cache or from Users service through proxy
     */
    @Cacheable(value = "user", key = "{#principalId}")
    public User fetchUserFromCacheOrProxy(String principalId){
        return proxy.fetchUser(principalId);
    }
    /* Creation of dedicated UserServiceCache class because cache won't work if cached method is called from its own class.
    See : https://docs.spring.io/spring/docs/current/spring-framework-reference/integration.html#cache-annotation-enable
    "The default advice mode for processing caching annotations is proxy, which allows for interception of calls through the proxy only.
    Local calls within the same class cannot get intercepted that way."
    */

    @CacheEvict(value = "user", allEntries = true)
    public void clearUserCache(){
    }

    @CacheEvict(value = "user", key = "{#principalId}")
    public void clearUserCache(String principalId){
    }


}

