
/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
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
import org.opfab.cards.publication.repositories.UserBasedOperationResult;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.springframework.http.HttpStatus;
import java.util.List;

public class CardReadAndAckService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CardReadAndAckService.class);

    private CardNotificationService cardNotificationService;
    private CardRepository cardRepository;
    private CardPermissionControlService cardPermissionControlService;

    public CardReadAndAckService(
            CardNotificationService cardNotificationService,
            CardRepository cardRepository) {
        this.cardNotificationService = cardNotificationService;
        this.cardRepository = cardRepository;
        this.cardPermissionControlService = new CardPermissionControlService();

    }

    public UserBasedOperationResult processUserAcknowledgement(String cardUid, CurrentUserWithPerimeters user,
            List<String> entitiesAcks) {
        if (cardPermissionControlService.isCurrentUserReadOnly(user) && entitiesAcks != null && !entitiesAcks.isEmpty())
            throw new ApiErrorException(
                    new ApiError(HttpStatus.FORBIDDEN, "Acknowledgement impossible : User has READONLY opfab role"));

        if (!user.getUserData().getEntities().containsAll(entitiesAcks))
            throw new ApiErrorException(
                    new ApiError(HttpStatus.FORBIDDEN,
                            "Acknowledgement impossible : User is not member of all the entities given in the request"));

        cardRepository.findByUid(cardUid).ifPresent(selectedCard -> cardNotificationService
                .pushAckOfCardInEventBus(cardUid, selectedCard.id, entitiesAcks, CardOperationTypeEnum.ACK));

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

    public UserBasedOperationResult deleteUserAcknowledgement(String cardUid, CurrentUserWithPerimeters user,
            List<String> entitiesAcks) {
        log.info("Delete ack on card with uid {} for user {} and entities {} ", cardUid, user.getUserData().getLogin(),
                entitiesAcks);

        if (!user.getUserData().getEntities().containsAll(entitiesAcks))
            throw new ApiErrorException(

                    new ApiError(HttpStatus.FORBIDDEN,
                            "Cancel acknowledgement impossible : User is not member of all the entities given in the request"));

        cardRepository.findByUid(cardUid).ifPresent(selectedCard -> cardNotificationService
                .pushAckOfCardInEventBus(cardUid, selectedCard.id, entitiesAcks, CardOperationTypeEnum.UNACK));

        return cardRepository.deleteUserAck(user.getUserData().getLogin(), cardUid, entitiesAcks);

    }

    public UserBasedOperationResult resetReadAndAcks(String cardUid) {
        log.info("Delete ack and reads on card with uid {}  ", cardUid);
        UserBasedOperationResult acksResult = cardRepository.deleteAcksAndReads(cardUid);
        if (acksResult.isCardFound()) {
            cardRepository.findByUid(cardUid)
                    .ifPresent(card -> cardNotificationService.notifyOneCard(card, CardOperationTypeEnum.UPDATE));
        }

        return acksResult;
    }

}
