package org.lfenergy.operatorfabric.cards.publication.kafka.consumer;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.avro.CommandType;
import org.lfenergy.operatorfabric.cards.publication.kafka.command.CommandHandler;
import org.lfenergy.operatorfabric.cards.publication.kafka.command.CreateCardCommandHandler;
import org.lfenergy.operatorfabric.cards.publication.kafka.command.DeleteCardCommandHandler;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.util.*;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = {"native", "test"})
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
