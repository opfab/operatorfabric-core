/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.cards.publication.configuration.kafka;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.avro.CardCommand;
import org.opfab.cards.publication.kafka.command.CommandHandler;
import org.opfab.cards.publication.kafka.consumer.CardCommandConsumerListener;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.kafka.config.KafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.listener.ConcurrentMessageListenerContainer;
import org.springframework.test.context.ActiveProfiles;

import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = {"native", "test"})
class KafkaListenerContainerFactoryConfigurationShould {

    @Mock
    KafkaProperties kafkaProperties;

    @SuppressWarnings("unused")
    @Mock
    ConsumerFactory<String, CardCommand> consumerFactory;

    @InjectMocks
    KafkaListenerContainerFactoryConfiguration cut;

    @Test
    void kafkaListenerContainerFactory() {
        Integer concurrency = 123;
        Duration pollTimeout= Duration.ofMillis(123123);
        KafkaProperties.Listener listenerMock = mock (KafkaProperties.Listener.class);
        when(listenerMock.getPollTimeout()).thenReturn(pollTimeout);
        when (listenerMock.getConcurrency()).thenReturn(concurrency);

        when (kafkaProperties.getListener()).thenReturn(listenerMock);
        KafkaListenerContainerFactory<ConcurrentMessageListenerContainer<String, CardCommand>> kafkaListenerContainerFactory = cut.kafkaListenerContainerFactory();

        assertNotNull(kafkaListenerContainerFactory);

        ConcurrentMessageListenerContainer container = kafkaListenerContainerFactory.createContainer("dummyTopic");
        assertThat (container.getConcurrency()).isEqualTo(concurrency);
        assertThat (container.getContainerProperties().getPollTimeout()).isEqualTo(pollTimeout.toMillis());
    }

    @Test
    void kafkaListenerContainerFactoryWithDefaults() {
        KafkaProperties.Listener listenerMock = mock (KafkaProperties.Listener.class);
        when (listenerMock.getConcurrency()).thenReturn(null);
        when (kafkaProperties.getListener()).thenReturn(listenerMock);
        KafkaListenerContainerFactory<ConcurrentMessageListenerContainer<String, CardCommand>> kafkaListenerContainerFactory = cut.kafkaListenerContainerFactory();

        assertNotNull(kafkaListenerContainerFactory);

        ConcurrentMessageListenerContainer container = kafkaListenerContainerFactory.createContainer("dummyTopic");
        assertThat (container.getConcurrency()).isGreaterThan(0);
        assertThat(container.getContainerProperties().getPollTimeout()).isGreaterThan(0);
    }

    @Test
    void createCardCommandConsumerListener() {
        List<CommandHandler> handlersMock = mock (List.class);
        CardCommandConsumerListener cardCommandConsumerListener = cut.createCardCommandConsumerListener(handlersMock);
        assertNotNull(cardCommandConsumerListener);
    }
}
