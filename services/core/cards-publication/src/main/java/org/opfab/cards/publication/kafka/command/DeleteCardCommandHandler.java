/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.kafka.command;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opfab.avro.Card;
import org.opfab.avro.CardCommand;
import org.opfab.avro.CommandType;
import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.cards.publication.services.CardProcessingService;
import org.springframework.stereotype.Component;

@Slf4j
@RequiredArgsConstructor
@Component
public class DeleteCardCommandHandler extends BaseCommandHandler implements CommandHandler {

    private final CardProcessingService cardProcessingService;

    @Override
    public CommandType getCommandType() {
        return CommandType.DELETE_CARD;
    }

    @Override
    public void executeCommand(CardCommand cardCommand) {
        Card kafkaCard = cardCommand.getCard();
        log.debug("Received Kafka DELETE CARD with processInstanceId {}, taskId {} and variables: {}",
                kafkaCard.getProcessInstanceId(), kafkaCard.getProcess(), kafkaCard.getData());

        CardPublicationData card = buildCardPublicationData(cardCommand);
        if (card != null) {
            cardProcessingService.deleteCard(card);
        }
    }
}
