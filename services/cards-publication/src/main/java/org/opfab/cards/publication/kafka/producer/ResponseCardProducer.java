/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.kafka.producer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.opfab.avro.CardCommand;
import org.opfab.cards.publication.kafka.card.CardCommandFactory;
import org.opfab.cards.publication.model.CardPublicationData;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;
import org.springframework.util.concurrent.ListenableFuture;
import org.springframework.util.concurrent.ListenableFutureCallback;

@Slf4j
@RequiredArgsConstructor
@Component
public class ResponseCardProducer {
    private final KafkaTemplate<String, CardCommand> kafkaTemplate;
    private final CardCommandFactory cardCommandFactory;

    @Value("${opfab.kafka.topics.response-card.topicname:opfab-response}")
    private String topic;

    public void send(CardPublicationData cardPublicationData) {
        log.debug("ResponseCard: {}", cardPublicationData.toString());

        CardCommand cardCommand = cardCommandFactory.create(cardPublicationData);

        ListenableFuture<SendResult<String, CardCommand>> future =
                kafkaTemplate.send(topic, cardCommand.getCard().getProcess(), cardCommand);
        future.addCallback(new ListenableFutureCallback<SendResult<String, CardCommand>>() {
            @Override
            public void onFailure(Throwable throwable) {
                log.error("Failure to send responseCard: {}", throwable.getMessage());
            }

            @Override
            public void onSuccess(SendResult<String, CardCommand> sendResult) {
                RecordMetadata metaData = sendResult.getRecordMetadata();
                log.debug("Received new metadata. \n" +
                        "Topic: " + metaData.topic() + "\n" +
                        "Partition: " + metaData.partition() + "\n" +
                        "Offset: " + metaData.offset() + "\n" +
                        "Timestamp: " + metaData.timestamp()
                );
                log.debug(sendResult.getProducerRecord().value().toString());
            }
        });
    }
}
