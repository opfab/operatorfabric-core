/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.utilities.json;

import com.fasterxml.jackson.databind.module.SimpleModule;

import java.time.Instant;

/**
 * Jackson (JSON) Module configuration to handle {@link Instant} as number of milliseconds since Epoch
 *
 * @author Alexandra Guironnet
 */
public class InstantModule extends SimpleModule {

    public InstantModule() {

        addSerializer(Instant.class, new CustomInstantSerializer());
        addDeserializer(Instant.class, new CustomInstantDeserializer());
    }
}
