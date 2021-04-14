/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.configuration.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.cards.publication.kafka.command.CommandHandler;
import org.lfenergy.operatorfabric.cards.publication.kafka.consumer.CardCommandConsumerListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
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
@ConditionalOnProperty("spring.kafka.consumer.group-id")
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
        return 1000L;
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
