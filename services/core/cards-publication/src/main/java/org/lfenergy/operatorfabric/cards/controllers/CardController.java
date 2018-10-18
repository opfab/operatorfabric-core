/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.controllers;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.model.CardCreationReport;
import org.lfenergy.operatorfabric.cards.model.CardData;
import org.lfenergy.operatorfabric.cards.services.CardWriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.validation.Valid;

/**
 * <p></p>
 * Created on 10/07/18
 *
 * @author davibind
 */
@RestController
@RequestMapping("/cards")
@Slf4j
public class CardController {

    @Autowired
    private CardWriteService cardWriteService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public @Valid Mono<? extends CardCreationReport> createCards(@Valid @RequestBody Flux<CardData> cards){
        return cardWriteService.createCardsWithResult(cards);

    }
}
