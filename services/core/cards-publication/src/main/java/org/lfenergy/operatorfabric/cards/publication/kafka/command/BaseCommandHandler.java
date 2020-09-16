package org.lfenergy.operatorfabric.cards.publication.kafka.command;

import com.google.gson.*;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.avro.Card;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.cards.publication.model.*;

import java.lang.reflect.Type;
import java.time.Instant;


@Slf4j
public class BaseCommandHandler {
    // TODO: Move Type Converters to own class
    private static class InstantTypeConverter
            implements JsonSerializer<Instant>, JsonDeserializer<Instant> {
        @Override
        public JsonElement serialize(Instant src, Type srcType, JsonSerializationContext context) {
            return new JsonPrimitive(src.toEpochMilli());
        }

        @Override
        public Instant deserialize(JsonElement json, Type type, JsonDeserializationContext context)
                throws JsonParseException {
            return Instant.ofEpochMilli(json.getAsLong());
        }
    }

    private static class I18nTypeConverter
            implements JsonSerializer<I18nPublicationData>, JsonDeserializer<I18n> {
        @Override
        public JsonElement serialize(I18nPublicationData src, Type srcType, JsonSerializationContext context) {
           return context.serialize(src);
        }

        @Override
        public I18n deserialize(JsonElement json, Type type, JsonDeserializationContext context)
                throws JsonParseException {
            return context.deserialize(json, I18nPublicationData.class);
        }
    }

    private static class RecipientTypeConverter
            implements JsonSerializer<RecipientPublicationData>, JsonDeserializer<Recipient> {
        @Override
        public JsonElement serialize(RecipientPublicationData src, Type srcType, JsonSerializationContext context) {
            return context.serialize(src);
        }

        @Override
        public Recipient deserialize(JsonElement json, Type type, JsonDeserializationContext context)
                throws JsonParseException {
            return context.deserialize(json, RecipientPublicationData.class);
        }
    }

    protected CardPublicationData buildCardPublicationData(CardCommand cardCommand) {
        Card kafkaCard = cardCommand.getCard();

        // TODO: Replace Gson with Jackson
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(Instant.class, new InstantTypeConverter())
                .registerTypeAdapter(I18n.class, new I18nTypeConverter())
                .registerTypeAdapter(Recipient.class, new RecipientTypeConverter())
                .create();
        CardPublicationData card = gson.fromJson(gson.toJson(kafkaCard), CardPublicationData.class);
        card.setId(cardCommand.getTaskId());
        card.setProcess(cardCommand.getProcessId());
        return card;
    }
}
