/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.controllers;

import org.opfab.useractiontracing.model.UserActionEnum;
import org.opfab.useractiontracing.services.UserActionLogService;
import org.opfab.cards.publication.configuration.Services;
import org.opfab.cards.publication.model.CardCreationReport;
import org.opfab.cards.publication.model.Card;
import org.opfab.cards.publication.model.FieldToTranslate;
import org.opfab.cards.publication.model.TranslatedField;
import org.opfab.cards.publication.repositories.UserBasedOperationResult;
import org.opfab.cards.publication.services.CardDeletionService;
import org.opfab.cards.publication.services.CardProcessingService;
import org.opfab.cards.publication.services.CardTranslationService;
import org.opfab.springtools.configuration.oauth.OpFabJwtAuthenticationToken;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.security.Principal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/cards")

public class CardController {

    private CardDeletionService cardDeletionService;
    private CardProcessingService cardProcessingService;
    private CardTranslationService cardTranslationService;
    private UserActionLogService userActionLogService;

    private @Value("${operatorfabric.userActionLogActivated:true}") boolean userActionLogActivated;

    CardController(
            Services services) {
        cardDeletionService = services.getCardDeletionService();
        cardTranslationService = services.getCardTranslationService();
        userActionLogService = services.getUserActionLogService();
        cardProcessingService = services.getCardProcessingService();

    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CardCreationReport createCard(@RequestBody Card card,
            HttpServletResponse response, Principal principal) {
        // Overwrite eventual uid sent by client
        card.setUid(UUID.randomUUID().toString());
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = null;
        Jwt token = null;
        if (jwtPrincipal != null) {
            user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();
            token = jwtPrincipal.getToken();
        }

        cardProcessingService.processCard(card, Optional.ofNullable(user), Optional.ofNullable(token), false);

        logUserAction(user != null ? user.getUserData().getLogin() : null,
                card.getParentCardId() != null ? UserActionEnum.SEND_RESPONSE : UserActionEnum.SEND_CARD,
                user != null ? user.getUserData().getEntities() : null, card.getUid(), null);

        return new CardCreationReport(card.getId(), card.getUid());
    }

    @PatchMapping(value = "/{id}", produces = { "application/json" }, consumes = { "application/json" })
    @ResponseStatus(HttpStatus.OK)
    public CardCreationReport patchCard( @PathVariable String id, @RequestBody Card card,
                                          HttpServletResponse response, Principal principal) {
        // Overwrite eventual uid sent by client
        card.setUid(UUID.randomUUID().toString());
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = null;
        Jwt token = null;
        if (jwtPrincipal != null) {
            user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();
            token = jwtPrincipal.getToken();
        }

        cardProcessingService.patchCard(id, card, Optional.ofNullable(user), Optional.ofNullable(token));

        logUserAction(user != null ? user.getUserData().getLogin() : null,
                      UserActionEnum.SEND_CARD,
                      user != null ? user.getUserData().getEntities() : null, card.getUid(), null);

        return new CardCreationReport(card.getId(),card.getUid());
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.OK)
    public Void deleteCards(@RequestParam String endDateBefore) {
        cardDeletionService.deleteCardsByEndDateBefore(parseAsInstant(endDateBefore));
        return null;
    }

    @PostMapping("/userCard")
    @ResponseStatus(HttpStatus.CREATED)
    public CardCreationReport createUserCard(@RequestBody Card card,
            Principal principal) {
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();
        Jwt token = jwtPrincipal.getToken();
        cardProcessingService.processUserCard(card, user, Optional.of(token));

        logUserAction(user.getUserData().getLogin(),
                card.getParentCardId() != null ? UserActionEnum.SEND_RESPONSE : UserActionEnum.SEND_CARD,
                user.getUserData().getEntities(), card.getUid(), null);
        return new CardCreationReport(card.getId(), card.getUid());
    }

    @DeleteMapping("/userCard/{id}")
    public Void deleteUserCard(@PathVariable String id, HttpServletResponse response, Principal principal) {

        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();
        try {
            Optional<Card> deletedCard = cardDeletionService.deleteUserCard(id, user,
                    Optional.of(jwtPrincipal.getToken()));
            if (!deletedCard.isPresent()) {
                response.setStatus(404);
            }
        } catch (Exception e) {
            response.setStatus(403);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public Void deleteCards(@PathVariable String id, HttpServletResponse response, Principal principal) {
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = null;
        Jwt token = null;
        if (jwtPrincipal != null) {
            user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();
            token = jwtPrincipal.getToken();
        }
        Optional<Card> deletedCard = cardDeletionService.deleteCardByIdWithUser(id, Optional.ofNullable(user),
                Optional.ofNullable(token));
        if (!deletedCard.isPresent())
            response.setStatus(404);
        else
            response.setStatus(200);

        return null;
    }

    /**
     * POST userAcknowledgement for a card updating the card
     *
     * @param cardUid Id to create publisher
     */
    @PostMapping("/userAcknowledgement/{cardUid}")
    public Void postUserAcknowledgement(Principal principal,
            @PathVariable("cardUid") String cardUid,
            HttpServletResponse response,
            @RequestBody List<String> entitiesAcks) {
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();

        UserBasedOperationResult result = cardProcessingService.processUserAcknowledgement(cardUid, user, entitiesAcks);

        if (!result.isCardFound())
            response.setStatus(404);
        else {
            if (Boolean.TRUE.equals(result.getOperationDone()))
                response.setStatus(201);
            else
                response.setStatus(200);

            logUserAction(user.getUserData().getLogin(), UserActionEnum.ACK_CARD, user.getUserData().getEntities(),
                    cardUid, null);

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
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();

        UserBasedOperationResult result = cardProcessingService.processUserRead(cardUid, user.getUserData().getLogin());
        if (!result.isCardFound())
            response.setStatus(404);
        else {
            if (Boolean.TRUE.equals(result.getOperationDone()))
                response.setStatus(201);
            else
                response.setStatus(200);

            logUserAction(user.getUserData().getLogin(), UserActionEnum.READ_CARD, user.getUserData().getEntities(),
                    cardUid, null);
        }
        return null;
    }

    /**
     * POST cancelUserAcknowledgement for a card to updating that card
     *
     * @param cardUid Id to create publisher
     */
    @PostMapping("/cancelUserAcknowledgement/{cardUid}")
    public Void deleteUserAcknowledgement(Principal principal, @PathVariable("cardUid") String cardUid,
            @RequestBody List<String> entitiesAcks,
            HttpServletResponse response) {
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();
        UserBasedOperationResult result = cardProcessingService.deleteUserAcknowledgement(cardUid, user, entitiesAcks);
        if (!result.isCardFound())
            response.setStatus(404);
        else {
            if (Boolean.TRUE.equals(result.getOperationDone()))
                response.setStatus(200);
            else
                response.setStatus(204);

            logUserAction(user.getUserData().getLogin(), UserActionEnum.UNACK_CARD, user.getUserData().getEntities(),
                    cardUid, null);
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
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();
        UserBasedOperationResult result = cardProcessingService.deleteUserRead(cardUid, user.getUserData().getLogin());
        if (!result.isCardFound())
            response.setStatus(404);
        else {
            if (Boolean.TRUE.equals(result.getOperationDone()))
                response.setStatus(200);
            else
                response.setStatus(204);

            logUserAction(user.getUserData().getLogin(), UserActionEnum.UNREAD_CARD, user.getUserData().getEntities(),
                    cardUid, null);

        }
        return null;
    }

    /**
     * Takes string representing number of milliseconds since Epoch and returns
     * corresponding Instant
     */
    private static Instant parseAsInstant(String instantAsEpochMillString) {
        return instantAsEpochMillString == null ? null : Instant.ofEpochMilli(Long.parseLong(instantAsEpochMillString));
    }

    @PostMapping("/translateCardField")
    public TranslatedField translateCardField(HttpServletRequest request, HttpServletResponse response,
            @Valid @RequestBody FieldToTranslate fieldToTranslate) {

        if (fieldToTranslate == null || fieldToTranslate.process().isEmpty()
                || fieldToTranslate.processVersion().isEmpty()
                || fieldToTranslate.i18nValue() == null || fieldToTranslate.i18nValue().key().isEmpty()) {
            response.setStatus(400);
            return null;
        } else {
            String translatedField = cardTranslationService.translateCardField(fieldToTranslate.process(),
                    fieldToTranslate.processVersion(),
                    fieldToTranslate.i18nValue());
            return new TranslatedField(translatedField);
        }
    }

    /**
     * POST request to reset acks and reads for a card and resend card as reminder
     *
     * @param cardUid of the card
     */
    @PostMapping("/resetReadAndAcks/{cardUid}")
    public Void postResetReadAndAcks(Principal principal,
            @PathVariable("cardUid") String cardUid, HttpServletResponse response) {

        UserBasedOperationResult result = cardProcessingService.resetReadAndAcks(cardUid);
        if (!result.isCardFound())
            response.setStatus(404);
        else {
            if (Boolean.TRUE.equals(result.getOperationDone()))
                response.setStatus(200);
        }
        return null;
    }

    @PostMapping("/rateLimiter")
    public void resetRateLimiter() {
        cardProcessingService.resetRateLimiter();
    }

    private void logUserAction(String login, UserActionEnum actionType, List<String> entities, String cardUid,
            String comment) {
        if (userActionLogActivated)
            userActionLogService.insertUserActionLog(login, actionType, entities, cardUid, comment);
    }
}
