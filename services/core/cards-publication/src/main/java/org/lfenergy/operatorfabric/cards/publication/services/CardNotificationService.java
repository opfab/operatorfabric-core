/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.publication.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.model.CardOperationTypeEnum;
import org.lfenergy.operatorfabric.cards.publication.model.Card;
import org.lfenergy.operatorfabric.cards.publication.model.CardOperation;
import org.lfenergy.operatorfabric.cards.publication.model.CardOperationData;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

/**
 * <p>Aim of this service whose sole externally accessible method is
 * {@link #notifyCards(Collection, CardOperationTypeEnum)} is to
 * prepare data and notify AMQP exchange of it. Information about card
 * publication and deletion is then accessible to other services or
 * entities through bindings to these exchanges.
 * </p>
 * <p>Two exchanges are used, groupExchange and userExchange.
 * See amqp.xml resource file ([project]/services/core/cards-publication/src/main/resources/amqp.xml)
 * for their exact configuration</p>
 */
@Service
@Slf4j
public class CardNotificationService {

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper mapper;

    @Autowired
    public CardNotificationService(RabbitTemplate rabbitTemplate,
                                   ObjectMapper mapper
    ) {
        this.rabbitTemplate = rabbitTemplate;
        this.mapper = mapper;
    }

    public void notifyCards(Collection<CardPublicationData> cards, CardOperationTypeEnum type) {
        cards.forEach(card -> notifyOneCard(card,type));
    }

    private void notifyOneCard(CardPublicationData card, CardOperationTypeEnum type) {
        CardOperationData.BuilderEncapsulator builderEncapsulator = CardOperationData.encapsulatedBuilder();
        builderEncapsulator.builder().type(type).publishDate(card.getPublishDate());
        switch (type) {
            case ADD:
            case UPDATE:
                builderEncapsulator.builder().card(card.toLightCard());
                break;
            case DELETE:
                builderEncapsulator.builder().cardId(card.getId());

        }
        CardOperation cardOperation = builderEncapsulator.builder().build();
        card.getUserRecipients().forEach(user -> pushCardInRabbit(cardOperation,"USER_EXCHANGE", user));
        card.getGroupRecipients().forEach(group -> pushCardInRabbit(cardOperation, "GROUP_EXCHANGE", group));
    }

    private void pushCardInRabbit(CardOperation cardOperation,String queueName,String routingKey) {
        try {
            rabbitTemplate.convertAndSend(queueName, routingKey, mapper.writeValueAsString(cardOperation));
            if (log.isInfoEnabled()) log.info("Operation sent to Exchange[" + queueName  + "] with routing key " + routingKey
                    + ",type=" + cardOperation.getType() + ", ids=" + cardOperation.getCardIds().toString() + ",cards="
                    + cardOperation.getCards().toString());
        } catch (JsonProcessingException e) {
            log.error("Unnable to linearize card to json on amqp notification");
        }
    }

}
