/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
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
import org.opfab.cards.model.CardOperationTypeEnum;
import org.opfab.cards.publication.model.CardOperationData;
import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.cards.publication.model.LightCard;
import org.opfab.utilities.eventbus.EventBus;

import java.util.*;

@Slf4j
public class CardNotificationService {

    
    private final EventBus eventBus;
    private final ObjectMapper mapper;

   
    public CardNotificationService(EventBus eventBus,
                                   ObjectMapper mapper
    ) {
        this.eventBus = eventBus;
        this.mapper = mapper;
        this.mapper.setSerializationInclusion(JsonInclude.Include.NON_EMPTY);
    }

    public void notifyOneCard(CardPublicationData card, CardOperationTypeEnum type) {
        CardOperationData.BuilderEncapsulator builderEncapsulator = CardOperationData.encapsulatedBuilder();
        builderEncapsulator.builder().type(type);
        builderEncapsulator.builder().card(card.toLightCard());
        builderEncapsulator.builder().cardId(card.getId());
        CardOperationData cardOperation = builderEncapsulator.builder().build();

        pushCardInEventBus(cardOperation);
    }

    private void pushCardInEventBus(CardOperationData cardOperation) {
        try {
            eventBus.sendEvent("card",mapper.writeValueAsString(cardOperation));

            LightCard card = cardOperation.getCard();
            log.debug("Card operation sent to eventbus, type={}, ids={}, cards={}, groupRecipients={}, entityRecipients={}, userRecipients={}"
                    , cardOperation.getType()
                    , cardOperation.getCardId()
                    , (card != null ? card.toString() : "")
                    , (card != null && card.getGroupRecipients() != null) ? card.getGroupRecipients().toString() : ""
                    , (card != null && card.getEntityRecipients() != null) ? card.getEntityRecipients().toString() : ""
                    , (card != null && card.getUserRecipients() != null) ? card.getUserRecipients().toString() : "");
        } catch (JsonProcessingException e) {
            log.error("Unable to linearize card to json on event bus");
        }
    }

    public void pushAckOfCardInEventBus(String cardUid, String cardId, List<String> entitiesAcks) {
        CardOperationData.BuilderEncapsulator builderEncapsulator = CardOperationData.encapsulatedBuilder();
        builderEncapsulator.builder().type(CardOperationTypeEnum.ACK);
        builderEncapsulator.builder().cardUid(cardUid);
        builderEncapsulator.builder().cardId(cardId);
        builderEncapsulator.builder().entitiesAcks(entitiesAcks);
        CardOperationData cardOperation = builderEncapsulator.builder().build();

        try {
            eventBus.sendEvent("ack", mapper.writeValueAsString(cardOperation));
            log.debug("Acknowledgement for cardUid={} and cardId={} with entitiesAcks={} sent to event bus", cardUid, cardId, entitiesAcks);
        } catch (JsonProcessingException e) {
            log.error("Unable to linearize card operation for acknowledgement to json on event bus");
        }
    }
}
