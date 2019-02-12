package org.lfenergy.operatorfabric.springtools.config.oauth;


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;

@Slf4j
@Configuration
public class UpdateUserEventListener {

    @Autowired
    UserServiceCache userServiceCache;

    @EventListener
    public void handleUserUpdate(UpdatedUserEvent event) {
        userServiceCache.clearUserCache(event.getLogin());
        log.info("Event was received for login "+event.getLogin()+
                " with id "+event.getId()+
                " by source "+event.getSource()+
                " from originService "+event.getOriginService()+"" +
                " with destinationService "+event.getDestinationService());
    }
}


