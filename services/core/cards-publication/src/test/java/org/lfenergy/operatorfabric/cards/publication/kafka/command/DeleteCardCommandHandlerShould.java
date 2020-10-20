package org.lfenergy.operatorfabric.cards.publication.kafka.command;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.avro.Card;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.avro.CommandType;
import org.lfenergy.operatorfabric.cards.publication.kafka.CardObjectMapper;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.services.CardProcessingService;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = {"native", "test"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class DeleteCardCommandHandlerShould {

    private CardProcessingService cardProcessingService;

    private CardObjectMapper objectMapper;

    private DeleteCardCommandHandler cut;

    @BeforeAll
    public void setUp() {
        cardProcessingService = mock(CardProcessingService.class);
        objectMapper = mock(CardObjectMapper.class);
        cut = new DeleteCardCommandHandler(cardProcessingService);
        ReflectionTestUtils.setField(cut, "objectMapper", objectMapper);
    }

    @Test
    void getCommandType() {
        assertThat(cut.getCommandType().equals(CommandType.DELETE_CARD));
    }

    @Test
    void executeCommand() throws JsonProcessingException {
        CardCommand cardCommandMock = mock(CardCommand.class);
        CardPublicationData cardPublicationDataMock = mock (CardPublicationData.class);
        Card cardMock = mock(Card.class);
        when(cardCommandMock.getCard()).thenReturn(cardMock);
        when(objectMapper.writeValueAsString(any())).thenReturn("");
        when(objectMapper.readValue(anyString(), eq(CardPublicationData.class))).thenReturn(cardPublicationDataMock);
        cut.executeCommand(cardCommandMock);

        verify(cardProcessingService, times(1)).deleteCard(any());
    }

}
