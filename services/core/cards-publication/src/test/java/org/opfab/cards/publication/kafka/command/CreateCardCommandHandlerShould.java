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
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.avro.Card;
import org.opfab.avro.CardCommand;
import org.opfab.avro.CommandType;
import org.opfab.cards.publication.kafka.CardObjectMapper;
import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.cards.publication.services.CardProcessingService;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = "test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CreateCardCommandHandlerShould {

    private CardProcessingService cardProcessingService;

    private CardObjectMapper objectMapper;

    private CreateCardCommandHandler cut;

    @BeforeAll
    public void setUp() {
        cardProcessingService = mock(CardProcessingService.class);
        objectMapper = mock(CardObjectMapper.class);
        cut = new CreateCardCommandHandler(cardProcessingService);
        ReflectionTestUtils.setField(cut, "objectMapper", objectMapper);
    }

    @Test
    void getCommandType() {
        assertThat(cut.getCommandType(), is(CommandType.CREATE_CARD));
    }

    @Test
    void executeCommand() throws JsonProcessingException {
        reset (cardProcessingService);
        CardCommand cardCommandMock = mock(CardCommand.class);
        CardPublicationData cardPublicationDataMock = mock (CardPublicationData.class);
        Card cardMock = mock(Card.class);
        when(cardCommandMock.getCard()).thenReturn(cardMock);
        when(objectMapper.writeValueAsString(any())).thenReturn("");
        when(objectMapper.readValue(anyString(), eq(CardPublicationData.class))).thenReturn(cardPublicationDataMock);
        doNothing().when(cardProcessingService).processCard(any());
        cut.executeCommand(cardCommandMock);

        verify(cardProcessingService, times(1)).processCard(any());
    }

}
