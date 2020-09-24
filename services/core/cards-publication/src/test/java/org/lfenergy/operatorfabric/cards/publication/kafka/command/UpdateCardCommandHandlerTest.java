package org.lfenergy.operatorfabric.cards.publication.kafka.command;

import com.google.gson.Gson;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.avro.Card;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.avro.CommandType;
import org.lfenergy.operatorfabric.cards.publication.model.CardCreationReportData;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.services.CardProcessingService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import reactor.core.publisher.Mono;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = {"native", "test"})
class UpdateCardCommandHandlerTest {
    @Mock
    Gson gson;

    @Mock
    CardProcessingService cardProcessingService;

    @InjectMocks
    UpdateCardCommandHandler updateCardCommandHandler;

    @Test
    void getCommandType() {
        assertThat(updateCardCommandHandler.getCommandType().equals(CommandType.UPDATE_CARD));
    }

    @Test
    void executeCommand() {
        CardCommand cardCommandMock = mock(CardCommand.class);
        CardPublicationData cardPublicationDataMock = mock (CardPublicationData.class);
        Card cardMock = mock(Card.class);
        when(cardCommandMock.getCard()).thenReturn(cardMock);
        when(gson.fromJson((String) any(), any())).thenReturn(cardPublicationDataMock);
        when(cardProcessingService.processCards(any())).thenReturn(Mono.just(new CardCreationReportData()));
        updateCardCommandHandler.executeCommand(cardCommandMock);

        verify(cardProcessingService).processCards(any());
    }
}
