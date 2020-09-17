package org.lfenergy.operatorfabric.cards.publication.configuration.json;

import com.google.gson.*;
import org.lfenergy.operatorfabric.cards.publication.model.I18n;
import org.lfenergy.operatorfabric.cards.publication.model.I18nPublicationData;
import org.lfenergy.operatorfabric.cards.publication.model.Recipient;
import org.lfenergy.operatorfabric.cards.publication.model.RecipientPublicationData;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.lang.reflect.Type;
import java.time.Instant;

@Configuration
public class GsonConfig {
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

    private static class I18nTypeConverter implements  JsonDeserializer<I18n> {
        @Override
        public I18n deserialize(JsonElement json, Type type, JsonDeserializationContext context)
                throws JsonParseException {
            return context.deserialize(json, I18nPublicationData.class);
        }
    }

    private static class RecipientTypeConverter implements  JsonDeserializer<Recipient> {
        @Override
        public Recipient deserialize(JsonElement json, Type type, JsonDeserializationContext context)
                throws JsonParseException {
            return context.deserialize(json, RecipientPublicationData.class);
        }
    }

    @Bean
    public Gson gson() {
        return new GsonBuilder()
                .registerTypeAdapter(Instant.class, new InstantTypeConverter())
                .registerTypeAdapter(I18n.class, new I18nTypeConverter())
                .registerTypeAdapter(Recipient.class, new RecipientTypeConverter())
                .create();
    }
}
