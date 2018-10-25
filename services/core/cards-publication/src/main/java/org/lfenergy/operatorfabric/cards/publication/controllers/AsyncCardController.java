/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.publication.controllers;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.publication.model.CardData;
import org.lfenergy.operatorfabric.cards.publication.services.CardWriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import javax.validation.Valid;

/**
 * <p></p>
 * Created on 10/07/18
 *
 * @author davibind
 */
@RestController
@RequestMapping("/async/cards")
@Slf4j
public class AsyncCardController {

    @Autowired
    private CardWriteService cardWriteService;

    @PostMapping()
    @ResponseStatus(HttpStatus.ACCEPTED)
    public @Valid void createCards(@Valid @RequestBody Flux<CardData> cards){
        cardWriteService.createCardsAsyncParallel(cards);

    }
}
