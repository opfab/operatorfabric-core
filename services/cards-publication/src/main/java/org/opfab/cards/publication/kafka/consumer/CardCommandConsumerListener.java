/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.kafka.consumer;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.opfab.avro.CardCommand;
import org.opfab.avro.CommandType;
import org.opfab.cards.publication.kafka.command.CommandHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
public class CardCommandConsumerListener {

    private final Map<CommandType,CommandHandler> commandHandlerMap;

    public CardCommandConsumerListener(List<CommandHandler> commandHandlerList) {
        commandHandlerMap = commandHandlerList.stream()
                .collect(Collectors.toMap(CommandHandler::getCommandType, it -> it));
    }

    @KafkaListener(topics = "${operatorfabric.cards-publication.kafka.topics.card.topicname:opfab}", containerFactory = "kafkaListenerContainerFactory")
    public void receivedCommand(@Payload ConsumerRecord<String, CardCommand> consumerRecord) {
        log.info("Key: {}, Value: {}, Partition: {}, Offset: {}",
                consumerRecord.key(), consumerRecord.value(), consumerRecord.partition(), consumerRecord.offset());
        CardCommand cardCommand = consumerRecord.value();
        log.debug("Received {}", cardCommand);

        CommandHandler commandHandler = commandHandlerMap.get(cardCommand.getCommand());
        if (commandHandler != null) {
            commandHandler.executeCommand(cardCommand);
        }
        else {
            throw new IllegalStateException("No command handler available for " + cardCommand.getCommand());
        }
    }
}
