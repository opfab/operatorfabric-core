/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.services;


import org.opfab.cards.publication.model.*;
import org.opfab.cards.publication.repositories.CardRepository;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.PermissionEnum;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.http.HttpStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public class CardDeletionService {

    private CardNotificationService cardNotificationService;
    private CardRepository cardRepository;
    private ExternalAppService externalAppService;
    private CardPermissionControlService cardPermissionControlService;

    boolean checkAuthenticationForCardSending;

    public CardDeletionService(
            CardNotificationService cardNotificationService,
            CardRepository cardRepository,
            ExternalAppService externalAppService,
            boolean checkAuthenticationForCardSending) {
        this.cardNotificationService = cardNotificationService;
        this.cardRepository = cardRepository;
        this.externalAppService = externalAppService;
        this.cardPermissionControlService = new CardPermissionControlService();
        this.checkAuthenticationForCardSending = checkAuthenticationForCardSending;
    }

    public void deleteCardById(String id, Instant deletionDate, Optional<Jwt> jwt) {
        Card cardToDelete = cardRepository.findCardById(id, false);
        deleteCard(cardToDelete, deletionDate, jwt);
    }

    public void deleteCardsByEndDateBefore(Instant endDateBefore) {
        List<Card> deletedCards = cardRepository.deleteCardsByEndDateBefore(endDateBefore);
        deletedCards.stream().forEach(
                deletedCard -> cardNotificationService.notifyOneCard(deletedCard, CardOperationTypeEnum.DELETE));
    }

    public Optional<Card> deleteCardByIdWithUser(String id, Optional<CurrentUserWithPerimeters> user,
            Optional<Jwt> jwt) {

        Card cardToDelete = cardRepository.findCardById(id, false);
        if (user.isPresent()) { // if user is not present it means we have checkAuthenticationForCardSending =
                                // false
            boolean isAdmin = cardPermissionControlService.hasCurrentUserAnyPermission(user.get(),
                    PermissionEnum.ADMIN);
            String login = user.get().getUserData().getLogin();
            if (cardToDelete != null && !isAdmin && checkAuthenticationForCardSending
                    && !cardPermissionControlService.isCardPublisherAllowedForUser(cardToDelete, login)) {

                throw new ApiErrorException(ApiError.builder()
                        .status(HttpStatus.FORBIDDEN)
                        .message(buildPublisherErrorMessage(cardToDelete, login))
                        .build());
            }
        }

        return deleteCard(cardToDelete,Instant.now(), jwt);
    }

    public Optional<Card> deleteUserCard(String id, CurrentUserWithPerimeters user, Optional<Jwt> jwt) {
        Card cardToDelete = cardRepository.findCardById(id, false);
        if (cardToDelete == null)
            return Optional.empty();

        if (cardPermissionControlService.isUserAllowedToDeleteThisCard(cardToDelete, user)) {
            return deleteCard(cardToDelete,Instant.now(), jwt);
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

    private Optional<Card> deleteCard(Card cardToDelete, Instant deletionDate,
            Optional<Jwt> jwt) {
        Optional<Card> deletedCard = Optional.ofNullable(cardToDelete);
        if (null != cardToDelete) {
            cardNotificationService.notifyOneCard(cardToDelete, CardOperationTypeEnum.DELETE);
            cardRepository.deleteCard(cardToDelete);
            cardRepository.setArchivedCardAsDeleted(cardToDelete.getProcess(), cardToDelete.getProcessInstanceId(),deletionDate);
            externalAppService.notifyExternalApplicationThatCardIsDeleted(cardToDelete, jwt);
            Optional<List<Card>> childCard = cardRepository.findChildCard(cardToDelete);
            if (childCard.isPresent()) {
                childCard.get().forEach(x -> deleteCardById(x.getId(), deletionDate, jwt));
            }
        }
        return deletedCard;
    }

    private String buildPublisherErrorMessage(Card card, String login) {
        String errorMessagePrefix = "Card publisher is set to " + card.getPublisher() + " and account login is "
                + login;
        if (card.getRepresentative() != null) {
            errorMessagePrefix = "Card representative is set to " + card.getRepresentative() + " and account login is "
                    + login;
        }
        return errorMessagePrefix + ", the card cannot be deleted";
    }

}
