package org.opfab.cards.publication.kafka.integration;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opfab.avro.CardCommand;
import org.opfab.cards.model.SeverityEnum;
import org.opfab.cards.publication.kafka.CardObjectMapper;
import org.opfab.cards.publication.kafka.card.CardCommandFactory;
import org.opfab.cards.publication.kafka.consumer.KafkaAvroWithoutRegistryDeserializer;
import org.opfab.cards.publication.kafka.producer.KafkaAvroWithoutRegistrySerializer;
import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.cards.publication.model.I18nPublicationData;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = "test")

public class KafkaSerializeDeserializeShould {

    @Test
    public void SerializeDeserialize() {
        CardCommandFactory cardCommandFactory = new CardCommandFactory(new CardObjectMapper());
        CardCommand cardCommand = cardCommandFactory.create(createCardPublicationData());

        KafkaAvroWithoutRegistrySerializer<CardCommand> kafkaAvroSerializer = new KafkaAvroWithoutRegistrySerializer<>();
        byte[] byteResult = kafkaAvroSerializer.serialize("TOPIC",cardCommand);

        KafkaAvroWithoutRegistryDeserializer kafkaAvroDeSerializer = new KafkaAvroWithoutRegistryDeserializer();
        CardCommand cardResult = kafkaAvroDeSerializer.deserialize("TOPIC", byteResult);
        assertThat(cardResult, is(cardCommand));
    }

    private CardPublicationData createCardPublicationData() {
        return CardPublicationData.builder().publisher("PUBLISHER_1").processVersion("O")
                .processInstanceId("PROCESS_1").severity(SeverityEnum.INFORMATION)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .process("process5")
                .state("state5")
                .build();
    }
}
