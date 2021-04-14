/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.kafka.command;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opfab.avro.Card;
import org.opfab.avro.CardCommand;
import org.opfab.cards.publication.kafka.CardObjectMapper;
import org.opfab.cards.publication.model.CardPublicationData;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Collections;
import java.util.Map;


@Slf4j
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BaseCommandHandler {

    @Autowired
    private CardObjectMapper objectMapper;

    protected CardPublicationData buildCardPublicationData(CardCommand cardCommand) {
        Card kafkaCard = cardCommand.getCard();

        CardPublicationData card = null;
        Map<String, Object> cardData = Collections.emptyMap();
        try {
            card = objectMapper.readValue(objectMapper.writeValueAsString(kafkaCard), CardPublicationData.class);

            String cardDataString = kafkaCard.getData();
            if (cardDataString != null) {
                cardData = objectMapper.readValue(cardDataString, new TypeReference<Map<String, Object>>() {
                });
            }
            card.setData(cardData);
        } catch (JsonProcessingException e) {
            log.error("Unable to serialize card {} into CardPublicationData. Message: {}", kafkaCard, e.getMessage());
        }
        return card;
    }
}
