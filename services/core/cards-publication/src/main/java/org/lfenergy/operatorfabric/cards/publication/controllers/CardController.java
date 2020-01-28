
package org.lfenergy.operatorfabric.cards.publication.controllers;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.publication.model.CardCreationReportData;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.services.CardWriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.validation.Valid;

/**
 * Synchronous controller
 *
 * @author David Binder
 */
@RestController
@RequestMapping("/cards")
@Slf4j
public class CardController {

    @Autowired
    private CardWriteService cardWriteService;

    /**
     * POST cards to create/update new cards
     * @param cards cards to create publisher
     * @return contains number of cards created and optional message
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public @Valid Mono<CardCreationReportData> createCards(@Valid @RequestBody Flux<CardPublicationData> cards){
        return cardWriteService.createCardsWithResult(cards);

    }

    @DeleteMapping("/{processId}")
    @ResponseStatus(HttpStatus.OK)
    public void deleteCards(@PathVariable String processId){
        cardWriteService.deleteCard(processId);
    }
}
