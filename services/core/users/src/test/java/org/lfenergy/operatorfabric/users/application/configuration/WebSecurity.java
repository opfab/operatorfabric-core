package org.lfenergy.operatorfabric.users.application.configuration;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;


@Component
@Slf4j
public class WebSecurity {

    public boolean checkUserLogin(Authentication authentication, String login) {
        User user = (User) authentication.getPrincipal();
        log.info("Check User Login performed : ");
        log.info("Principal : "+user.getLogin());
        log.info("login : "+login);
        return user.getLogin().equals(login);
    }

}
