/* Copyright (c) 2018-2026, RTE (http://www.rte-france.com)
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
import org.opfab.cards.publication.model.CardUidRequest;
import org.opfab.cards.publication.model.UserAcknowledgementRequest;
import org.opfab.cards.publication.model.FieldToTranslate;
import org.opfab.cards.publication.model.TranslatedField;
import org.opfab.cards.publication.repositories.UserBasedOperationResult;
import org.opfab.cards.publication.services.CardDeletionService;
import org.opfab.cards.publication.services.CardProcessingService;
import org.opfab.cards.publication.services.CardReadAndAckService;
import org.opfab.cards.publication.services.CardTranslationService;
import org.opfab.cards.publication.services.CardPurgeService;
import org.opfab.configuration.oauth.OpFabJwtAuthenticationToken;
import org.opfab.common.users.CurrentUserWithPerimeters;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
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

    private static final Logger LOGGER = LoggerFactory.getLogger(CardController.class);

    private CardDeletionService cardDeletionService;
    private CardProcessingService cardProcessingService;
    private CardTranslationService cardTranslationService;
    private CardReadAndAckService cardReadAndAckService;
    private UserActionLogService userActionLogService;
    private CardPurgeService cardPurgeService;

    private @Value("${operatorfabric.userActionLogActivated:true}") boolean userActionLogActivated;

    CardController(
            Services services) {
        cardDeletionService = services.getCardDeletionService();
        cardTranslationService = services.getCardTranslationService();
        userActionLogService = services.getUserActionLogService();
        cardProcessingService = services.getCardProcessingService();
        cardReadAndAckService = services.getCardReadAndAckService();
        cardPurgeService = services.getCardPurgeService();

    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CardCreationReport createCard(@RequestBody Card card,
            HttpServletResponse response, Principal principal) {

        // Overwrite eventual uid sent by client
        card.uid = UUID.randomUUID().toString();
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = null;
        Jwt token = null;
        if (jwtPrincipal != null) {
            user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();
            token = jwtPrincipal.getToken();
        }

        cardProcessingService.processCard(card, Optional.ofNullable(user), Optional.ofNullable(token), false);

        logUserAction(user != null ? user.getUserData().getLogin() : null,
                card.parentCardId != null ? UserActionEnum.SEND_RESPONSE : UserActionEnum.SEND_CARD,
                user != null ? user.getUserData().getEntities() : null, card.uid, null);

        return new CardCreationReport(card.id, card.uid);
    }

    @PatchMapping(value = "/{id}", produces = { "application/json" }, consumes = { "application/json" })
    @ResponseStatus(HttpStatus.OK)
    public CardCreationReport patchCard(@PathVariable String id, @RequestBody Card card,
            HttpServletResponse response, Principal principal) {
        // Overwrite eventual uid sent by client
        card.uid = UUID.randomUUID().toString();
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
                user != null ? user.getUserData().getEntities() : null, card.uid, null);

        return new CardCreationReport(card.id, card.uid);
    }

    @DeleteMapping(params = "endDateBefore")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    public Void deleteCards(@RequestParam String endDateBefore, Principal principal) {

        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();

        cardDeletionService.deleteCardsByEndDateBefore(parseAsInstant(endDateBefore));

        logUserAction(user.getUserData().getLogin(),
                UserActionEnum.DELETE_CARD,
                user.getUserData().getEntities(), null,
                "Card deletion by end date before " + parseAsInstant(endDateBefore));

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
                card.parentCardId != null ? UserActionEnum.SEND_RESPONSE : UserActionEnum.SEND_CARD,
                user.getUserData().getEntities(), card.uid, null);
        return new CardCreationReport(card.id, card.uid);
    }

    /**
     * DELETE /userCard with query parameter cardId (new endpoint to avoid issues
     * with special characters)
     * 
     * @param cardId The card ID passed as query parameter
     */
    @DeleteMapping(value = "/userCard", params = "cardId")
    public Void deleteUserCardWithQueryParam(@RequestParam String cardId, HttpServletResponse response,
            Principal principal) {
        return performDeleteUserCard(cardId, response, principal);
    }

    /**
     * DELETE /userCard/{id} - deprecated endpoint
     */
    @DeleteMapping("/userCard/{id}")
    public Void deleteUserCard(@PathVariable String id, HttpServletResponse response, Principal principal) {
        LOGGER.warn("DEPRECATED API USAGE: DELETE /userCard/{} is deprecated. Use DELETE /userCard?cardId={} instead.",
                id, id);
        return performDeleteUserCard(id, response, principal);
    }

    private Void performDeleteUserCard(String cardId, HttpServletResponse response, Principal principal) {
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();
        try {
            Optional<Card> deletedCard = cardDeletionService.deleteUserCard(cardId, user,
                    Optional.of(jwtPrincipal.getToken()));
            if (!deletedCard.isPresent()) {
                response.setStatus(404);
            } else {
                Card card = deletedCard.get();
                logUserAction(user.getUserData().getLogin(),
                        UserActionEnum.DELETE_CARD,
                        user.getUserData().getEntities(), card.uid, null);
            }
        } catch (Exception e) {
            LOGGER.info("Error while deleting user card with id {} for user {}: {}", cardId,
                    user.getUserData().getLogin(),
                    e.getMessage());
            response.setStatus(403);
        }
        return null;
    }

    /**
     * DELETE /cards with query parameter cardId (new endpoint to avoid issues with
     * special characters)
     */
    @DeleteMapping(value = "", params = "cardId")
    public Void deleteCardWithQueryParam(@RequestParam String cardId, HttpServletResponse response,
            Principal principal) {
        return performDeleteCard(cardId, response, principal);
    }

    /**
     * DELETE /cards/{id} - deprecated endpoint
     */
    @DeleteMapping("/{id}")
    public Void deleteCards(@PathVariable String id, HttpServletResponse response, Principal principal) {
        LOGGER.warn("DEPRECATED API USAGE: DELETE /cards/{} is deprecated. Use DELETE /cards?cardId={} instead.", id,
                id);
        return performDeleteCard(id, response, principal);
    }

    private Void performDeleteCard(String cardId, HttpServletResponse response, Principal principal) {
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = null;
        Jwt token = null;
        if (jwtPrincipal != null) {
            user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();
            token = jwtPrincipal.getToken();
        }
        Optional<Card> deletedCard = cardDeletionService.deleteCardByIdWithUser(cardId, Optional.ofNullable(user),
                Optional.ofNullable(token));
        if (!deletedCard.isPresent())
            response.setStatus(404);
        else {
            response.setStatus(200);
            if (user != null) {
                Card card = deletedCard.get();
                logUserAction(user.getUserData().getLogin(),
                        UserActionEnum.DELETE_CARD,
                        user.getUserData().getEntities(), card.uid, null);
            }

        }

        return null;
    }

    /**
     * POST userAcknowledgement for a card updating the card
     */
    @PostMapping("/userAcknowledgement")
    public Void postUserAcknowledgement(Principal principal,
            HttpServletResponse response,
            @RequestBody UserAcknowledgementRequest request) {
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();

        UserBasedOperationResult result = cardReadAndAckService.processUserAcknowledgement(request.cardUid(), user,
                request.entitiesAcks());

        if (!result.isCardFound())
            response.setStatus(404);
        else {
            if (Boolean.TRUE.equals(result.getOperationDone()))
                response.setStatus(201);
            else
                response.setStatus(200);

            logUserAction(user.getUserData().getLogin(), UserActionEnum.ACK_CARD, user.getUserData().getEntities(),
                    request.cardUid(), null);

        }
        return null;
    }

    /**
     * POST userCardRead for a card
     */
    @PostMapping("/userCardRead")
    public Void postUserCardRead(Principal principal,
            @RequestBody CardUidRequest request, HttpServletResponse response) {
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();

        UserBasedOperationResult result = cardReadAndAckService.processUserRead(request.cardUid(),
                user.getUserData().getLogin());
        if (!result.isCardFound())
            response.setStatus(404);
        else {
            if (Boolean.TRUE.equals(result.getOperationDone()))
                response.setStatus(201);
            else
                response.setStatus(200);

            logUserAction(user.getUserData().getLogin(), UserActionEnum.READ_CARD, user.getUserData().getEntities(),
                    request.cardUid(), null);
        }
        return null;
    }

    /**
     * POST cancelUserAcknowledgement for a card to updating that card
     */
    @PostMapping("/cancelUserAcknowledgement")
    public Void deleteUserAcknowledgement(Principal principal,
            @RequestBody UserAcknowledgementRequest request,
            HttpServletResponse response) {
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();
        UserBasedOperationResult result = cardReadAndAckService.deleteUserAcknowledgement(request.cardUid(), user,
                request.entitiesAcks());
        if (!result.isCardFound())
            response.setStatus(404);
        else {
            if (Boolean.TRUE.equals(result.getOperationDone()))
                response.setStatus(200);
            else
                response.setStatus(204);

            logUserAction(user.getUserData().getLogin(), UserActionEnum.UNACK_CARD, user.getUserData().getEntities(),
                    request.cardUid(), null);
        }
        return null;
    }

    /**
     * DELETE userRead for a card
     */
    @DeleteMapping("/userCardRead")
    public Void deleteUserRead(Principal principal,
            @RequestParam String cardUid,
            HttpServletResponse response) {
        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();
        UserBasedOperationResult result = cardReadAndAckService.deleteUserRead(cardUid, user.getUserData().getLogin());
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
     * @param cardUidRequest request body containing the card uid
     */
    @PostMapping("/resetReadAndAcks")
    public Void postResetReadAndAcks(Principal principal,
            @RequestBody CardUidRequest cardUidRequest, HttpServletResponse response) {

        UserBasedOperationResult result = cardReadAndAckService.resetReadAndAcks(cardUidRequest.cardUid());
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

    @PostMapping("/purge")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    public void triggerPurge(Principal principal) {

        OpFabJwtAuthenticationToken jwtPrincipal = (OpFabJwtAuthenticationToken) principal;
        CurrentUserWithPerimeters user = (CurrentUserWithPerimeters) jwtPrincipal.getPrincipal();

        LOGGER.info("Manual purge triggered by user {}", user.getUserData().getLogin());

        cardPurgeService.purgeIfNeeded();

        logUserAction(
                user.getUserData().getLogin(),
                UserActionEnum.DELETE_CARD,
                user.getUserData().getEntities(),
                null,
                "Manual purge triggered"
        );

        LOGGER.info("Manual purge completed");
    }
}
