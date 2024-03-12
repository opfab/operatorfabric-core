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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.avro.CardCommand;
import org.opfab.avro.CommandType;
import org.opfab.cards.publication.kafka.CardObjectMapper;
import org.opfab.cards.publication.model.Card;
import org.opfab.cards.publication.model.I18n;
import org.opfab.cards.publication.model.SeverityEnum;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CardCommandFactoryShould {

    @InjectMocks
    CardCommandFactory cut;
    @Test
    void createResponseCard() {
        ReflectionTestUtils.setField(cut, "objectMapper", new CardObjectMapper());

        Card cardPublicationData = createCardPublicationData();
        CardCommand cardCommand = cut.createResponseCard(cardPublicationData);

        assertThat (cardCommand.getCommand(), is (CommandType.RESPONSE_CARD));
        assertThat (cardCommand.getResponseCard().getProcess(), is (cardPublicationData.getProcess()));
        assertThat (cardCommand.getResponseCard().getState(), is(cardPublicationData.getState()));
    }

    @Test
    void createResponseCardFailure() throws JsonProcessingException {
        CardObjectMapper failMapper = mock (CardObjectMapper.class);
        when (failMapper.readResponseCardValue(any())).thenThrow(JsonProcessingException.class);
        ReflectionTestUtils.setField(cut, "objectMapper", failMapper);

        CardCommand cardCommand = cut.createResponseCard(createCardPublicationData());
        assertThat(cardCommand.getCommand(), is(nullValue()));
    }

    private Card createCardPublicationData() {
        return Card.builder().publisher("PUBLISHER_1").processVersion("O")
                .processInstanceId("PROCESS_1").severity(SeverityEnum.INFORMATION)
                .title(new I18n("title",null))
                .summary(new I18n("summary",null))
                .startDate(Instant.now())
                .process("process5")
                .state("state5")
                .build();
    }
}
