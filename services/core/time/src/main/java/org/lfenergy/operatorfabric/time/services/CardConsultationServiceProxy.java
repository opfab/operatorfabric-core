/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.time.services;

import org.lfenergy.operatorfabric.cards.model.Card;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * Feign proxy for User service
 *
 * @author David Binder
 */
@FeignClient(value = "cards-consultation", primary = false)
public interface CardConsultationServiceProxy {
    @RequestMapping(value = "/{millisTime}/next",
       produces = { "application/json" },
       method = RequestMethod.GET)
    //
    Card fetchNextCard(@PathVariable("millisTime") String login) ;

    @RequestMapping(value = "/{millisTime}/previous",
            produces = { "application/json" },
            method = RequestMethod.GET)
        //
    Card fetchPreviousCard(@PathVariable("millisTime") String login) ;
}
