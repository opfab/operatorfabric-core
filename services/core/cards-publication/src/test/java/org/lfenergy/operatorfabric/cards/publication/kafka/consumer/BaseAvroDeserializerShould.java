package org.lfenergy.operatorfabric.cards.publication.kafka.consumer;

import org.apache.avro.io.DatumReader;
import org.apache.kafka.common.errors.SerializationException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = {"native", "test"})
class BaseAvroDeserializerShould {

    @Mock
    DatumReader datumReader;

    @InjectMocks
    private BaseAvroDeserializer baseAvroDeserializer;

    @Test
    void deserializeNoPayLoad() {
        assertNull (baseAvroDeserializer.deserialize("something", null));
    }

    @Test
    void deserializeWithPayload() throws IOException {
        byte[] bytes = "something".getBytes();
        baseAvroDeserializer.deserialize("something", bytes);
        verify (datumReader).read(any(), any());
    }

    @Test
    void deserializeException() throws IOException {
        byte[] bytes = "something".getBytes();
        when (datumReader.read(any(), any())).thenThrow(new IOException());
        Assertions.assertThrows(SerializationException.class, () ->
                baseAvroDeserializer.deserialize("something", bytes));
    }
}
