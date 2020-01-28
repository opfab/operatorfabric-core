
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
