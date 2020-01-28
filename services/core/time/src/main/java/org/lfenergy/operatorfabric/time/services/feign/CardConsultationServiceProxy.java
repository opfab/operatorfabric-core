/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.time.services.feign;

import org.lfenergy.operatorfabric.cards.model.Card;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign proxy for User service
 *
 * @author David Binder
 */
@FeignClient(value = "cards-consultation", primary = false)
public interface CardConsultationServiceProxy {
    @GetMapping(value = "/{millisTime}/next",
       produces = { "application/json" })
    //
    Card fetchNextCard(@PathVariable("millisTime") Long millisTime) ;

    @GetMapping(value = "/{millisTime}/previous",
            produces = { "application/json" })
        //
    Card fetchPreviousCard(@PathVariable("millisTime") Long millisTime) ;
}
