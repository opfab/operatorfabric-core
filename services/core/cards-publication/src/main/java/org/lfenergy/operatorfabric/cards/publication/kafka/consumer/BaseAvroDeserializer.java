package org.lfenergy.operatorfabric.cards.publication.kafka.consumer;

import org.apache.avro.io.DatumReader;
import org.apache.avro.io.DecoderFactory;
import org.apache.avro.specific.SpecificRecord;
import org.apache.kafka.common.errors.SerializationException;
import org.apache.kafka.common.serialization.Deserializer;

import java.io.IOException;

public class BaseAvroDeserializer<T extends SpecificRecord> implements Deserializer<T> {

    private final DecoderFactory decoderFactory = DecoderFactory.get();
    private final DatumReader<T> datumReader;

    protected BaseAvroDeserializer(DatumReader<T> datumReader) {
        this.datumReader = datumReader;
    }

    @Override
    public T deserialize(String s, byte[] payload) {
        if (payload == null) {
            return null;
        } else {
            try {
                return datumReader.read(null, this.decoderFactory.binaryDecoder(payload, null));
            } catch (IOException ex) {
                throw new SerializationException("Error deserializing Avro message", ex);
            }
        }
    }
}
