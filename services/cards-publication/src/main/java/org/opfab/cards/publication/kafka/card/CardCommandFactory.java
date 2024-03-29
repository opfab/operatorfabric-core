/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
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
import org.opfab.avro.CardCommand;
import org.opfab.avro.CommandType;
import org.opfab.avro.ResponseCard;
import org.opfab.cards.publication.kafka.CardObjectMapper;
import org.opfab.cards.publication.model.Card;
import org.springframework.stereotype.Component;

@Slf4j
@RequiredArgsConstructor
@Component
public class CardCommandFactory {
    private final CardObjectMapper objectMapper;

    public CardCommand createResponseCard(Card cardPublicationData) {
        CardCommand cardCommand = new CardCommand();
        final Object cardData = cardPublicationData.getData();
        ResponseCard kafkaCard;
        try {
            cardPublicationData.setData(null); // Prevent Jackson errors

            kafkaCard = objectMapper.readResponseCardValue(objectMapper.writeValueAsString(cardPublicationData));
            cardCommand.setCommand(CommandType.RESPONSE_CARD);
            cardCommand.setResponseCard(kafkaCard);

            String cardDataString = objectMapper.writeValueAsString(cardData);
            kafkaCard.setData(cardDataString);
        } catch (JsonProcessingException e) {
            log.error("Unable to serialize CardPublicationData {} into CardCommand. Message: {}", cardPublicationData, e.getMessage());
        } finally {
            cardPublicationData.setData(cardData);
        }
        return cardCommand;
    }
}
