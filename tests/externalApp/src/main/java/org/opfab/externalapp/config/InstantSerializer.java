/* Copyright (c) 2018-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externalapp.config;

import tools.jackson.core.JsonGenerator;
import tools.jackson.databind.ser.std.StdSerializer;
import tools.jackson.databind.SerializationContext;

import java.time.Instant;

/**
 * Custom serializer to serialize {@link Instant} as number of milliseconds from
 * Epoch rather than timestamp.
 *
 *
 */
public class InstantSerializer extends StdSerializer<Instant> {

    protected InstantSerializer(Class<Instant> t) {
        super(t);
    }

    public InstantSerializer() {
        this(null);
    }

    @Override
    public void serialize(Instant value, JsonGenerator gen, SerializationContext ctxt) {
        gen.writeNumber(value.toEpochMilli());
    }
}
