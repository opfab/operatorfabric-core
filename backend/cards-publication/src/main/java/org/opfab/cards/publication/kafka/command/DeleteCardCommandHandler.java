/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * Copyright (c) 2021-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.kafka.command;

import java.time.Instant;

import org.opfab.avro.Card;
import org.opfab.avro.CardCommand;
import org.opfab.avro.CommandType;
import org.opfab.cards.publication.configuration.Services;
import org.springframework.stereotype.Component;

@Component
public class DeleteCardCommandHandler extends BaseCommandHandler implements CommandHandler {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DeleteCardCommandHandler.class);

    private final Services services;

    public DeleteCardCommandHandler(Services services) {
        this.services = services;
    }

    @Override
    public CommandType getCommandType() {
        return CommandType.DELETE_CARD;
    }

    @Override
    public void executeCommand(CardCommand cardCommand) {
        Card kafkaCard = cardCommand.getCard();
        log.debug("Received Kafka DELETE CARD with processInstanceId {}, taskId {} and variables: {}",
                kafkaCard.getProcessInstanceId(), kafkaCard.getProcess(), kafkaCard.getData());

        org.opfab.cards.publication.model.Card card = buildCardPublicationData(cardCommand);
        if (card != null) {
            if (card.id == null || card.id.isEmpty()) {
                card.prepare(card.publishDate);
            }
            services.getCardDeletionService().deleteCardById(card.id, Instant.now(), null);
        }
    }
}
