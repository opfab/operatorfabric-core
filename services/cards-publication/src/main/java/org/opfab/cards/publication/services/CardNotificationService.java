/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.services;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.opfab.cards.publication.model.CardOperation;
import org.opfab.cards.publication.model.CardOperationTypeEnum;
import org.opfab.cards.publication.model.Card;
import org.opfab.cards.publication.model.LightCard;
import org.opfab.utilities.eventbus.EventBus;

import java.util.*;

@Slf4j
public class CardNotificationService {

    private final EventBus eventBus;
    private final ObjectMapper mapper;

    public CardNotificationService(EventBus eventBus,
            ObjectMapper mapper) {
        this.eventBus = eventBus;
        this.mapper = mapper;
        this.mapper.setSerializationInclusion(JsonInclude.Include.NON_EMPTY);
    }

    public void notifyOneCard(Card card, CardOperationTypeEnum type) {
        CardOperation cardOperation = new CardOperation(type, card.getId(), null, new LightCard(card), null);

        pushCardInEventBus(cardOperation);
    }

    private void pushCardInEventBus(CardOperation cardOperation) {
        try {
            eventBus.sendEvent("card", mapper.writeValueAsString(cardOperation));

            LightCard card = cardOperation.card();
            log.debug(
                    "Card operation sent to eventbus, type={}, ids={}, cards={}, groupRecipients={}, entityRecipients={}, userRecipients={}",
                    cardOperation.type(), cardOperation.cardId(), (card != null ? card.toString() : ""),
                    (card != null && card.groupRecipients() != null) ? card.groupRecipients().toString() : "",
                    (card != null && card.entityRecipients() != null) ? card.entityRecipients().toString() : "",
                    (card != null && card.userRecipients() != null) ? card.userRecipients().toString() : "");
        } catch (JsonProcessingException e) {
            log.error("Unable to linearize card to json on event bus");
        }
    }

    public void pushAckOfCardInEventBus(String cardUid, String cardId, List<String> entitiesAcks, CardOperationTypeEnum operationType ) {
        CardOperation cardOperation = new CardOperation(operationType, cardId, cardUid, null, entitiesAcks);

        try {
            eventBus.sendEvent("ack", mapper.writeValueAsString(cardOperation));
            log.debug("{} for cardUid={} and cardId={} with entitiesAcks={} sent to event bus", 
                    operationType == CardOperationTypeEnum.ACK ? "Acknowlegement" : "Cancel acknowledgement" , 
                    cardUid, cardId, entitiesAcks);
        } catch (JsonProcessingException e) {
            log.error("Unable to linearize card operation for acknowledgement to json on event bus");
        }
    }

}
