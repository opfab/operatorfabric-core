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

import org.apache.avro.Schema;
import org.apache.avro.io.BinaryEncoder;
import org.apache.avro.io.DatumWriter;
import org.apache.avro.io.EncoderFactory;
import org.apache.avro.specific.SpecificDatumWriter;
import org.apache.avro.specific.SpecificRecord;
import org.apache.kafka.common.errors.SerializationException;
import org.apache.kafka.common.serialization.Serializer;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

public class KafkaAvroWithoutRegistrySerializer<T extends SpecificRecord> implements Serializer<T> {

    private final EncoderFactory encoderFactory = EncoderFactory.get();

    @Override
    public byte[] serialize(String topic, T record) {
        if (record == null) {
            return new byte[0];
        } else {
            try {
                Schema schema = record.getSchema();

                ByteArrayOutputStream out = new ByteArrayOutputStream();
                BinaryEncoder encoder = this.encoderFactory.directBinaryEncoder(out, null);
                DatumWriter<T> writer = new SpecificDatumWriter<>(schema);
                writer.write(record, encoder);
                encoder.flush();

                byte[] bytes = out.toByteArray();
                out.close();
                return bytes;
            } catch (RuntimeException | IOException ioEx) {
                throw new SerializationException("Error serializing Avro message", ioEx);
            }
        }
    }
}
