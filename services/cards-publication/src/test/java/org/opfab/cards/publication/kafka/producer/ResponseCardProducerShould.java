/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.cards.publication.kafka.producer;

import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opfab.avro.CardCommand;
import org.opfab.avro.ResponseCard;
import org.opfab.cards.publication.kafka.card.CardCommandFactory;
import org.opfab.cards.publication.model.CardPublicationData;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.concurrent.CompletableFuture;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = "test")
class ResponseCardProducerShould {

    @Mock
    private KafkaTemplate<String, CardCommand> kafkaTemplate;

    @Mock
    private CardCommandFactory cardCommandFactory;

    @InjectMocks
    private ResponseCardProducer cut;

    private  SendResult<String, CardCommand> sendResult;
    private CompletableFuture<SendResult<String, CardCommand>> responseFuture;
    private CardPublicationData cardPublicationData;
    private CardCommand cardCommand;


    private final int partition = 11;
    private final int offset = 2;
    private final String topic = "MYTOPIC";
    private final String key = "MyKey";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(cut,"topic", topic);

        cardPublicationData = mock(CardPublicationData.class);
        cardCommand = mock(CardCommand.class);
        ResponseCard card = mock(ResponseCard.class);
        when(card.getProcess()).thenReturn(key);
        when(cardCommand.getResponseCard()).thenReturn(card);
        when (cardCommandFactory.createResponseCard(any())).thenReturn(cardCommand);

        responseFuture = new CompletableFuture<>();
        sendResult = mock(SendResult.class);

        when(kafkaTemplate.send(topic, key, cardCommand)).thenReturn(responseFuture);
    }
    @Test
    void sendSuccess() {
        ProducerRecord producerRecord = mock (ProducerRecord.class);
        when (producerRecord.value()).thenReturn(cardCommand);
        when(sendResult.getProducerRecord()).thenReturn(producerRecord);

        RecordMetadata recordMetadata = mock(RecordMetadata.class);
        when(sendResult.getRecordMetadata()).thenReturn(recordMetadata);

        cut.send(cardPublicationData);
        responseFuture.complete(sendResult);

        verify(kafkaTemplate, times(1)).send(topic, key, cardCommand);
        verify(sendResult).getRecordMetadata();
    }

    @Test
    void testFailure() {
        Throwable ex = mock (Throwable.class);

        cut.send(cardPublicationData);
        responseFuture.completeExceptionally(ex);
        verify(kafkaTemplate, times(1)).send(topic, key, cardCommand);
        verify(ex).getMessage();

    }
}
