package org.lfenergy.operatorfabric.autoconfigure.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.cards.publication.kafka.command.CommandHandler;
import org.lfenergy.operatorfabric.cards.publication.kafka.consumer.CardCommandConsumerListener;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.KafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.listener.ConcurrentMessageListenerContainer;

import java.time.Duration;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Configuration
public class KafkaListenerContainerFactoryConfiguration {

    private final KafkaProperties kafkaProperties;

    private final ConsumerFactory<String, CardCommand> consumerFactory;

    private Integer getConcurrency(KafkaProperties.Listener listener) {
        Integer concurrency = listener.getConcurrency();
        if (concurrency != null) {
            return concurrency;
        }
        return 1;
    }

    private Long getPollTimeout(KafkaProperties.Listener listener) {
        Duration duration = listener.getPollTimeout();
        if (duration != null) {
            return duration.toMillis();
        }
        return 1000l;
    }

    @Bean
    public KafkaListenerContainerFactory<ConcurrentMessageListenerContainer<String, CardCommand>> kafkaListenerContainerFactory() {
        KafkaProperties.Listener listener = kafkaProperties.getListener();
        Integer concurrency = getConcurrency(listener);
        Long pollTimeOut = getPollTimeout(listener);
        log.info("Concurrency: " + concurrency);
        log.info("PollTimeout: " + pollTimeOut);
        ConcurrentKafkaListenerContainerFactory<String, CardCommand> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory);
        factory.setConcurrency(concurrency);
        factory.getContainerProperties().setPollTimeout(pollTimeOut);
        return factory;
    }

    @Bean
    CardCommandConsumerListener createCardCommandConsumerListener(List<CommandHandler> commandHandlerList) {
        return new CardCommandConsumerListener(commandHandlerList);
    }

}
