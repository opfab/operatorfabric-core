package org.lfenergy.operatorfabric.springtools.config.oauth;

import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * <p></p>
 * Created on 17/09/18
 *
 * @author davibind
 */
@FeignClient(value = "users")
public interface UserServiceProxy {
    @RequestMapping(value = "/users/{login}",
       produces = { "application/json" },
       method = RequestMethod.GET)
    //
    User fetchUser(@PathVariable("login") String login) ;

}
