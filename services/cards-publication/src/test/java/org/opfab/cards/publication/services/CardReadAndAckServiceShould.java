
/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.services;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.cards.publication.application.UnitTestApplication;
import org.opfab.cards.publication.mocks.CardRepositoryMock;
import org.opfab.cards.publication.model.Card;
import org.opfab.test.EventBusSpy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = { UnitTestApplication.class })
class CardReadAndAckServiceShould {

    @Autowired
    private ObjectMapper objectMapper;

    private CardReadAndAckService cardReadAndAckService;
    private EventBusSpy eventBusSpy;
    private CardNotificationService cardNotificationService;

    @Autowired
    private CardRepositoryMock cardRepositoryMock;

    @BeforeEach
    void init() {
        eventBusSpy = new EventBusSpy();
        cardNotificationService = new CardNotificationService(eventBusSpy, objectMapper, null);
        cardReadAndAckService = new CardReadAndAckService(
                cardNotificationService,
                cardRepositoryMock);
        cardRepositoryMock.clear();
        eventBusSpy.clearMessageSent();
    }

    @Test
    void GIVEN_a_card_WHEN_reset_reads_and_acks_THEN_card_event_UPDATE_is_sent_to_eventBus() {
        Card card = TestHelpers.generateOneCard();
        cardRepositoryMock.saveCard(card);
        cardReadAndAckService.resetReadAndAcks(card.uid);
        Assertions.assertThat(eventBusSpy.getMessagesSent().get(0)[1]).contains("{\"type\":\"UPDATE\"");
    }
}
