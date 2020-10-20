package org.lfenergy.operatorfabric.cards.publication.kafka.command;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.avro.Card;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.cards.publication.kafka.CardObjectMapper;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Collections;
import java.util.Map;


@Slf4j
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BaseCommandHandler {

    @Autowired
    private CardObjectMapper objectMapper;

    protected CardPublicationData buildCardPublicationData(CardCommand cardCommand) {
        Card kafkaCard = cardCommand.getCard();

        CardPublicationData card = null;
        Map<String, Object> cardData = Collections.emptyMap();
        try {
            card = objectMapper.readValue(objectMapper.writeValueAsString(kafkaCard), CardPublicationData.class);
            card.setProcess(cardCommand.getProcess());
            card.setProcessInstanceId(cardCommand.getProcessInstanceId());

            String cardDataString = kafkaCard.getData();
            if (cardDataString != null) {
                cardData = objectMapper.readValue(cardDataString, new TypeReference<Map<String, Object>>() {
                });
            }
            card.setData(cardData);
        } catch (JsonProcessingException e) {
            log.error("Unable to serialize card {} into CardPublicationData. Message: {}", kafkaCard, e.getMessage());
        }
        return card;
    }
}
