/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.services;

import lombok.extern.slf4j.Slf4j;

import org.opfab.cards.publication.model.*;
import org.opfab.cards.publication.ratelimiter.CardSendingLimiter;
import org.opfab.cards.publication.repositories.CardRepository;
import org.opfab.cards.publication.repositories.UserBasedOperationResult;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.users.model.CurrentUserWithPerimeters;
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

    private CardDeletionService cardDeletionService;
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
            CardDeletionService cardDeletionService,
            CardNotificationService cardNotificationService,
            CardRepository cardRepository,
            ExternalAppService externalAppService,
            CardTranslationService cardTranslationService,
            CardValidationService cardValidationService,
            boolean checkAuthenticationForCardSending,
            boolean checkPerimeterForCardSending,
            boolean authorizeToSendCardWithInvalidProcessState,
            int cardSendingLimitCardCount,
            int cardSendingLimitPeriod,
            boolean activateCardSendingLimiter) {
        this.cardDeletionService = cardDeletionService;
        this.cardNotificationService = cardNotificationService;
        this.cardRepository = cardRepository;
        this.externalAppService = externalAppService;
        this.cardPermissionControlService = new CardPermissionControlService();
        this.cardValidationService = cardValidationService;
        this.cardSendingLimiter = new CardSendingLimiter(cardSendingLimitCardCount, cardSendingLimitPeriod);
        this.cardTranslationService = cardTranslationService;
        this.checkAuthenticationForCardSending = checkAuthenticationForCardSending;
        this.checkPerimeterForCardSending = checkPerimeterForCardSending;
        this.authorizeToSendCardWithInvalidProcessState = authorizeToSendCardWithInvalidProcessState;
        this.activateCardSendingLimiter = activateCardSendingLimiter;

    }

    public void processCard(Card card) {
        processCard(card, Optional.empty(), Optional.empty(), false);
    }

    public void processCard(Card card, Optional<CurrentUserWithPerimeters> user, Optional<Jwt> jwt, boolean dataFieldIncluded) {

        if (card.getPublisherType() == null)
            card.setPublisherType(PublisherTypeEnum.EXTERNAL);

        if (user.isPresent() && checkAuthenticationForCardSending && !cardPermissionControlService
                .isCardPublisherAllowedForUser(card, user.get().getUserData().getLogin())) {

            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.FORBIDDEN)
                    .message(buildPublisherErrorMessage(card, user.get().getUserData().getLogin()))
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
        String cardSender = card.getRepresentative() != null ? card.getRepresentative() : card.getPublisher();
        if (activateCardSendingLimiter && !cardSendingLimiter.isNewSendingAllowed(cardSender))
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .message(String.format("Publisher %s has reached the card sending limit", card.getPublisher()))
                    .build());
        // set empty user otherwise it will be processed as a usercard
        processOneCard(card, Optional.empty(), jwt, dataFieldIncluded);
    }

    public void patchCard(String id, Card cardPatch, Optional<CurrentUserWithPerimeters> user, Optional<Jwt> jwt) {
        Card cardToPatch = cardRepository.findCardById(id, true);

        if (cardToPatch == null) {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.NOT_FOUND)
                    .message(String.format(
                            "Card with id %s not found", id))
                    .build());
        }

        this.cardValidationService.validateCardForPatch(cardPatch, cardToPatch);

        this.processCard(cardToPatch.patch(cardPatch), user, jwt, true);
    }

    public void processUserCard(Card card, CurrentUserWithPerimeters user, Optional<Jwt> jwt) {
        card.setPublisherType(PublisherTypeEnum.ENTITY);
        this.cardValidationService.validate(card);
        if (!authorizeToSendCardWithInvalidProcessState)
            this.cardValidationService.checkProcessStateExistsInBundles(card);
        processOneCard(card, Optional.of(user), jwt, false);
    }

    private void processOneCard(Card card, Optional<CurrentUserWithPerimeters> user, Optional<Jwt> jwt, boolean dataFieldIncluded) {
        card.prepare(Instant.ofEpochMilli(Instant.now().toEpochMilli()));
        cardTranslationService.translate(card);
        Card oldCard = getExistingCard(card.getId(), dataFieldIncluded);
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
        }

        if (card.getToNotify() != null) log.warn("Using deprecated field 'toNotify'. Use STORE_ONLY_IN_ARCHIVES card action instead");
        boolean storeOnlyInArchives = isCardToBeStoredOnlyInArchives(card);        

        if (!storeOnlyInArchives) {
            if (oldCard != null) {
                processCardUpdate(card, oldCard);
                processChildCardsWhenCardUpdate(card, jwt);
            }
            externalAppService.sendCardToExternalApplication(card, jwt);
            processChildCard(card);

            cardRepository.saveCard(card);
            if (oldCard == null)
                cardNotificationService.notifyOneCard(card, CardOperationTypeEnum.ADD);
            else
                cardNotificationService.notifyOneCard(card, CardOperationTypeEnum.UPDATE);
        }
        if (storeOnlyInArchives && oldCard != null) {
            cardRepository.deleteCard(oldCard);
            if (shouldKeepPublishDate(card)) {
                card.setPublishDate(oldCard.getPublishDate());
            }
        }

        // IMPORTANT: The deletionDate of the old card must be set to the publishDate of the new card.
        // This is a crucial step when consulting archived cards via the card consultation service.
        // If a child card is set as deleted before its parent card, the user will not see the child card when
        // the old parent card is displayed.
        cardRepository.setArchivedCardAsDeleted(card.getProcess(), card.getProcessInstanceId(),card.getPublishDate());
        cardRepository.saveCardToArchive(new ArchivedCard(card));

        log.debug("Card persisted (process = {} , processInstanceId= {} , state = {} ", card.getProcess(),
                card.getProcessInstanceId(), card.getState());
    }

    private boolean isCardToBeStoredOnlyInArchives(Card card) {
        return (card.getActions() != null && card.getActions().indexOf(CardActionEnum.STORE_ONLY_IN_ARCHIVES) >= 0) || (card.getToNotify() != null && Boolean.FALSE.equals(card.getToNotify()));
    }

    private Card getExistingCard(String cardId, boolean dataFieldIncluded) {
        return cardRepository.findCardById(cardId, dataFieldIncluded);
    }

    private Void processChildCardsWhenCardUpdate(Card card, Optional<Jwt> jwt) {
        String idCard = card.getProcess() + "." + card.getProcessInstanceId();
        Optional<List<Card>> childCards = cardRepository
                .findChildCard(cardRepository.findCardById(idCard, false));
        if (childCards.isPresent()) {
            if (!shouldKeepChildCards(card)) {
                deleteCards(childCards.get(), card.getPublishDate(), jwt);
            } else {
                cardRepository.setChildCardDates(card.getId(), getChildStartDateFromParent(card),
                        getChildEndDateFromParent(card));
            }
        }
        return null;
    }


    private Instant getChildStartDateFromParent(Card parent) {
        return parent.getStartDate().isBefore(parent.getPublishDate()) ? parent.getStartDate() : parent.getPublishDate();
    }

    private Instant getChildEndDateFromParent(Card parent) {
        if (parent.getEndDate() != null) {
            return parent.getEndDate();
        } else {
            return parent.getStartDate().isAfter(parent.getPublishDate()) ? parent.getStartDate() : parent.getPublishDate();
        }    
    }

    private void processCardUpdate(Card card, Card oldCard) {
        if (shouldKeepAcksAndReads(card)) {
            card.setUsersAcks(oldCard.getUsersAcks());
            card.setUsersReads(oldCard.getUsersReads());
            card.setEntitiesAcks(oldCard.getEntitiesAcks());
        }
        if (shouldKeepPublishDate(card)) {
            card.setPublishDate(oldCard.getPublishDate());
        }
    }

    private void processChildCard(Card card) {
        if (card.getParentCardId() != null) {
            Card parentCard = getExistingCard(card.getParentCardId(), false);
            card.setStartDate(getChildStartDateFromParent(parentCard));
            card.setEndDate(getChildEndDateFromParent(parentCard));
        }
    }

    private boolean shouldKeepChildCards(Card card) {
        return card.getActions() != null && card.getActions().indexOf(CardActionEnum.KEEP_CHILD_CARDS) >= 0;
    }

    private boolean shouldKeepPublishDate(Card card) {
        return card.getActions() != null && card.getActions().indexOf(CardActionEnum.KEEP_EXISTING_PUBLISH_DATE) >= 0;
    }

    private boolean shouldKeepAcksAndReads(Card card) {
        return card.getActions() != null && card.getActions().indexOf(CardActionEnum.KEEP_EXISTING_ACKS_AND_READS) >= 0;
    }

    private void deleteCards(List<Card> cardPublicationData, Instant deletionDate, Optional<Jwt> jwt) {
        cardPublicationData.forEach(x -> cardDeletionService.deleteCardById(x.getId(), deletionDate, jwt));
    }

    private String buildPublisherErrorMessage(Card card, String login) {
        String errorMessagePrefix = "Card publisher is set to " + card.getPublisher() + " and account login is "
                + login;
        if (card.getRepresentative() != null) {
            errorMessagePrefix = "Card representative is set to " + card.getRepresentative() + " and account login is "
                    + login;
        }
        return errorMessagePrefix + ", the card cannot be sent";
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
                .pushAckOfCardInEventBus(cardUid, selectedCard.getId(), entitiesAcks, CardOperationTypeEnum.ACK));

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

    public UserBasedOperationResult deleteUserAcknowledgement(String cardUid, CurrentUserWithPerimeters user, List<String> entitiesAcks) {
        log.info("Delete ack on card with uid {} for user {} and entities {} ", cardUid, user.getUserData().getLogin(), entitiesAcks);
        
        if (!user.getUserData().getEntities().containsAll(entitiesAcks))
            throw new ApiErrorException(ApiError.builder()
                .status(HttpStatus.FORBIDDEN)
                .message("Cancel acknowledgement impossible : User is not member of all the entities given in the request")
                .build());

        cardRepository.findByUid(cardUid).ifPresent(selectedCard -> cardNotificationService
                .pushAckOfCardInEventBus(cardUid, selectedCard.getId(), entitiesAcks, CardOperationTypeEnum.UNACK));
        
        return cardRepository.deleteUserAck(user.getUserData().getLogin(), cardUid, entitiesAcks);

    }

    public UserBasedOperationResult resetReadAndAcks(String cardUid) {
        log.info("Delete ack and reads on card with uid {}  ", cardUid);
        UserBasedOperationResult acksResult = cardRepository.deleteAcksAndReads(cardUid);
        if (acksResult.isCardFound()) {
            cardRepository.findByUid(cardUid).ifPresent(card -> cardNotificationService.notifyOneCard(card, CardOperationTypeEnum.UPDATE));
        }

        return acksResult;
    }

    public void resetRateLimiter(){
        this.cardSendingLimiter.reset();
    }

}
