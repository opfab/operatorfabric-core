/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.services;

import lombok.extern.slf4j.Slf4j;

import org.opfab.cards.model.CardOperationTypeEnum;
import org.opfab.cards.publication.model.*;
import org.opfab.cards.publication.ratelimiter.CardSendingLimiter;
import org.opfab.cards.publication.repositories.CardRepository;
import org.opfab.cards.publication.repositories.UserBasedOperationResult;
import org.opfab.springtools.configuration.oauth.ProcessesCache;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.PermissionEnum;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * <p>
 * Responsible of processing card : check format , save in repository and send
 * notification
 */
@Slf4j
public class CardProcessingService {

    private CardNotificationService cardNotificationService;
    private CardRepository cardRepository;
    private ExternalAppService externalAppService;
    private CardPermissionControlService cardPermissionControlService;
    private CardValidationService cardValidationService;
    private CardTranslationService cardTranslationService;
    private CardSendingLimiter cardSendingLimiter;

    boolean checkAuthenticationForCardSending;
    boolean checkPerimeterForCardSending;
    boolean authorizeToSendCardWithInvalidProcessState;
    boolean activateCardSendingLimiter;

    public CardProcessingService(
            CardNotificationService cardNotificationService,
            CardRepository cardRepository,
            ExternalAppService externalAppService,
            CardTranslationService cardTranslationService,
            ProcessesCache processesCache,
            boolean checkAuthenticationForCardSending,
            boolean checkPerimeterForCardSending,
            boolean authorizeToSendCardWithInvalidProcessState,
            int cardSendingLimitCardCount,
            int cardSendingLimitPeriod,
            boolean activateCardSendingLimiter) {
        this.cardNotificationService = cardNotificationService;
        this.cardRepository = cardRepository;
        this.externalAppService = externalAppService;
        this.cardPermissionControlService = new CardPermissionControlService();
        this.cardValidationService = new CardValidationService(this.cardRepository, processesCache);
        this.cardSendingLimiter = new CardSendingLimiter(cardSendingLimitCardCount, cardSendingLimitPeriod);
        this.cardTranslationService = cardTranslationService;
        this.checkAuthenticationForCardSending = checkAuthenticationForCardSending;
        this.checkPerimeterForCardSending = checkPerimeterForCardSending;
        this.authorizeToSendCardWithInvalidProcessState = authorizeToSendCardWithInvalidProcessState;
        this.activateCardSendingLimiter = activateCardSendingLimiter;

    }

    public void processCard(CardPublicationData card) {
        processCard(card, Optional.empty(), Optional.empty());
    }

    public void processCard(CardPublicationData card, Optional<CurrentUserWithPerimeters> user, Optional<Jwt> jwt) {

        if (card.getPublisherType() == null)
            card.setPublisherType(PublisherTypeEnum.EXTERNAL);

        if (user.isPresent() && checkAuthenticationForCardSending && !cardPermissionControlService
                .isCardPublisherAllowedForUser(card, user.get().getUserData().getLogin())) {

            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.FORBIDDEN)
                    .message(buildPublisherErrorMessage(card, user.get().getUserData().getLogin(), false))
                    .build());
        }
        this.cardValidationService.validate(card);
        if (!authorizeToSendCardWithInvalidProcessState)
            this.cardValidationService.checkProcessStateExistsInBundles(card);
        if (user.isPresent() && checkPerimeterForCardSending
                && !cardPermissionControlService.isUserAuthorizedToSendCard(card, user.get())) {
            throw new AccessDeniedException(String.format(
                    "user not authorized to send card with process %s and state %s as it is not permitted by his perimeters, the card is rejected",
                    card.getProcess(), card.getState()));
        }
        if (activateCardSendingLimiter && !cardSendingLimiter.isNewSendingAllowed(card.getPublisher()))
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .message(String.format("Publisher %s has reached the card sending limit", card.getPublisher()))
                    .build());
        // set empty user otherwise it will be processed as a usercard
        processOneCard(card, Optional.empty(), jwt);
    }

    public void processUserCard(CardPublicationData card, CurrentUserWithPerimeters user, Optional<Jwt> jwt) {
        card.setPublisherType(PublisherTypeEnum.ENTITY);
        this.cardValidationService.validate(card);
        if (!authorizeToSendCardWithInvalidProcessState)
            this.cardValidationService.checkProcessStateExistsInBundles(card);
        processOneCard(card, Optional.of(user), jwt);
    }

    private void processOneCard(CardPublicationData card, Optional<CurrentUserWithPerimeters> user, Optional<Jwt> jwt) {
        card.prepare(Instant.ofEpochMilli(Instant.now().toEpochMilli()));
        cardTranslationService.translate(card);
        CardPublicationData oldCard = getExistingCard(card.getId());
        if (user.isPresent()) {
            if (oldCard != null && !cardPermissionControlService.isUserAllowedToEditCard(user.get(), card, oldCard))
                throw new ApiErrorException(ApiError.builder()
                        .status(HttpStatus.FORBIDDEN)
                        .message(
                                "User is not the sender of the original card or user is not part of entities allowed to edit card. Card is rejected")
                        .build());

            if (!cardPermissionControlService.isUserAuthorizedToSendCard(card, user.get())) {
                throw new AccessDeniedException(String.format(
                    "user not authorized to send card with process %s and state %s as it is not permitted by his perimeters, the card is rejected",
                    card.getProcess(), card.getState()));
            }

            if (!cardPermissionControlService.isCardPublisherInUserEntities(card, user.get()))
                // throw a runtime exception to be handled by Mono.onErrorResume()
                throw new IllegalArgumentException("Publisher is not valid, the card is rejected");
            log.info("Send user card to external app with jwt present " + jwt.isPresent());
            externalAppService.sendCardToExternalApplication(card, jwt);
        }

        if ((card.getToNotify() == null) || Boolean.TRUE.equals(card.getToNotify())) {
            if (oldCard != null)
                deleteChildCardsProcess(card, jwt);
            cardRepository.saveCard(card);
            if (oldCard == null)
                cardNotificationService.notifyOneCard(card, CardOperationTypeEnum.ADD);
            else
                cardNotificationService.notifyOneCard(card, CardOperationTypeEnum.UPDATE);
        }

        cardRepository.saveCardToArchive(new ArchivedCardPublicationData(card));

        log.debug("Card persisted (process = {} , processInstanceId= {} , state = {} ", card.getProcess(),
                card.getProcessInstanceId(), card.getState());
    }

    private Void deleteChildCardsProcess(CardPublicationData card, Optional<Jwt> jwt) {
        if (Boolean.FALSE.equals(card.getKeepChildCards())) {
            String idCard = card.getProcess() + "." + card.getProcessInstanceId();
            Optional<List<CardPublicationData>> childCard = cardRepository
                    .findChildCard(cardRepository.findCardById(idCard));
            if (childCard.isPresent()) {
                deleteCards(childCard.get(), card.getPublishDate(), jwt);
            }
        }
        return null;
    }

    private void deleteCards(List<CardPublicationData> cardPublicationData, Instant deletionDate, Optional<Jwt> jwt) {
        cardPublicationData.forEach(x -> deleteCard(x.getId(), deletionDate, jwt));
    }

    private CardPublicationData getExistingCard(String cardId) {
        return cardRepository.findCardById(cardId);
    }

    public void deleteCard(String id, Optional<Jwt> jwt) {
        CardPublicationData cardToDelete = cardRepository.findCardById(id);
        deleteCard(cardToDelete, jwt);
    }

    public void deleteCard(String id, Instant deletionDate, Optional<Jwt> jwt) {
        CardPublicationData cardToDelete = cardRepository.findCardById(id);
        deleteCard(cardToDelete, deletionDate, jwt);
    }

    public void deleteCards(Instant endDateBefore) {
        List<CardPublicationData> deletedCards = cardRepository.deleteCardsByEndDateBefore(endDateBefore);
        deletedCards.stream().forEach(
                deletedCard -> cardNotificationService.notifyOneCard(deletedCard, CardOperationTypeEnum.DELETE));
    }

    public Optional<CardPublicationData> deleteCard(String id, Optional<CurrentUserWithPerimeters> user,
            Optional<Jwt> jwt) {

        CardPublicationData cardToDelete = cardRepository.findCardById(id);
        if (user.isPresent()) { // if user is not present it means we have checkAuthenticationForCardSending =
                                // false
            boolean isAdmin = cardPermissionControlService.hasCurrentUserAnyPermission(user.get(),
                    PermissionEnum.ADMIN);
            String login = user.get().getUserData().getLogin();
            if (cardToDelete != null && !isAdmin && checkAuthenticationForCardSending
                    && !cardPermissionControlService.isCardPublisherAllowedForUser(cardToDelete, login)) {

                throw new ApiErrorException(ApiError.builder()
                        .status(HttpStatus.FORBIDDEN)
                        .message(buildPublisherErrorMessage(cardToDelete, login, true))
                        .build());
            }
        }

        return deleteCard(cardToDelete, jwt);
    }

    public Optional<CardPublicationData> prepareAndDeleteCard(CardPublicationData card) {
        if (card.getId() == null || card.getId().isEmpty()) {
            card.prepare(card.getPublishDate());
        }
        return deleteCard(card, Optional.empty());
    }

    public Optional<CardPublicationData> deleteUserCard(String id, CurrentUserWithPerimeters user, Optional<Jwt> jwt) {
        CardPublicationData cardToDelete = cardRepository.findCardById(id);
        if (cardToDelete == null)
            return Optional.empty();

        if (cardPermissionControlService.isUserAllowedToDeleteThisCard(cardToDelete, user)) {
            return deleteCard(cardToDelete, jwt);
        } else {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.FORBIDDEN)
                    .message("User not allowed to delete this card")
                    .build());
        }
    }

    public void deleteCardsByExpirationDate(Instant expirationDate) {
        cardRepository.findCardsByExpirationDate(expirationDate)
                .forEach(cardToDelete -> deleteCard(cardToDelete, expirationDate, Optional.empty()));
    }

    private Optional<CardPublicationData> deleteCard(CardPublicationData cardToDelete, Optional<Jwt> jwt) {
        return deleteCard(cardToDelete, Instant.now(), jwt);
    }

    private Optional<CardPublicationData> deleteCard(CardPublicationData cardToDelete, Instant deletionDate,
            Optional<Jwt> jwt) {
        Optional<CardPublicationData> deletedCard = Optional.ofNullable(cardToDelete);
        if (null != cardToDelete) {
            cardNotificationService.notifyOneCard(cardToDelete, CardOperationTypeEnum.DELETE);
            cardRepository.deleteCard(cardToDelete);
            cardRepository.findArchivedCardByUid(cardToDelete.getUid()).ifPresent(deleted -> {
                deleted.setDeletionDate(deletionDate);
                cardRepository.updateArchivedCard(deleted);
            });

            externalAppService.notifyExternalApplicationThatCardIsDeleted(cardToDelete, jwt);
            Optional<List<CardPublicationData>> childCard = cardRepository.findChildCard(cardToDelete);
            if (childCard.isPresent()) {
                childCard.get().forEach(x -> deleteCard(x.getId(), deletionDate, jwt));
            }
        }
        return deletedCard;
    }

    private String buildPublisherErrorMessage(CardPublicationData card, String login, boolean delete) {
        String errorMessagePrefix = "Card publisher is set to " + card.getPublisher() + " and account login is "
                + login;
        if (card.getRepresentative() != null) {
            errorMessagePrefix = "Card representative is set to " + card.getRepresentative() + " and account login is "
                    + login;
        }
        String errorMessageSuffix = delete ? "deleted" : "sent";
        return errorMessagePrefix + ", the card cannot be " + errorMessageSuffix;
    }

    public UserBasedOperationResult processUserAcknowledgement(String cardUid, CurrentUserWithPerimeters user,
            List<String> entitiesAcks) {
        if (cardPermissionControlService.isCurrentUserReadOnly(user) && entitiesAcks != null && !entitiesAcks.isEmpty())
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.FORBIDDEN)
                    .message("Acknowledgement impossible : User has READONLY opfab role")
                    .build());

        if (!user.getUserData().getEntities().containsAll(entitiesAcks))
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.FORBIDDEN)
                    .message("Acknowledgement impossible : User is not member of all the entities given in the request")
                    .build());

        cardRepository.findByUid(cardUid).ifPresent(selectedCard -> cardNotificationService
                .pushAckOfCardInEventBus(cardUid, selectedCard.getId(), entitiesAcks));

        log.info("Set ack on card with uid {} for user {} and entities {}", cardUid, user.getUserData().getLogin(),
                entitiesAcks);
        return cardRepository.addUserAck(user.getUserData(), cardUid, entitiesAcks);
    }

    public UserBasedOperationResult processUserRead(String cardUid, String userName) {
        log.info("Set read on card with uid {} for user {} ", cardUid, userName);
        return cardRepository.addUserRead(userName, cardUid);
    }

    public UserBasedOperationResult deleteUserRead(String cardUid, String userName) {
        log.info("Delete read on card with uid {} for user {} ", cardUid, userName);
        return cardRepository.deleteUserRead(userName, cardUid);
    }

    public UserBasedOperationResult deleteUserAcknowledgement(String cardUid, String userName) {
        log.info("Delete ack on card with uid {} for user {} ", cardUid, userName);
        return cardRepository.deleteUserAck(userName, cardUid);

    }

    public UserBasedOperationResult resetReadAndAcks(String cardUid) {
        log.info("Delete ack and reads on card with uid {}  ", cardUid);
        UserBasedOperationResult acksResult = cardRepository.deleteAcksAndReads(cardUid);
        if (acksResult.isCardFound()) {
            cardRepository.findByUid(cardUid).ifPresent(card -> cardNotificationService.notifyOneCard(card, CardOperationTypeEnum.UPDATE));
        }

        return acksResult;
    }

}
