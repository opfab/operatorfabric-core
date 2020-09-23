package org.lfenergy.operatorfabric.cards.publication.kafka.consumer;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.config.KafkaListenerContainerFactory;
import org.springframework.kafka.listener.ConcurrentMessageListenerContainer;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = {"native", "test"})
class CardCommandConsumerConfigurationShould {

    @InjectMocks
    private CardCommandConsumerConfiguration consumerConfig;

    @Test
    void kafkaListenerContainerFactory() {
        String groupId = "myGroupId";
        ReflectionTestUtils.setField(consumerConfig, "groupId", groupId);

        KafkaListenerContainerFactory<ConcurrentMessageListenerContainer<String, CardCommand>> container =
                consumerConfig.kafkaListenerContainerFactory();

        assertThat(groupId, is(container.createContainer("MyContainer").getGroupId()));
    }
}
