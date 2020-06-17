/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.publication.controllers;

import java.security.Principal;

import javax.validation.Valid;

import org.lfenergy.operatorfabric.cards.publication.model.CardCreationReportData;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.services.CardProcessingService;
import org.lfenergy.operatorfabric.springtools.configuration.oauth.OpFabJwtAuthenticationToken;
import org.lfenergy.operatorfabric.users.model.CurrentUserWithPerimeters;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Synchronous controller
 *
 */
@RestController
@RequestMapping("/cards")

public class CardController {

    @Autowired
    private CardProcessingService cardProcessingService;



    /**
     * POST cards to create/update new cards
     * @param cards cards to create publisher
     * @return contains number of cards created and optional message
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public @Valid Mono<CardCreationReportData> createCards(@Valid @RequestBody Flux<CardPublicationData> cards){
        return cardProcessingService.processCards(cards);

    }

    @PostMapping("/userCard")
    @ResponseStatus(HttpStatus.CREATED)
    public @Valid Mono<CardCreationReportData> createUserCards(@Valid @RequestBody Flux<CardPublicationData> cards, Principal principal){
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        User user = ((CurrentUserWithPerimeters) jwtPrincipal.getPrincipal()).getUserData();
        return cardProcessingService.processUserCards(cards, user);

    }

    @DeleteMapping("/{processId}")
    @ResponseStatus(HttpStatus.OK)
    public void deleteCards(@PathVariable String processId){
        cardProcessingService.deleteCard(processId);
    }
    
    /**
     * POST userAcknowledgement for a card updating the card
     * @param card Id to create publisher
     */
    @PostMapping("/userAcknowledgement/{cardUid}")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Void> postUserAcknowledgement(Principal principal,
			@PathVariable("cardUid") String cardUid, ServerHttpResponse response) {
    	return cardProcessingService.processUserAcknowledgement(Mono.just(cardUid), principal.getName()).doOnNext(result -> {
    		if (!result.isCardFound()) {
    			response.setStatusCode(HttpStatus.NOT_FOUND);
    		} else if (!result.getOperationDone()) {
    			response.setStatusCode(HttpStatus.OK);
    		}
		}).then();
    }

    /**
     * DELETE userAcknowledgement for a card to updating that card
     * @param card Id to create publisher
     */
	@DeleteMapping("/userAcknowledgement/{cardUid}")
	@ResponseStatus(HttpStatus.OK)
	public Mono<Void> deleteUserAcknowledgement(Principal principal, @PathVariable("cardUid") String cardUid,
			ServerHttpResponse response) {		
		return cardProcessingService.deleteUserAcknowledgement(Mono.just(cardUid),
					principal.getName()).doOnNext(result -> {
			if (!result.isCardFound()) {
				response.setStatusCode(HttpStatus.NOT_FOUND);
			} else if (!result.getOperationDone()) {
				response.setStatusCode(HttpStatus.NO_CONTENT);
			}
		} ).then();
	}

}
