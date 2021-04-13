/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.lfenergy.operatorfabric.cards.publication.controllers;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.aop.process.mongo.models.UserActionTraceData;
import org.lfenergy.operatorfabric.cards.publication.model.CardCreationReportData;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.services.CardProcessingService;
import org.lfenergy.operatorfabric.cards.publication.services.CardRepositoryService;
import org.lfenergy.operatorfabric.cards.publication.services.UserBasedOperationResult;
import org.lfenergy.operatorfabric.springtools.configuration.oauth.OpFabJwtAuthenticationToken;
import org.lfenergy.operatorfabric.users.model.CurrentUserWithPerimeters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import javax.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;


import javax.validation.Valid;
import java.security.Principal;
import java.time.Instant;
import java.util.Optional;

/**
 * Synchronous controller
 */
@RestController
@RequestMapping("/cards")
@Slf4j

public class CardController {

    @Autowired
    private CardProcessingService cardProcessingService;


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public @Valid CardCreationReportData createCardOld(@Valid @RequestBody CardPublicationData card) {
        return cardProcessingService.processCard(card);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.OK)
    public Void deleteCards(@RequestParam String endDateBefore) {
        cardProcessingService.deleteCards(parseAsInstant(endDateBefore));
        return null;
    }

    @PostMapping("/userCard")
    @ResponseStatus(HttpStatus.CREATED)
    public @Valid CardCreationReportData createUserCard(@Valid @RequestBody CardPublicationData card, Principal principal) {
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();
        return cardProcessingService.processUserCard(card,user);
    }

    @DeleteMapping("/userCard/{id}")
    public Void deleteUserCard(@PathVariable String id, HttpServletResponse response, Principal principal) {

        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();
        try {
            Optional<CardPublicationData> deletedCard = cardProcessingService.deleteUserCard(id, user);
            if (!deletedCard.isPresent()) {
                    response.setStatus(404);
                }
        }
        catch (Exception e) {
                    response.setStatus(403);
        }
        return null;

    }

    @DeleteMapping("/{id}")
    public Void deleteCards(@PathVariable String id, HttpServletResponse response) {
        Optional<CardPublicationData> deletedCard = cardProcessingService.deleteCard(id);
        if (!deletedCard.isPresent()) response.setStatus(404);
        else response.setStatus(200);
        return null;
    }

    /**
     * POST userAcknowledgement for a card updating the card
     *
     * @param cardUid Id to create publisher
     */
    @PostMapping("/userAcknowledgement/{cardUid}")
    public Void postUserAcknowledgement(Principal principal,
                                              @PathVariable("cardUid") String cardUid, HttpServletResponse response) {
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();

        UserBasedOperationResult result=  cardProcessingService.processUserAcknowledgement(cardUid,user.getUserData());
 
        if (!result.isCardFound()) response.setStatus(404);
        else  {
            if (!result.getOperationDone()) response.setStatus(200);
            else response.setStatus(201);
        }
        return null;
    }

    /**
     * POST userCardRead for a card
     *
     * @param cardUid of the card that has been read
     */
    @PostMapping("/userCardRead/{cardUid}")
    public Void postUserCardRead(Principal principal,
                                       @PathVariable("cardUid") String cardUid, HttpServletResponse response) {
        UserBasedOperationResult result= cardProcessingService.processUserRead(cardUid, principal.getName());
        if (!result.isCardFound()) response.setStatus(404); 
        else { 
            if (!result.getOperationDone()) response.setStatus(200);
            else response.setStatus(201);
        }
        return null;
    }

    /**
     * DELETE userAcknowledgement for a card to updating that card
     *
     * @param cardUid Id to create publisher
     */
    @DeleteMapping("/userAcknowledgement/{cardUid}")
    public Void deleteUserAcknowledgement(Principal principal, @PathVariable("cardUid") String cardUid,
                                                HttpServletResponse response) {
        UserBasedOperationResult result = cardProcessingService.deleteUserAcknowledgement(cardUid, principal.getName());
        if (!result.isCardFound()) response.setStatus(404);
        else {
            if (!result.getOperationDone()) response.setStatus(204);
            else response.setStatus(200);
            }
        return null;
    }

        /**
     * DELETE userRead for a card 
     *
     * @param cardUid Id of the card to update
     */
    @DeleteMapping("/userCardRead/{cardUid}")
    public Void deleteUserRead(Principal principal, @PathVariable("cardUid") String cardUid,
                                                HttpServletResponse response) {
        UserBasedOperationResult result =  cardProcessingService.deleteUserRead(cardUid,principal.getName());
        if (!result.isCardFound()) response.setStatus(404);
        else {
            if (!result.getOperationDone()) response.setStatus(204);
            else response.setStatus(200);
            }
        return null;
    }

    @GetMapping("traces/ack/{cardUid}")
    @ResponseStatus(HttpStatus.OK)
    public @Valid UserActionTraceData searchTraces(Principal principal, @PathVariable String cardUid) {
        return cardProcessingService.findTraceByCardUid(principal.getName(), cardUid);

    }

        /** Takes string representing number of milliseconds since Epoch and returns corresponding Instant
     * */
    private static Instant parseAsInstant(String instantAsEpochMillString) {
        return instantAsEpochMillString==null?null:Instant.ofEpochMilli(Long.parseLong(instantAsEpochMillString));
    }
}
