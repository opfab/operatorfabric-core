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

import org.apache.avro.io.DatumReader;
import org.apache.avro.io.Decoder;
import org.apache.avro.io.DecoderFactory;
import org.apache.avro.specific.SpecificDatumReader;
import org.apache.kafka.common.errors.SerializationException;
import org.apache.kafka.common.serialization.Deserializer;
import org.opfab.avro.CardCommand;

import java.io.IOException;

public class KafkaAvroWithoutRegistryDeserializer implements Deserializer<CardCommand> {

    private final DatumReader<CardCommand> datumReader = new SpecificDatumReader<>(CardCommand.class);

    @Override
    public CardCommand deserialize(String s, byte[] payload) {
        if (payload == null) {
            return null;
        } else {
            try {
                Decoder decoder = DecoderFactory.get().binaryDecoder(payload, null);
                return datumReader.read(null, decoder);
            } catch (RuntimeException | IOException ex) {
                throw new SerializationException("Error deserializing Avro message", ex);
            }
        }
    }
}
