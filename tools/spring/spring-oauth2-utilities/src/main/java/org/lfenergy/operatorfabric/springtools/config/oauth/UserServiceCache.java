package org.lfenergy.operatorfabric.springtools.config.oauth;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.stereotype.Component;

@EnableCaching
@Component
@Slf4j
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
        log.info("TestCache : fetchUserFromCacheOrProxy is run from UserServiceCache for key : "+principalId ); //TODO To be removed
        return proxy.fetchUser(principalId);
    }
    /* Creation of dedicated UserServiceCache class because cache won't work if cached method is called from its own class.
    See : https://docs.spring.io/spring/docs/current/spring-framework-reference/integration.html#cache-annotation-enable
    "The default advice mode for processing caching annotations is proxy, which allows for interception of calls through the proxy only.
    Local calls within the same class cannot get intercepted that way."
    */

    @CacheEvict(value = "user", allEntries = true)
    public void clearUserCache(){
        log.info("TestCache : clearUserCache is called for all entries");
    }

    @CacheEvict(value = "user", key = "{#principalId}")
    public void clearUserCache(String principalId){
        log.info("TestCache : clearUserCache is called for key {}", principalId);
    }


}

