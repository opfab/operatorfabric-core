package org.lfenergy.operatorfabric.cards.publication.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.lfenergy.operatorfabric.avro.Card;
import org.lfenergy.operatorfabric.cards.publication.configuration.json.CardsModule;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.springtools.json.InstantModule;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class CardObjectMapper {

    private final ObjectMapper objectMapper;

    public CardObjectMapper() {
        this.objectMapper = new ObjectMapper();
        objectMapper.enable(MapperFeature.REQUIRE_SETTERS_FOR_GETTERS);
        objectMapper.registerModule(new Jdk8Module());
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.registerModule(new CardsModule());
        objectMapper.registerModule(new InstantModule());
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
