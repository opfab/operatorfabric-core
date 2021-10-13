/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */package org.opfab.cards.publication.kafka.consumer;

import org.apache.avro.io.DatumReader;
import org.apache.kafka.common.errors.SerializationException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opfab.avro.CardCommand;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = "test")
class KafkaAvroWithoutRegistryDeserializerShould {

    private KafkaAvroWithoutRegistryDeserializer cut;

    @BeforeEach
    void setUp() {
        cut =  new KafkaAvroWithoutRegistryDeserializer();
    }

    @Test
    void deserializeNoPayLoad() {
        assertNull (cut.deserialize("something", null));
    }

    @Test
    void deserializeWithPayload() throws IOException {
        DatumReader<CardCommand> datumReader = mock(DatumReader.class);
        ReflectionTestUtils.setField(cut, "datumReader", datumReader);

        byte[] payload = {0,1,2,3};
        cut.deserialize("something", payload);
        verify (datumReader).read(any(), any());
    }

    @Test
    void deserializeInvalidPayload() {
        byte[] bytes = "something".getBytes();
        Assertions.assertThrows(SerializationException.class, () ->
                cut.deserialize("something", bytes));
    }
}
