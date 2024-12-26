/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.kafka.integration;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opfab.avro.CardCommand;
import org.opfab.cards.publication.kafka.CardObjectMapper;
import org.opfab.cards.publication.kafka.card.CardCommandFactory;
import org.opfab.cards.publication.kafka.consumer.KafkaAvroWithoutRegistryDeserializer;
import org.opfab.cards.publication.kafka.producer.KafkaAvroWithoutRegistrySerializer;
import org.opfab.cards.publication.model.*;


import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;

@ExtendWith(MockitoExtension.class)

class KafkaSerializeDeserializeShould {

    @Test
    void SerializeDeserialize() {
        CardCommandFactory cardCommandFactory = new CardCommandFactory(new CardObjectMapper());
        CardCommand cardCommand = cardCommandFactory.createResponseCard(createCardPublicationData());

        byte[] byteResult;
        try (KafkaAvroWithoutRegistrySerializer<CardCommand> kafkaAvroSerializer = new KafkaAvroWithoutRegistrySerializer<>()) {
            byteResult = kafkaAvroSerializer.serialize("TOPIC", cardCommand);
        }

        try (KafkaAvroWithoutRegistryDeserializer kafkaAvroDeSerializer = new KafkaAvroWithoutRegistryDeserializer()) {
            CardCommand cardResult = kafkaAvroDeSerializer.deserialize("TOPIC", byteResult);
            assertThat(cardResult, is(cardCommand));
        }
    }

    private Card createCardPublicationData() {
        return Card.builder().publisher("PUBLISHER_1").processVersion("O")
                .id("124454")
                .uid("uid293454")
                .parentCardId("myParent1234")
                .timeSpans(List.of(new TimeSpan(
                        Instant.now(),
                        Instant.now().plus(2, ChronoUnit.HOURS))))
                .processInstanceId("PROCESS_1").severity(SeverityEnum.INFORMATION)
                .title(new I18n("title", null))
                .summary(new I18n("summary", null))
                .startDate(Instant.now())
                .process("process5")
                .state("state5")
                .build();
    }
}
