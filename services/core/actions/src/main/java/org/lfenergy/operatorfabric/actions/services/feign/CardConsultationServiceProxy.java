/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.actions.services.feign;

import org.lfenergy.operatorfabric.cards.model.Card;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

/**
 * Feign proxy for Card Consultation service
 *
 */
//@FeignClient(value = "cards-consultation", primary = false)
public interface CardConsultationServiceProxy {
    @GetMapping(value = "/cards/{id}",
       produces = { "application/json" })
    //
    Card fetchCard(@PathVariable("id") String id, @RequestHeader("Authorization") String auth) ;
}
