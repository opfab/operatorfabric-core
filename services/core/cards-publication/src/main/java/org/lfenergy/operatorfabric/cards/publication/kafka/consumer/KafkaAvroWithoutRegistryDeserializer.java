package org.lfenergy.operatorfabric.cards.publication.kafka.consumer;

import org.apache.avro.io.BinaryDecoder;
import org.apache.avro.io.DatumReader;
import org.apache.avro.io.DecoderFactory;
import org.apache.avro.specific.SpecificDatumReader;
import org.apache.kafka.common.errors.SerializationException;
import org.apache.kafka.common.serialization.Deserializer;
import org.lfenergy.operatorfabric.avro.CardCommand;

import java.io.IOException;
import java.nio.ByteBuffer;

public class KafkaAvroWithoutRegistryDeserializer implements Deserializer<CardCommand> {

    private final DecoderFactory decoderFactory = DecoderFactory.get();
    private final DatumReader<CardCommand> datumReader = new SpecificDatumReader<>(CardCommand.class);

    private ByteBuffer getByteBuffer(byte[] payload) {
        ByteBuffer buffer = ByteBuffer.wrap(payload);
        if (buffer.get() != 0) {
            throw new SerializationException("Unknown magic byte!");
        } else {
            return buffer;
        }
    }

    @Override
    public CardCommand deserialize(String s, byte[] payload) {
        if (payload == null) {
            return null;
        } else {
            byte id = -1;

            try {
                ByteBuffer buffer = this.getByteBuffer(payload);
                buffer.getInt();   // read next 4 bytes
                String subject = null;

                int length = buffer.limit() - 1 - 4;
                int start = buffer.position() + buffer.arrayOffset();
                CardCommand result = datumReader.read((CardCommand) null, this.decoderFactory.binaryDecoder(buffer.array(), start, length, (BinaryDecoder) null));

                return result;
            } catch (RuntimeException | IOException ex) {
                throw new SerializationException("Error deserializing Avro message", ex);
            }
        }
    }
}
