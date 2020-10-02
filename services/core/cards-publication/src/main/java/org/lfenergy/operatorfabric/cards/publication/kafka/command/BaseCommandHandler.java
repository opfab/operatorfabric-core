package org.lfenergy.operatorfabric.cards.publication.kafka.command;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.avro.Card;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


@Component
@Slf4j
public abstract class BaseCommandHandler {
    private final ObjectMapper objectMapper;

    public BaseCommandHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        // REQUIRE_SETTERS_FOR_GETTERS is needed to prevent the AVRO getSchema() call from being serialized
        this.objectMapper.enable(MapperFeature.REQUIRE_SETTERS_FOR_GETTERS);
    }

    protected CardPublicationData buildCardPublicationData(CardCommand cardCommand) {
        Card kafkaCard = cardCommand.getCard();


        CardPublicationData card = null;
        try {
            card = objectMapper.readValue(objectMapper.writeValueAsString(kafkaCard), CardPublicationData.class);
            card.setProcess(cardCommand.getProcess());
            card.setProcessInstanceId(cardCommand.getProcessInstanceId());

        } catch (JsonProcessingException e) {
            log.error("Unable to serialize card {} into CardPublicationData. Message: {}", kafkaCard, e.getMessage());
        }
        return card;
    }
}
