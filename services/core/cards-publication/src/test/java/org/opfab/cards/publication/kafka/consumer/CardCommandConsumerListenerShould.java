/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.cards.publication.kafka.consumer;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.avro.CardCommand;
import org.opfab.avro.CommandType;
import org.opfab.cards.publication.kafka.command.CommandHandler;
import org.opfab.cards.publication.kafka.command.CreateCardCommandHandler;
import org.opfab.cards.publication.kafka.command.DeleteCardCommandHandler;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.util.*;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = "test")
class CardCommandConsumerListenerShould {

    @Test
    void receivedCommand() {
        CreateCardCommandHandler createMock = mock(CreateCardCommandHandler.class);
        DeleteCardCommandHandler deleteMock = mock(DeleteCardCommandHandler.class);
        List<CommandHandler> commandHandlerList = Arrays.asList(createMock, deleteMock);
        CardCommand cardCommandMock = mock(CardCommand.class);

        when(createMock.getCommandType()).thenReturn(CommandType.CREATE_CARD);
        when(deleteMock.getCommandType()).thenReturn(CommandType.DELETE_CARD);
        when (cardCommandMock.getCommand()).thenReturn(CommandType.CREATE_CARD);

        CardCommandConsumerListener cardCommandConsumerListener = new CardCommandConsumerListener(commandHandlerList);
        ConsumerRecord<String, CardCommand> recordMock = mock(ConsumerRecord.class);
        when(recordMock.value()).thenReturn(cardCommandMock);
        cardCommandConsumerListener.receivedCommand(recordMock);

        verify(createMock).executeCommand(any());
        verify(deleteMock, times(0)).executeCommand(any());
    }

    @Test
    void noHandler() {
        CardCommandConsumerListener cardCommandConsumerListener = new CardCommandConsumerListener(Collections.emptyList());
        CardCommand cardCommandMock = mock(CardCommand.class);
        ConsumerRecord<String, CardCommand> recordMock = mock(ConsumerRecord.class);
        when(recordMock.value()).thenReturn(cardCommandMock);
        Assertions.assertThrows(IllegalStateException.class, ()-> cardCommandConsumerListener.receivedCommand(recordMock));
    }
}
