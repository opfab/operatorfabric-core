package org.lfenergy.operatorfabric.cards.publication.kafka.consumer;

import org.apache.avro.specific.SpecificDatumReader;
import org.lfenergy.operatorfabric.avro.CardCommand;

public class CardCommandConsumerDeserializer extends BaseAvroDeserializer<CardCommand> {

    public CardCommandConsumerDeserializer() {
        super(new SpecificDatumReader<>(CardCommand.class));
    }

}
