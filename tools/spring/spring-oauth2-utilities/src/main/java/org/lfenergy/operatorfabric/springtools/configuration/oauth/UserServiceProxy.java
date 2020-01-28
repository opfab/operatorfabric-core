
package org.lfenergy.operatorfabric.springtools.configuration.oauth;

import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign proxy for User service
 *
 * @author David Binder
 */
//@FeignClient(value = "users", primary = false)
public interface UserServiceProxy {
    @GetMapping(value = "/users/{login}",
       produces = { "application/json" })
    User fetchUser(@PathVariable("login") String login) ;
}
