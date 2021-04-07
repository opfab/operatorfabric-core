/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.lfenergy.operatorfabric.cards.publication.kafka.command;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.services.CardProcessingService;
import org.opfab.client.avro.Card;
import org.opfab.client.avro.CardCommand;
import org.opfab.client.avro.CommandType;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

@Slf4j
@RequiredArgsConstructor
@Component
public class CreateCardCommandHandler extends BaseCommandHandler implements CommandHandler {

    private final CardProcessingService cardProcessingService;

    @Override
    public CommandType getCommandType() {
        return CommandType.CREATE_CARD;
    }

    @Override
    public void executeCommand(CardCommand cardCommand)  {
        Card kafkaCard = cardCommand.getCard();
        log.debug("Received Kafka CREATE CARD with processInstanceId {}, taskId {} and variables: {}",
                kafkaCard.getProcessInstanceId(), kafkaCard.getProcess(), kafkaCard.getData());

        CardPublicationData card = buildCardPublicationData(cardCommand);
        if (card != null) {
            cardProcessingService.processCards(Flux.just(card)).subscribe();
        }
    }
}
