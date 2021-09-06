/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.publication.controllers;

import lombok.extern.slf4j.Slf4j;
import org.opfab.aop.process.mongo.models.UserActionTraceData;
import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.cards.publication.services.CardProcessingService;
import org.opfab.cards.publication.services.UserBasedOperationResult;
import org.opfab.springtools.configuration.oauth.OpFabJwtAuthenticationToken;
import org.opfab.users.model.CurrentUserWithPerimeters;
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
    public @Valid Void createCardOld(@Valid @RequestBody CardPublicationData card, HttpServletResponse response, Principal principal) {
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = null ;
        if (jwtPrincipal!=null) user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();
        cardProcessingService.processCard(card, Optional.ofNullable(user));
        return null;
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.OK)
    public Void deleteCards(@RequestParam String endDateBefore) {
        cardProcessingService.deleteCards(parseAsInstant(endDateBefore));
        return null;
    }

    @PostMapping("/userCard")
    @ResponseStatus(HttpStatus.CREATED)
    public @Valid Void createUserCard(@Valid @RequestBody CardPublicationData card, Principal principal) {
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();
        cardProcessingService.processUserCard(card,user);
        return null;
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
    public Void deleteCards(@PathVariable String id, HttpServletResponse response, Principal principal) {
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = null ;
        if (jwtPrincipal!=null) user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();

        Optional<CardPublicationData> deletedCard = cardProcessingService.deleteCard(id, Optional.ofNullable(user));
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
            if (Boolean.TRUE.equals(result.getOperationDone()))
                response.setStatus(201);
            else
                response.setStatus(200);
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
            if (Boolean.TRUE.equals(result.getOperationDone()))
                response.setStatus(201);
            else
                response.setStatus(200);
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
            if (Boolean.TRUE.equals(result.getOperationDone()))
                response.setStatus(200);
            else
                response.setStatus(204);
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
            if (Boolean.TRUE.equals(result.getOperationDone()))
                response.setStatus(200);
            else
                response.setStatus(204);
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
