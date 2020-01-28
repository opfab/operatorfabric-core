
package org.lfenergy.operatorfabric.springtools.configuration.oauth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;

/**
 * <p>Listens for {@link UpdatedUserEvent} to clear user cache for a given user.</p>
 * See issue #64
 * @author Alexandra Guironnet
 */
@Configuration
public class UpdateUserEventListener {

    @Autowired
    UserServiceCache userServiceCache;

    @EventListener
    public void handleUserUpdate(UpdatedUserEvent event) {
        userServiceCache.clearUserCache(event.getLogin());
    }
}


