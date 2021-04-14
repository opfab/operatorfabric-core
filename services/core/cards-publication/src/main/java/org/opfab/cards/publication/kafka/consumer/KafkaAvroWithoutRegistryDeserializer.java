/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.kafka.consumer;

import org.apache.avro.io.BinaryDecoder;
import org.apache.avro.io.DatumReader;
import org.apache.avro.io.DecoderFactory;
import org.apache.avro.specific.SpecificDatumReader;
import org.apache.kafka.common.errors.SerializationException;
import org.apache.kafka.common.serialization.Deserializer;
import org.lfenergy.operatorfabric.avro.CardCommand;

import java.io.IOException;
import java.nio.ByteBuffer;

public class KafkaAvroWithoutRegistryDeserializer implements Deserializer<CardCommand> {

    private final DecoderFactory decoderFactory = DecoderFactory.get();
    private final DatumReader<CardCommand> datumReader = new SpecificDatumReader<>(CardCommand.class);

    private ByteBuffer getByteBuffer(byte[] payload) {
        ByteBuffer buffer = ByteBuffer.wrap(payload);
        if (buffer.get() != 0) {
            throw new SerializationException("Unknown magic byte!");
        } else {
            return buffer;
        }
    }

    @Override
    public CardCommand deserialize(String s, byte[] payload) {
        if (payload == null) {
            return null;
        } else {
            try {
                ByteBuffer buffer = this.getByteBuffer(payload);
                buffer.getInt();   // read next 4 bytes

                int length = buffer.limit() - 1 - 4;
                int start = buffer.position() + buffer.arrayOffset();
                return datumReader.read((CardCommand) null, this.decoderFactory.binaryDecoder(buffer.array(), start, length, (BinaryDecoder) null));
            } catch (RuntimeException | IOException ex) {
                throw new SerializationException("Error deserializing Avro message", ex);
            }
        }
    }
}
