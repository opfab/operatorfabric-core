/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.springtools.json;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

import java.io.IOException;
import java.time.Instant;

/**
 * Custom serializer to serialize {@link Instant} as number of milliseconds from Epoch rather than timestamp.
 *
 * @author Alexandra Guironnet
 */
public class InstantSerializer extends StdSerializer<Instant> {

    protected InstantSerializer(Class<Instant> t) {
        super(t);
    }

    public InstantSerializer() {
        this(null);
    }

    @Override
    public void serialize(Instant value, JsonGenerator gen, SerializerProvider provider) throws IOException {
        gen.writeNumber(value.toEpochMilli());
    }
}
