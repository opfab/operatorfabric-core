
package org.lfenergy.operatorfabric.actions.services.feign;

import org.lfenergy.operatorfabric.actions.model.Action;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

/**
 * Feign proxy for User service
 *
 * @author David Binder
 */
@FeignClient(value = "thirds", primary = false)
public interface ThirdsServiceProxy {
    @GetMapping(value = "/thirds/{thirdName}/{process}/{state}/actions/{actionKey}",
            produces = {"application/json"})
        //
    Action fetchAction(@PathVariable("thirdName") String thirdName,
                       @PathVariable("process") String process,
                       @PathVariable("state") String state,
                       @PathVariable("actionKey") String actionKey,
                       @RequestHeader("Authorization") String auth);
}
