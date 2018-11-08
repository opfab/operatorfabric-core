package org.lfenergy.operatorfabric.cards.publication.controllers;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.services.CardWriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

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
     * @param cards
     */
    @PostMapping()
    @ResponseStatus(HttpStatus.ACCEPTED)
    public @Valid void createCards(@Valid @RequestBody Flux<CardPublicationData> cards){
        cardWriteService.pushCardsAsyncParallel(cards);

    }
}
