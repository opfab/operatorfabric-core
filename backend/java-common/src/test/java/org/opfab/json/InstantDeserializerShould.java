/* Copyright (c) 2018-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.json;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertNull;

/**
 * Test class for custom deserializer for {@link Instant}
 *
 *
 *
 */
class InstantDeserializerShould {

    private static final Logger log = LoggerFactory.getLogger(InstantDeserializer.class);

    private static ObjectMapper objectMapper;

    @BeforeAll
    static void setup() {
        objectMapper = JsonMapper.builder().addModule(new InstantModule()).build();
    }

    @Test
    void shouldDeserializeMillisFromEpochAsInstant() {

        String jsonString = "123456789";

        Instant expectedDeserialization = Instant.ofEpochMilli(123456789L);

        try {
            Instant actualDeserialization = objectMapper.readValue(jsonString, Instant.class);
            assertThat(actualDeserialization).isEqualTo(expectedDeserialization);
        } catch (Exception e) {
            log.error(String.format("Unable to deserialize %s", Instant.class.getSimpleName()), e);
            throw new AssertionError("Exception thrown: " + e.getMessage());
        }

    }

    @Test
    void shouldDeserializeNullAsNull() {

        String jsonString = "null";

        try {
            Instant actualDeserialization = objectMapper.readValue(jsonString, Instant.class);
            assertNull(actualDeserialization);
        } catch (Exception e) {
            log.error(String.format("Unable to deserialize %s", Instant.class.getSimpleName()), e);
        }

    }

}
