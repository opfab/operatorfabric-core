/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.kafka.card;

import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.avro.Card;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.avro.CommandType;
import org.lfenergy.operatorfabric.cards.publication.kafka.CardObjectMapper;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.springframework.stereotype.Component;

@Slf4j
@RequiredArgsConstructor
@Component
public class CardCommandFactory {
    private final CardObjectMapper objectMapper;

    public CardCommand create(CardPublicationData cardPublicationData) {
        CardCommand cardCommand = new CardCommand();
        Card kafkaCard;
        try {
            Object cardData = cardPublicationData.getData();
            cardPublicationData.setData(null); // Prevent Jackson errors

            kafkaCard = objectMapper.readCardValue(objectMapper.writeValueAsString(cardPublicationData), Card.class);
            cardCommand.setCommand(CommandType.RESPONSE_CARD);
            cardCommand.setCard(kafkaCard);

            String cardDataString = objectMapper.writeValueAsString(cardData);
            kafkaCard.setData(cardDataString);
        } catch (JsonProcessingException e) {
            log.error("Unable to serialize CardPublicationData {} into CardCommand. Message: {}", cardPublicationData, e.getMessage());
        }
        return cardCommand;
    }
}
