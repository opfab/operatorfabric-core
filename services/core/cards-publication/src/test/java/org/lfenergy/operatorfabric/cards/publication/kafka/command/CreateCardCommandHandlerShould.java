package org.lfenergy.operatorfabric.cards.publication.kafka.command;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.avro.Card;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.avro.CommandType;
import org.lfenergy.operatorfabric.cards.publication.configuration.json.JacksonConfig;
import org.lfenergy.operatorfabric.cards.publication.model.CardCreationReportData;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.services.CardProcessingService;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.aggregation.VariableOperators;
import org.springframework.test.context.ActiveProfiles;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
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
        assertThat(createCardCommandHandler.getCommandType(), is(CommandType.CREATE_CARD));
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
        when(cardProcessingService.processCards(any())).thenReturn(Mono.just(new CardCreationReportData()));
        createCardCommandHandler.executeCommand(cardCommandMock);

        verify(cardProcessingService).processCards(any());
    }

    @Test
    void executeCommandNoCard() throws JsonProcessingException {
        reset (cardProcessingService);
        CreateCardCommandHandler createCardCommandHandlerRealMapper = new CreateCardCommandHandler(cardProcessingService, new ObjectMapper());

        CardCommand cardCommandMock = mock(CardCommand.class);
        Card cardMock = mock(Card.class);
        when(cardCommandMock.getCard()).thenReturn(cardMock);
        createCardCommandHandlerRealMapper.executeCommand(cardCommandMock);

        verify(cardProcessingService, times(0)).processCards(any());
    }

    @Test
    void executeCommandCardData() throws JsonProcessingException {
        reset (cardProcessingService);
        CardCommand cardCommandMock = mock(CardCommand.class);
        CardPublicationData cardPublicationDataMock = new CardPublicationData (); // CardPublicationData.class);
        Map<String, Object> map = new HashMap<>();
        map.put("Key", new BigDecimal(12));
        Card cardMock = mock(Card.class);

        when(cardMock.getData()).thenReturn("");
        when(cardCommandMock.getCard()).thenReturn(cardMock);
        when(objectMapper.writeValueAsString(any())).thenReturn("");
        when(objectMapper.readValue(anyString(), eq(CardPublicationData.class))).thenReturn(cardPublicationDataMock);
        when(objectMapper.readValue(anyString(), (TypeReference<Object>) any())).thenReturn(map);
        when(cardProcessingService.processCards(any())).thenReturn(Mono.just(new CardCreationReportData()));

        createCardCommandHandler.executeCommand(cardCommandMock);

        verify(cardProcessingService).processCards(any());
        assertThat(cardPublicationDataMock.getData(), is(map));
    }
}
