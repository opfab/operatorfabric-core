package org.lfenergy.operatorfabric.cards.publication.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.lfenergy.operatorfabric.avro.Card;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class CardObjectMapper {

    private final ObjectMapper objectMapper;

    public CardObjectMapper() {
        this.objectMapper = new ObjectMapper();
        objectMapper.enable(MapperFeature.REQUIRE_SETTERS_FOR_GETTERS);
    }

    public String writeValueAsString(Card kafkaCard) throws JsonProcessingException {
        return objectMapper.writeValueAsString(kafkaCard);
    }

    public CardPublicationData readValue(String writeValueAsString, Class<CardPublicationData> clazz) throws JsonProcessingException {
        return objectMapper.readValue(writeValueAsString, clazz);
    }

    public Map<String,Object> readValue(String writeValueAsString, TypeReference<Map<String,Object>> typeReference) throws JsonProcessingException {
        return objectMapper.readValue(writeValueAsString, typeReference);
    }
}
