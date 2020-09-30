package org.lfenergy.operatorfabric.cards.publication.kafka.command;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.*;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.avro.Card;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.cards.publication.model.*;
import org.lfenergy.operatorfabric.cards.publication.services.CardProcessingService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Collections;
import java.util.Map;


@Slf4j
@NoArgsConstructor
public abstract class BaseCommandHandler {

    @Autowired
    protected CardProcessingService cardProcessingService;

    @Autowired
    private Gson gson;

    @Autowired
    private ObjectMapper mapper;

    protected CardPublicationData buildCardPublicationData(CardCommand cardCommand) {
        Card kafkaCard = cardCommand.getCard();

        // Need to use gson here for now due to Kafka/Avro
        CardPublicationData card = gson.fromJson(gson.toJson(kafkaCard), CardPublicationData.class);
        card.setProcess(cardCommand.getProcess());
        card.setProcessInstanceId(cardCommand.getProcessInstanceId());

        Map<String, Object> cardData = Collections.emptyMap();
        String cardDataString = kafkaCard.getData();
        if (cardDataString != null) {
            try {
                cardData = mapper.readValue(cardDataString, new TypeReference<Map<String, Object>>() {
                });
            } catch (JsonProcessingException e) {
                log.error("Failure reading card data {}", e.getMessage());
            }
        }
        card.setData(cardData);

        return card;
    }
}
