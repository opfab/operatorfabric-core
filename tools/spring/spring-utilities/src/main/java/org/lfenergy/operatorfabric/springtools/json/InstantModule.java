
package org.lfenergy.operatorfabric.springtools.json;

import com.fasterxml.jackson.databind.module.SimpleModule;

import java.time.Instant;

/**
 * Jackson (JSON) Module configuration to handle {@link Instant} as number of milliseconds since Epoch
 *
 * @author Alexandra Guironnet
 */
public class InstantModule extends SimpleModule {

    public InstantModule() {

        addSerializer(Instant.class, new InstantSerializer());
        addDeserializer(Instant.class, new InstantDeserializer());
    }
}
