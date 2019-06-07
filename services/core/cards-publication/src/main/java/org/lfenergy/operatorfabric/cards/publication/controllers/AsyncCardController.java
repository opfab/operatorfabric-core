/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.publication.controllers;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.services.CardWriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.validation.Valid;

/**
 * Asynchronous controller
 *
 * @author David Binder
 */
@RestController
@RequestMapping("/async/cards")
@Slf4j
public class AsyncCardController {

    @Autowired
    private CardWriteService cardWriteService;

    /**
     * <p>POST cards to create/update new cards.</p>
     * <p>Always returns {@link HttpStatus#ACCEPTED}</p>
     *
     * @param cards cards to create publisher
     */
    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Mono<Integer> createCards(@Valid @RequestBody Flux<CardPublicationData> cards) throws InterruptedException {
//        cardWriteService.pushCardsAsyncParallel(cards);
        return cards
                .doOnNext(cardWriteService::pushCardAsyncParallel)
                .last().map(c->202);
    }
}
