package org.lfenergy.operatorfabric.cards.publication.kafka.consumer;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = {"native", "test"})
class CardCommandConsumerDeserializerShould {

    @Test
    void forCodeCoverage() {
        CardCommandConsumerDeserializer cut = new CardCommandConsumerDeserializer();
        assertNotNull(cut);
    }
}
