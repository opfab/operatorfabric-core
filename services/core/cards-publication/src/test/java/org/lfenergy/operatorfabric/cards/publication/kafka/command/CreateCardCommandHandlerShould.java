package org.lfenergy.operatorfabric.cards.publication.kafka.command;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.test.util.ReflectionTestUtils;
import reactor.core.publisher.Mono;

import java.util.Map;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = {"native", "test"})
class CreateCardCommandHandlerShould {

    @Mock
    Gson gson;

    @Mock
    CardProcessingService cardProcessingService;

    @InjectMocks
    CreateCardCommandHandler createCardCommandHandler;

    @Test
    void getCommandType() {
        assertThat(createCardCommandHandler.getCommandType(), is(CommandType.CREATE_CARD));
    }

    @Test
    void executeCommand() {
        CardCommand cardCommandMock = mock(CardCommand.class);
        CardPublicationData cardPublicationDataMock = mock (CardPublicationData.class);
        Card cardMock = mock(Card.class);
        when(cardCommandMock.getCard()).thenReturn(cardMock);
        when(gson.fromJson((String) any(), any())).thenReturn(cardPublicationDataMock);
        when(cardProcessingService.processCards(any())).thenReturn(Mono.just(new CardCreationReportData()));
        createCardCommandHandler.executeCommand(cardCommandMock);

        verify(cardProcessingService).processCards(any());
    }


    @Test
    void deserializeOK() {
        ReflectionTestUtils.setField(createCardCommandHandler, "mapper", new ObjectMapper());
        String key1="key1";
        Integer value1 = 123;
        String key2 = "another key";
        String value2 ="another value";

        Map<String, Object> dataMap = deserializeCardDataTest("{\""+key1+"\":"+value1+",\""+key2+"\":\""+value2+"\"}");
        assertNotNull(dataMap);
        assertThat(dataMap.get(key1), is(value1));
        assertThat(dataMap.get(key2), is(value2));
    }

    @Test
    void deserializeWithError() {
        Map<String, Object> dataMap =  deserializeCardDataTest("{-}");
        assertNotNull(dataMap);
        assertThat(dataMap.isEmpty(),is(true));
    }

    private Map<String, Object>  deserializeCardDataTest(String cardData) {
        ReflectionTestUtils.setField(createCardCommandHandler, "mapper", new ObjectMapper());

        CardCommand cardCommandMock = mock(CardCommand.class);

        Card card = new Card();
        card.setData(cardData);

        when(cardCommandMock.getCard()).thenReturn(card);
        when(gson.fromJson((String) any(), any())).thenReturn(new CardPublicationData());

        CardPublicationData cardPublicationData = createCardCommandHandler.buildCardPublicationData(cardCommandMock);
        return ( Map<String, Object>) cardPublicationData.getData();
    }
}
