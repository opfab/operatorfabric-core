/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.cards.publication.kafka.command;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.avro.Card;
import org.opfab.avro.CardCommand;
import org.opfab.cards.publication.kafka.CardObjectMapper;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.Map;


import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class BaseCommandHandlerShould {

    private final String ANY_STRING = "any_string";
    private final String DATA_KEY = "key";
    private final String DATA_VALUE = "value";

    private CardObjectMapper objectMapper;

    private BaseCommandHandler cut;

    private CardCommand cardCommand;

    private Card card;

    @BeforeAll
    void setUp() throws JsonProcessingException {
        objectMapper = mock(CardObjectMapper.class);
        cut = new BaseCommandHandler();
        ReflectionTestUtils.setField(cut, "objectMapper", objectMapper);
        org.opfab.cards.publication.model.Card cardPublicationData = org.opfab.cards.publication.model.Card.builder()
                .build();

        cardCommand = mock(CardCommand.class);
        card = mock(Card.class);
        when(cardCommand.getCard()).thenReturn(card);
        when(objectMapper.writeValueAsString(card)).thenReturn(ANY_STRING);
        when(objectMapper.readCardPublicationDataValue(ANY_STRING)).thenReturn(cardPublicationData);
    }

    @Test
    void testBuildCardPublicationData_withoutDataProperty() {
        when(card.getData()).thenReturn(null);
        org.opfab.cards.publication.model.Card result = cut.buildCardPublicationData(cardCommand);
        Map<String,Object> data = (Map<String,Object>) result.getData();
        Assertions.assertThat(data).isEmpty();
    }

    @Test
    void testBuildCardPublicationData_withDataProperty() throws JsonProcessingException {
        String cardDataAsString = "justAString";
        Map<String, Object> cardData = Collections.singletonMap(DATA_KEY, DATA_VALUE);
        when(card.getData()).thenReturn(cardDataAsString);
        when(objectMapper.readJSONValue(anyString())).thenReturn(cardData);
        org.opfab.cards.publication.model.Card result = cut.buildCardPublicationData(cardCommand);
        Map<String,Object> data = (Map<String,Object>) result.getData();
        Assertions.assertThat(data)
            .hasSize(1)
            .containsEntry(DATA_KEY,DATA_VALUE);
    }

}
