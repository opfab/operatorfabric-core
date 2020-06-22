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
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;

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
    public Instant deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {

        JsonToken t = p.currentToken();

        if(t == JsonToken.VALUE_NUMBER_INT) {
            return Instant.ofEpochMilli(p.getLongValue());
        } else throw new IOException("Expected VALUE_NUMBER_INT token.");

    }
}
