/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.lfenergy.operatorfabric.cards.publication.kafka.producer;

import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.apache.kafka.common.TopicPartition;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.avro.Card;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.cards.publication.kafka.card.CardCommandFactory;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.util.concurrent.ListenableFuture;
import org.springframework.util.concurrent.ListenableFutureCallback;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = {"native", "test"})
class ResponseCardProducerShould {

    @Mock
    private KafkaTemplate<String, CardCommand> kafkaTemplate;

    @Mock
    private CardCommandFactory cardCommandFactory;

    @InjectMocks
    private ResponseCardProducer cut;

    private  SendResult<String, CardCommand> sendResult;
    private ListenableFuture<SendResult<String, CardCommand>> responseFuture;
    private CardPublicationData cardPublicationData;
    private CardCommand cardCommand;
    private Card card;

    private final int partition = 11;
    private final int offset = 2;
    private final String topic = "MYTOPIC";
    private final String key = "MyKey";

    @BeforeEach
    private void setUp() {
        ReflectionTestUtils.setField(cut,"topic", topic);

        cardPublicationData = mock(CardPublicationData.class);
        cardCommand = mock(CardCommand.class);
        card = mock(Card.class);
        when(card.getProcess()).thenReturn(key);
        when(cardCommand.getCard()).thenReturn(card);
        when (cardCommandFactory.create(any())).thenReturn(cardCommand);

        responseFuture = mock(ListenableFuture.class);
        sendResult = mock(SendResult.class);

        when(kafkaTemplate.send(topic, key, cardCommand)).thenReturn(responseFuture);
    }
    @Test
    void sendSuccess() {
        ProducerRecord producerRecord = mock (ProducerRecord.class);
        when (producerRecord.value()).thenReturn(cardCommand);
        when(sendResult.getProducerRecord()).thenReturn(producerRecord);

        RecordMetadata recordMetadata = new RecordMetadata(new TopicPartition(topic, partition), offset, 0L, 0L, 0L, 0, 0);
        when(sendResult.getRecordMetadata()).thenReturn(recordMetadata);
        doAnswer( invocation -> {
            ListenableFutureCallback listenableFutureCallback = invocation.getArgument(0);
            listenableFutureCallback.onSuccess(sendResult);
            assertEquals(sendResult.getRecordMetadata().offset(), offset);
            assertEquals(sendResult.getRecordMetadata().partition(), partition);
            return null;
        }).when(responseFuture).addCallback(any(ListenableFutureCallback.class));

        cut.send(cardPublicationData);

        verify(kafkaTemplate, times(1)).send(topic, key, cardCommand);
    }

    @Test
    void testFailure() {
        Throwable ex = mock (Throwable.class);

        doAnswer( invocation -> {
            ListenableFutureCallback listenableFutureCallback = invocation.getArgument(0);
            listenableFutureCallback.onFailure(ex);
            return null;
        }).when(responseFuture).addCallback(any(ListenableFutureCallback.class));

        cut.send(cardPublicationData);

        verify(kafkaTemplate, times(1)).send(topic, key, cardCommand);
        verify(ex).getMessage();

    }
}
