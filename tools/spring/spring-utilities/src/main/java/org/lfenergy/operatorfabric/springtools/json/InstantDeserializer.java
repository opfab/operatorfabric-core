/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.springtools.json;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonTokenId;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.IOException;
import java.time.Instant;

/**
 * Custom deserializer to turn number of milliseconds from Epoch into corresponding {@link Instant}
 *
 *
 */
public class InstantDeserializer extends StdDeserializer<Instant> {

    protected InstantDeserializer(Class<Instant> vc) {
        super(vc);
    }

    public InstantDeserializer() {
        this(null);
    }

    @Override
    public Instant deserialize(JsonParser parser, DeserializationContext ctxt) throws IOException {

        switch (parser.getCurrentTokenId()) {
            case JsonTokenId.ID_START_OBJECT:
                final ObjectNode node = new ObjectMapper().readValue(parser, ObjectNode.class);
                return Instant.ofEpochSecond(Long.parseLong(node.get("epochSecond").toString()),Long.parseLong(node.get("nano").toString()));

            case JsonTokenId.ID_NUMBER_INT:
                return Instant.ofEpochMilli(parser.getLongValue());
        }

        throw new IOException("Expected VALUE_NUMBER_INT or START_OBJECT token.");


    }
}
