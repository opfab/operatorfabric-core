package org.lfenergy.operatorfabric.cards.publication.kafka.command;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.avro.Card;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.avro.CommandType;
import org.lfenergy.operatorfabric.cards.publication.model.CardCreationReportData;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.services.CardProcessingService;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import reactor.core.publisher.Mono;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = {"native", "test"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CreateCardCommandHandlerShould {

    CardProcessingService cardProcessingService;
    ObjectMapper objectMapper;
    CreateCardCommandHandler createCardCommandHandler;

    @BeforeAll
    public void setUp() {
        cardProcessingService = mock(CardProcessingService.class);
        objectMapper = mock(ObjectMapper.class);
        createCardCommandHandler = new CreateCardCommandHandler(cardProcessingService, objectMapper);
    }

    @Test
    void getCommandType() {
        assertThat(createCardCommandHandler.getCommandType().equals(CommandType.CREATE_CARD));
    }

    @Test
    void executeCommand() throws JsonProcessingException {
        CardCommand cardCommandMock = mock(CardCommand.class);
        CardPublicationData cardPublicationDataMock = mock (CardPublicationData.class);
        Card cardMock = mock(Card.class);
        when(cardCommandMock.getCard()).thenReturn(cardMock);
        when(objectMapper.writeValueAsString(any())).thenReturn("");
        when(objectMapper.readValue(anyString(), eq(CardPublicationData.class))).thenReturn(cardPublicationDataMock);
        when(cardProcessingService.processCards(any())).thenReturn(Mono.just(new CardCreationReportData()));
        createCardCommandHandler.executeCommand(cardCommandMock);

        verify(cardProcessingService).processCards(any());
    }

    @Test
    void executeCommandNoCard() throws JsonProcessingException {
        CreateCardCommandHandler createCardCommandHandlerRealMapper = new CreateCardCommandHandler(cardProcessingService, new ObjectMapper());

        CardCommand cardCommandMock = mock(CardCommand.class);
        CardPublicationData cardPublicationDataMock = mock (CardPublicationData.class);
        Card cardMock = mock(Card.class);
        when(cardCommandMock.getCard()).thenReturn(cardMock);
        when(objectMapper.writeValueAsString(any())).thenReturn("");
        when(objectMapper.readValue(anyString(), eq(CardPublicationData.class))).thenReturn(cardPublicationDataMock);
        when(cardProcessingService.processCards(any())).thenReturn(Mono.just(new CardCreationReportData()));
        createCardCommandHandlerRealMapper.executeCommand(cardCommandMock);

        verify(cardProcessingService, times(0)).processCards(any());
    }
}
