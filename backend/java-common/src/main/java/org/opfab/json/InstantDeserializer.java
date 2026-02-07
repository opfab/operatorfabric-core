/* Copyright (c) 2018-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.json;

import tools.jackson.core.JsonParser;
import tools.jackson.core.JsonTokenId;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.deser.std.StdDeserializer;

import java.time.Instant;

import tools.jackson.core.JacksonException;

/**
 * Custom deserializer to turn number of milliseconds from Epoch into
 * corresponding {@link Instant}
 *
 *
 */
public class InstantDeserializer extends StdDeserializer<Instant> {

    protected InstantDeserializer(Class<Instant> vc) {
        super(vc);
    }

    public InstantDeserializer() {
        this(Instant.class);
    }

    @Override
    public Instant deserialize(JsonParser parser, DeserializationContext ctxt) throws JacksonException {

        switch (parser.currentTokenId()) {
            case JsonTokenId.ID_NUMBER_INT:
                return Instant.ofEpochMilli(parser.getLongValue());

            case JsonTokenId.ID_STRING:
                // Handle ISO-8601 string format
                String text = parser.getString();
                if (text == null || text.isEmpty()) {
                    return null;
                }
                return Instant.parse(text);

            default:
                throw new IllegalArgumentException(
                        "Unexpected token type for Instant deserialization: " + parser.currentToken());
        }

    }
}
