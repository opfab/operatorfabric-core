/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */package org.lfenergy.operatorfabric.cards.publication.kafka.consumer;

import org.apache.avro.io.BinaryDecoder;
import org.apache.avro.io.DatumReader;
import org.apache.avro.io.DecoderFactory;
import org.apache.kafka.common.errors.SerializationException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = {"native", "test"})
class KafkaAvroWithoutRegistryDeserializerShould {

    private DecoderFactory decoderFactory;

    private DatumReader datumReader;

    private KafkaAvroWithoutRegistryDeserializer cut;

    private BinaryDecoder binaryDecoder;

    private CardCommand cardCommand;

    @BeforeEach
    void setUp() {
        decoderFactory = mock(DecoderFactory.class);
        datumReader = mock(DatumReader.class);
        binaryDecoder = mock(BinaryDecoder.class);
        cardCommand = mock(CardCommand.class);
        cut = new KafkaAvroWithoutRegistryDeserializer();
        ReflectionTestUtils.setField(cut, "decoderFactory", decoderFactory);
        ReflectionTestUtils.setField(cut, "datumReader", datumReader);
    }

    @Test
    void deserializeNoPayLoad() {
        assertNull (cut.deserialize("something", null));
    }

    @Test
    void deserializeWithPayload() throws IOException {
        when(decoderFactory.binaryDecoder(any(), anyInt(), anyInt(), eq(null))).thenReturn(binaryDecoder);
        when(datumReader.read(null, binaryDecoder)).thenReturn(cardCommand);
        byte[] emptyBytes = new byte[] {0,0,0,0,0};
        byte[] payload = "something".getBytes();
        byte[] payloadWithEmptyBytes = new byte[5 + payload.length];
        System.arraycopy(emptyBytes, 0, payloadWithEmptyBytes, 0, 5);
        System.arraycopy(payload, 0, payloadWithEmptyBytes, 5, payload.length);
        cut.deserialize("something", payloadWithEmptyBytes);
        verify (datumReader).read(any(), any());
    }

    @Test
    void deserializeException() throws IOException {
        byte[] bytes = "something".getBytes();
        Assertions.assertThrows(SerializationException.class, () ->
                cut.deserialize("something", bytes));
    }
}
