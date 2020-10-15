package org.lfenergy.operatorfabric.autoconfigure.kafka;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = {"native", "test"})
class ConsumerFactoryAutoConfigurationShould {

    @Test
    void consumerFactory() {
        KafkaProperties kafkaPropertiesMock = mock(KafkaProperties.class);

        ConsumerFactory<String, CardCommand > consumerFactory = new ConsumerFactoryAutoConfiguration(kafkaPropertiesMock).consumerFactory();
        assertNotNull(consumerFactory);
        verify(kafkaPropertiesMock).buildConsumerProperties();
    }
}
