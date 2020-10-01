package org.lfenergy.operatorfabric.cards.publication.kafka.consumer;

import lombok.NoArgsConstructor;
import org.apache.avro.io.DatumReader;
import org.apache.avro.io.DecoderFactory;
import org.apache.avro.specific.SpecificDatumReader;
import org.apache.kafka.common.errors.SerializationException;
import org.apache.kafka.common.serialization.Deserializer;
import org.lfenergy.operatorfabric.avro.CardCommand;

import java.io.IOException;

@NoArgsConstructor
public class CardCommandConsumerDeserializer implements Deserializer<CardCommand> {

    private final DecoderFactory decoderFactory = DecoderFactory.get();
    private final DatumReader<CardCommand> datumReader = new SpecificDatumReader<>();

    @Override
    public CardCommand deserialize(String s, byte[] payload) {
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
