/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.actions.services.feign;

import org.lfenergy.operatorfabric.actions.model.Action;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

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
                       @PathVariable("actionKey") String actionKey);
}
