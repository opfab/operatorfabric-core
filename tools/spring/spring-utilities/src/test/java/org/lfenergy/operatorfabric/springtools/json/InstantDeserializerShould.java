package org.lfenergy.operatorfabric.springtools.json;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Java6Assertions.fail;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class for custom deserializer for {@link Instant}
 *
 *
 * @author Alexandra Guironnet
 */
public class InstantDeserializerShould {

    private static final Logger log = LoggerFactory.getLogger(InstantDeserializer.class);

    private static ObjectMapper objectMapper;
    private static InstantDeserializer instantDeserializer;

    @BeforeAll
    public static void setup(){
        objectMapper = new ObjectMapper();
        instantDeserializer = new InstantDeserializer();
        objectMapper.registerModule(new SimpleModule().addDeserializer(Instant.class, instantDeserializer));
    }

    @Test
    public void shouldDeserializeMillisFromEpochAsInstant () {

        String jsonString = "123456789";

        Instant expectedDeserialization = Instant.ofEpochMilli(123456789L);

        try {
            Instant actualDeserialization = objectMapper.readValue(jsonString, Instant.class);
            assertThat(actualDeserialization).isEqualTo(expectedDeserialization);
        } catch (IOException e) {
            log.error(String.format("Unable to deserialize %s", Instant.class.getSimpleName()), e);
            fail("Exception thrown: "+e.getMessage());
        }

    }

    @Test
    public void shouldThrowErrorOnIncorrectJson () {

        String jsonString = "123456789AZ";

        try {
            Instant actualDeserialization = objectMapper.readValue(jsonString, Instant.class);
            fail("Expected exception not thrown.");
        } catch (IOException e) {
            assertTrue(e instanceof IOException);
        }

    }


    @Test
    public void shouldDeserializeNullAsNull () {

        String jsonString= "null";

        try {
            Instant actualDeserialization = objectMapper.readValue(jsonString, Instant.class);
            assertNull(actualDeserialization);
        } catch (Exception e) {
            log.error(String.format("Unable to deserialize %s", Instant.class.getSimpleName()), e);
        }

    }


}
