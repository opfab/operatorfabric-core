/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.actions.services.feign;


import org.lfenergy.operatorfabric.actions.model.ActionData;
import org.lfenergy.operatorfabric.thirds.model.Third;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

/**
 * Feign proxy for Thirds Service
 *
 *
 */
//@FeignClient(value = "thirds", primary = false)
public interface ThirdsServiceProxy {
    @GetMapping(value = "/thirds/{thirdName}/{process}/{state}/actions/{actionKey}",
            produces = {"application/json"})
        //
    ActionData fetchAction(@PathVariable("thirdName") String thirdName,
                           @PathVariable("process") String process,
                           @PathVariable("state") String state,
                           @PathVariable("actionKey") String actionKey,
                           @RequestHeader("Authorization") String auth);
}
