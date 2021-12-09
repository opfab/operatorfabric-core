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

import org.apache.kafka.common.errors.SerializationException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.avro.*;
import org.opfab.cards.publication.kafka.consumer.KafkaAvroWithoutRegistryDeserializer;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = "test")
class KafkaAvroWithoutRegistrySerializerShould {

    @InjectMocks
    KafkaAvroWithoutRegistrySerializer cut;

    @Test
    void serializeRoundTripSuccess() {
        KafkaAvroWithoutRegistryDeserializer deserializer = new KafkaAvroWithoutRegistryDeserializer();
        String topic = "MyTopic";

        Card card = createCard();
        CardCommand cardCommand = createCardCommand(card);

        CardCommand cardCommandRoundTrip = deserializer.deserialize(topic, cut.serialize(topic, cardCommand));
        assertThat(cardCommandRoundTrip, is(cardCommand));
    }

    @Test
    void testNullRecord() {
        byte[] result = cut.serialize("ATopic", null);
        assertThat (result.length, is(0));
    }

    @Test
    void testException() {
        CardCommand cardCommand = mock (CardCommand.class);
        assertThrows(SerializationException.class, () -> cut.serialize("Topic", cardCommand));
    }

    private Card createCard() {
        Instant startDate = Instant.now().truncatedTo(ChronoUnit.SECONDS);

        return Card.newBuilder()
                .setProcess("Process")
                .setProcessInstanceId("InstanceId")
                .setPublisher("Publisher")
                .setProcessVersion("ProcessVersion")
                .setStartDate(startDate)
                .setEndDate(startDate.plus(1, ChronoUnit.HOURS))
                .setSeverity(SeverityType.ALARM)
                .setTitle(new I18n("Title", null))
                .setSummary(new I18n("Summary", null))
                .setTimeSpans(List.of(Timespan.newBuilder()
                                .setStart(startDate.plus(10, ChronoUnit.MINUTES))
                                .setEnd(startDate.plus(50, ChronoUnit.MINUTES))
                        .build()))
                .build();
    }

    private CardCommand createCardCommand(Card card) {
        return CardCommand.newBuilder()
                .setCommand(CommandType.CREATE_CARD)
                .setCard(card)
                .build();
    }
}
