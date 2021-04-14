/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.springtools.json;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test class for custom serializer for {@link Instant}
 *
 *
 *
 */
public class InstantSerializerShould {

    private static final Logger log = LoggerFactory.getLogger(InstantSerializer.class);

    private static ObjectMapper objectMapper;
    private static InstantSerializer instantSerializer;

    @BeforeAll
    public static void setup(){
        objectMapper = new ObjectMapper();
        instantSerializer = new InstantSerializer();
        objectMapper.registerModule(new SimpleModule().addSerializer(Instant.class, instantSerializer));
    }

    @Test
    public void shouldSerializeInstantAsMillisFromEpoch () {

        long milliFromEpoch = 123456789L;
        Instant instant = Instant.ofEpochMilli(milliFromEpoch);

        String expectedSerialization = "123456789";
        String actualSerialization = null;

        try {
            actualSerialization = objectMapper.writeValueAsString(instant);
            assertThat(actualSerialization).isEqualTo(expectedSerialization);
        } catch (Exception e) {
            log.error(String.format("Unable to serialize %s", Instant.class.getSimpleName()), e);
        }

    }

    @Test
    public void shouldSerializeNullAsMillisFromEpoch () {

        Instant instant = null;

        String expectedSerialization = "null";

        try {
            String actualSerialization = objectMapper.writeValueAsString(instant);
            assertThat(actualSerialization).isEqualTo(expectedSerialization);
        } catch (JsonProcessingException e) {
            log.error(String.format("Unable to serialize %s", Instant.class.getSimpleName()), e);
        }


    }


}
